package repositories

import (
	"backend/internal/dto/request"
	"backend/internal/dto/response"
	"backend/internal/models"
	"fmt"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/lib/pq"
	"golang.org/x/crypto/openpgp/errors"
	"gorm.io/gorm"
)

type TeamRepository interface {
	FetchTeamMembers(teamId int64) (httpCode int, err error, teamMembers []response.FetchAllMembers)
	RegisterTeam(formData request.RegisterTeamForm) (httpCode int, err error)
	FetchOneTeamById(teamId int64) (httpCode int, err error, findTeam response.FetchAllTeamsByParams)
	FetchAllTeamsByParams(FetchAllTeams request.FetchAllTeamsByParamsRequest) (httpCode int, err error, teams []response.FetchAllTeamsByParams)
	AddMembersInTeam(AddMemInTeam request.AddMembersInTeamRequest) (httpCode int, err error)
	DeleteMember(DeleteMem request.DeleteMemberRequest) (httpCode int, err error)
	TransferCaptainRights(TransCaptain request.TransferCaptainRightsRequest) (httpCode int, err error)
	LeaveTeam(username string) (httpCode int, err error)
	PartInTeam(partInTeam request.PartInTeam) (httpCode int, err error)
	EditTeam(EditTeamReq request.EditTeamInfoForm) (httpCode int, err error)
}

type TeamRepositoryImpl struct {
	Db *gorm.DB
}

func NewTeamRepositoryImpl(Db *gorm.DB) TeamRepository {
	return &TeamRepositoryImpl{Db: Db}
}

func (t *TeamRepositoryImpl) EditTeam(EditTeamReq request.EditTeamInfoForm) (httpCode int, err error) {
	var updateTeam models.TeamModel
	wantedPositions := strings.Split(EditTeamReq.WantedPositions, ",")

	err = t.Db.Where("id = ?", EditTeamReq.ID).
		Updates(&models.TeamModel{
			Title:           EditTeamReq.Title,
			Description:     EditTeamReq.Description,
			EventLocation:   EditTeamReq.EventLocation,
			WantedPositions: wantedPositions,
		}).Error

	if err != nil {
		return http.StatusInternalServerError, err
	}

	if EditTeamReq.Image != "" {
		err := t.Db.Where("id = ?", EditTeamReq.ID).
			Update(
				"image",
				EditTeamReq.Image,
			)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to upd team image: %v", err)
		}
	}

	t.Db.Create(&models.NotificationModel{
		OwnerId: updateTeam.CaptainId,
		Message: fmt.Sprintf("Данные о вашей команде %s обновлены", updateTeam.Title),
	})

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) PartInTeam(partInTeam request.PartInTeam) (httpCode int, err error) {
	createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
	prop := models.ProposalModel{
		Type:      "request",
		TeamID:    partInTeam.TeamId,
		OwnerId:   partInTeam.MemberId,
		CreatedAt: createdAt,
		Message:   partInTeam.Message,
	}

	t.Db.Model(&models.ProposalModel{}).Create(&prop)

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) LeaveTeam(username string) (httpCode int, err error) {
	var leaveUser models.UserModel
	var leaveTeam models.TeamModel

	t.Db.Where("username = ?", username).First(&leaveUser)
	t.Db.Where("id = ?", leaveUser.TeamId).First(&leaveTeam)

	if leaveTeam.CaptainId == leaveUser.ID {
		var captain models.UserModel
		t.Db.Where("id = ?", leaveUser.ID).First(&captain)

		captain.TeamId = 0
		t.Db.Save(&captain)

		leaveTeam.CaptainId = 0
		for index, memberId := range leaveTeam.MembersId {
			if memberId == leaveUser.ID {
				leaveTeam.MembersId = append(leaveTeam.MembersId[:index], leaveTeam.MembersId[index+1:]...)
				if len(leaveTeam.MembersId) == 0 {
					t.Db.Delete(&leaveTeam)
				}
				t.Db.Create(&models.NotificationModel{
					OwnerId: memberId,
					Message: fmt.Sprintf("Вашу команду покинул участник %s", leaveUser.Username),
				})
				t.Db.Create(&models.NotificationModel{
					OwnerId: captain.ID,
					Message: fmt.Sprintf("Вы покинули команду %s", leaveTeam.Title),
				})
			}
		}

		var teamChat models.TeamModel
		t.Db.Where("team_id = ?", captain.TeamId).First(&teamChat)
		for index, memberId := range teamChat.MembersId {
			if memberId == leaveUser.ID {
				teamChat.MembersId = append(teamChat.MembersId[:index], teamChat.MembersId[:index+1]...)
				if len(teamChat.MembersId) == 0 {
					t.Db.Delete(&teamChat)
				}
				//TODO - при выходе почистить сообщение капитана
				t.Db.Save(&teamChat)
				t.Db.Create(&models.NotificationModel{
					OwnerId: captain.ID,
					Message: fmt.Sprintf("Вы были исключены из командного чата %s", teamChat.Title),
				})
				t.Db.Create(&models.NotificationModel{
					OwnerId: memberId,
					Message: fmt.Sprintf("Вашу командый чат покинул капитан %s", captain.Username),
				})
			}
		}

		var members []models.UserModel
		t.Db.Where("id IN ?", leaveTeam.MembersId).Find(&members)
		var longestUser models.UserModel
		for _, member := range members {
			longestUser = members[0]
			if member.MemberSince.Before(longestUser.MemberSince) {
				longestUser = member
			}
		}
		leaveTeam.CaptainId = longestUser.ID
		t.Db.Save(&leaveTeam)
		t.Db.Create(&models.NotificationModel{
			OwnerId: longestUser.ID,
			Message: fmt.Sprintf(
				"Теперь вы,%s - капитан команды %s",
				longestUser.Username,
				leaveTeam.Title,
			),
		})
		for _, member := range members {
			t.Db.Create(&models.NotificationModel{
				OwnerId: member.ID,
				Message: fmt.Sprintf("Теперь в вашей команде %s новый капитан - %s", leaveTeam.Title, longestUser.Username),
			})
		}
	} else {
		for index, value := range leaveTeam.MembersId {
			if value == leaveUser.ID {
				leaveTeam.MembersId = append(leaveTeam.MembersId[:index], leaveTeam.MembersId[index+1:]...)
				if len(leaveTeam.MembersId) == 0 {
					t.Db.Delete(&leaveTeam)
				}
				leaveUser.TeamId = 0
				t.Db.Save(&leaveUser)
				t.Db.Save(&leaveTeam)
				t.Db.Create(&models.NotificationModel{
					OwnerId: leaveUser.ID,
					Message: fmt.Sprintf("%s, вы покинули команду %s", leaveUser.Username, leaveTeam.Title),
				})
				var teamChat models.TeamChatModel
				t.Db.Where("team_id = ?", leaveTeam.ID).First(&teamChat)
				//TODO - при выходе почистить все сообщения
				teamChat.MembersId = append(teamChat.MembersId[:index], teamChat.MembersId[index+1:]...)
				if len(teamChat.MembersId) == 0 {
					t.Db.Delete(&teamChat)
				}
				t.Db.Create(&models.NotificationModel{
					OwnerId: leaveUser.ID,
					Message: fmt.Sprintf("%s, вы покинули чат команды %s", leaveUser.Username, leaveTeam.Title),
				})
			}
		}
	}
	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) TransferCaptainRights(TransCaptain request.TransferCaptainRightsRequest) (int, error) {

	var newCap models.UserModel
	var captain models.UserModel
	var team models.TeamModel

	t.Db.Where("id = ?", TransCaptain.TeamId).First(&team)
	t.Db.Where("username = ?", TransCaptain.Owner).First(&captain)
	if captain.ID == team.CaptainId {
		t.Db.Where("id = ?", TransCaptain.MemberId).First(&newCap)

		team.CaptainId = newCap.ID
		t.Db.Save(&team)

		var persAchievements models.PersonalAchievementModel
		t.Db.Where("key = ?", "receiver").First(&persAchievements)
		if !slices.Contains(persAchievements.OwnerIds, newCap.ID) {
			persAchievements.OwnerIds = append(persAchievements.OwnerIds, captain.ID)
			t.Db.Save(&persAchievements)
			t.Db.Create(&models.NotificationModel{
				OwnerId: newCap.ID,
				Message: fmt.Sprintf(
					"Поздравляю! Вы теперь теперь капитан команды - %s \n Вами получено достижение: %s",
					team.Title,
					persAchievements.Title),
			})
		}
		t.Db.Create(&models.NotificationModel{
			OwnerId: captain.ID,
			Message: fmt.Sprintf(
				"Поздравляю! Вы теперь теперь капитан команды - %s \n %s передал вам право управления",
				team.Title,
				captain.Username,
			),
		})
	}

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) DeleteMember(deleteMemberRequest request.DeleteMemberRequest) (int, error) {
	var currentTeam models.TeamModel

	t.Db.First(&currentTeam, deleteMemberRequest.TeamId)

	for _, memberId := range currentTeam.MembersId {
		if memberId == deleteMemberRequest.MemberId {

			updateErr := t.Db.Exec("UPDATE user_models SET team_id = 0 WHERE id = ?", deleteMemberRequest.MemberId).Error
			if updateErr != nil {
				return http.StatusInternalServerError, updateErr
			}

			removeArrayErr := t.Db.Exec("UPDATE team_models SET members_id = ARRAY_REMOVE(members_id,?) WHERE id = ?",
				deleteMemberRequest.MemberId,
				deleteMemberRequest.TeamId,
			).Error
			if removeArrayErr != nil {
				return http.StatusInternalServerError, removeArrayErr
			}

			removeArrayErr = t.Db.Exec("UPDATE team_chat_models SET members_id = ARRAY_REMOVE(members_id,?) WHERE team_id = ?",
				deleteMemberRequest.MemberId,
				deleteMemberRequest.TeamId,
			).Error
			if removeArrayErr != nil {
				return http.StatusInternalServerError, removeArrayErr
			}

			t.Db.Create(&models.NotificationModel{
				OwnerId: memberId,
				Message: fmt.Sprintf("Вы были удалены из команды %s и ее командного чата", currentTeam.Title),
			})
		}
	}
	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) AddMembersInTeam(AddMemInTeam request.AddMembersInTeamRequest) (int, error) {
	var currentTeam models.TeamModel
	var users []models.UserModel

	err := t.Db.Where("id = ?", AddMemInTeam.TeamId).First(&currentTeam).Error
	if err != nil {
		return http.StatusNotFound, err
	}

	err = t.Db.Where("id IN ?", AddMemInTeam.MembersId).Find(&users).Error
	if err != nil {
		return http.StatusNotFound, err
	}

	for _, user := range users {
		user.TeamId = currentTeam.ID
		memberSince, _ := time.Parse(time.RFC3339, time.Now().String())
		user.MemberSince = memberSince
		t.Db.Save(&user)
		currentTeam.MembersId = append(currentTeam.MembersId, user.ID)
	}

	t.Db.Save(&currentTeam)

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) FetchTeamMembers(teamId int64) (httpCode int, err error, members []response.FetchAllMembers) {
	var team models.TeamModel
	err = t.Db.First(&team, teamId).Error
	if err != nil {
		return http.StatusInternalServerError, err, members
	}

	t.Db.Model(&models.UserModel{}).
		Where("id = ANY(?)", team.MembersId).
		Find(&members)

	return http.StatusOK, nil, members
}

func (t *TeamRepositoryImpl) RegisterTeam(AddTeamReq request.RegisterTeamForm) (int, error) {
	var existTeam models.TeamModel

	teamExist := t.Db.Where("title = ?", AddTeamReq.Title).First(&existTeam).Error
	if teamExist == nil {
		return http.StatusBadRequest, errors.ErrKeyIncorrect
	}

	newTeam := &models.TeamModel{
		Title:       AddTeamReq.Title,
		Description: AddTeamReq.Description,
		CaptainId:   AddTeamReq.CaptainID,
		MembersId:   pq.Int64Array{AddTeamReq.CaptainID},
		Image:       AddTeamReq.Image.Filename,
	}
	err := t.Db.Create(&newTeam).Error

	if err != nil {
		return http.StatusInternalServerError, err
	}

	memberSince, _ := time.Parse(time.RFC3339, time.Now().String())
	t.Db.Where("id = ?", AddTeamReq.CaptainID).
		Updates(&models.UserModel{
			TeamId:      newTeam.ID,
			MemberSince: memberSince,
		})

	t.Db.Create(&models.NotificationModel{
		OwnerId: AddTeamReq.CaptainID,
		Message: fmt.Sprintf("Поздравляем, вы создали команду %s", newTeam.Title),
	})

	var persAchievement models.PersonalAchievementModel
	t.Db.Where("key = ?", "member").First(&persAchievement)
	if !slices.Contains(persAchievement.OwnerIds, AddTeamReq.CaptainID) {
		persAchievement.OwnerIds = append(persAchievement.OwnerIds, AddTeamReq.CaptainID)
		t.Db.Save(&persAchievement)
		t.Db.Create(&models.NotificationModel{
			OwnerId: AddTeamReq.CaptainID,
			Message: fmt.Sprintf("Вы получили достижение: %s", persAchievement.Title),
		})
	}

	t.Db.Create(&models.TeamChatModel{
		TeamId:    newTeam.ID,
		Title:     fmt.Sprintf("%s_chat", AddTeamReq.Title),
		MembersId: pq.Int64Array{AddTeamReq.CaptainID},
	})
	t.Db.Create(&models.NotificationModel{
		OwnerId: AddTeamReq.CaptainID,
		Message: fmt.Sprintf("Теперь у вашей команды %s есть собственный командный чат %s_chat", AddTeamReq.Title, AddTeamReq.Title),
	})

	return http.StatusCreated, nil
}

func (t *TeamRepositoryImpl) FetchAllTeamsByParams(FetchAllTeams request.FetchAllTeamsByParamsRequest) (httpCode int, err error, teams []response.FetchAllTeamsByParams) {
	sqlQuery := t.Db.Model(&models.TeamModel{})

	if FetchAllTeams.Title != "" {
		sqlQuery = sqlQuery.Where("LOWER(title) LIKE LOWER(?)", "%"+FetchAllTeams.Title+"%")
	}
	if FetchAllTeams.Wanted != "" {
		sqlQuery = sqlQuery.Where("EXISTS (SELECT 1 FROM unnest(wanted_positions) AS position WHERE position LIKE ?)", "%"+FetchAllTeams.Wanted+"%")
	}
	if FetchAllTeams.Members != "" {
		membersIdString := strings.Split(FetchAllTeams.Members, ",")
		membersId := make([]int64, len(membersIdString))
		for _, memberId := range membersIdString {
			num, _ := strconv.Atoi(memberId)
			membersId = append(membersId, int64(num))
		}

		sqlQuery.Where("CARDINALITY(members_id) BETWEEN ? AND ?", membersId[2], membersId[3])
	}

	sqlQuery.Find(&teams)

	return http.StatusOK, nil, teams
}

func (t *TeamRepositoryImpl) FetchOneTeamById(teamId int64) (httpCode int, err error, findTeam response.FetchAllTeamsByParams) {
	if err = t.Db.Model(&models.TeamModel{}).Where("id = ?", teamId).Find(&findTeam).Error; err != nil {
		return http.StatusInternalServerError, err, findTeam
	}

	return http.StatusOK, nil, findTeam
}
