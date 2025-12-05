package repositories

import (
	"errors"
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/forms/response"
	"server/internal/mapper"
	"server/internal/utils"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/lib/pq"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type TeamRepository interface {
	GetTeamMembers(teamID int64) (int, []*response.Member, error)
	RegisterTeam(registerTeamForm request.RegisterTeamForm) (int, error)
	GetTeamById(teamID int64) (*response.Team, error)
	GetTeamsByParams(getAllTeamsForm request.GetTeamsByParamsForm) (int, []*response.Team, error)
	AddMembersInTeam(addMemberInTeamForm request.AddMembersInTeamForm) (int, error)
	DeleteMember(delMember request.DeleteMemberForm) (int, error)
	TransferCaptainRights(transfRightsForm request.TransferCaptainRightsForm) (int, error)
	LeaveTeam(username string) (int, error)
	PartInTeam(partInTeamForm request.PartInTeamForm) (int, error)
	EditTeam(editTeamForm request.EditTeamInfoForm) (int, error)
}

type TeamRepositoryImpl struct {
	Db *gorm.DB
}

func NewTeamRepositoryImpl(Db *gorm.DB) TeamRepository {
	return &TeamRepositoryImpl{Db: Db}
}

func (t *TeamRepositoryImpl) EditTeam(editTeamForm request.EditTeamInfoForm) (int, error) {
	updateTeam := database.TeamModel{}
	wantedPositions := strings.Split(editTeamForm.WantedPositions, ",")

	_ = t.Db.First(&updateTeam, editTeamForm.ID).Error

	err := t.Db.Where("id = ?", editTeamForm.ID).
		Updates(&database.TeamModel{
			Title:           editTeamForm.Title,
			Description:     editTeamForm.Description,
			EventLocation:   editTeamForm.EventLocation,
			WantedPositions: wantedPositions,
		}).Error

	if err != nil {
		return http.StatusInternalServerError, err
	}

	if editTeamForm.Image != "" {
		imageObj := database.ImageObj{}
		utils.FromJSON(updateTeam.Image, &imageObj)
		imageObj.Image = editTeamForm.Image
		jsonDataObj := utils.ToJSON(imageObj)
		updateTeam.Image = datatypes.JSON(jsonDataObj)

		if err := t.Db.Save(&updateTeam).Error; err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to upd team image: %v", err)
		}
	}

	t.Db.Create(&database.NotificationModel{
		OwnerId: updateTeam.CaptainId,
		Message: fmt.Sprintf("Данные о вашей команде %s обновлены", updateTeam.Title),
	})

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) PartInTeam(partInTeamForm request.PartInTeamForm) (int, error) {
	createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
	prop := database.ProposalModel{
		Type:      "request",
		TeamID:    partInTeamForm.TeamId,
		OwnerId:   partInTeamForm.MemberId,
		CreatedAt: createdAt,
		Message:   partInTeamForm.Message,
	}

	t.Db.Model(&database.ProposalModel{}).Create(&prop)

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) LeaveTeam(username string) (int, error) {
	var leaveUser database.UserModel
	var leaveTeam database.TeamModel

	t.Db.Where("username = ?", username).First(&leaveUser)
	t.Db.Where("id = ?", leaveUser.TeamId).First(&leaveTeam)

	if leaveTeam.CaptainId == leaveUser.ID {
		var captain database.UserModel
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
				t.Db.Create(&database.NotificationModel{
					OwnerId: memberId,
					Message: fmt.Sprintf("Вашу команду покинул участник %s", leaveUser.Username),
				})
				t.Db.Create(&database.NotificationModel{
					OwnerId: captain.ID,
					Message: fmt.Sprintf("Вы покинули команду %s", leaveTeam.Title),
				})
			}
		}

		var teamChat database.TeamModel
		t.Db.Where("team_id = ?", captain.TeamId).First(&teamChat)
		for index, memberId := range teamChat.MembersId {
			if memberId == leaveUser.ID {
				teamChat.MembersId = append(teamChat.MembersId[:index], teamChat.MembersId[:index+1]...)
				if len(teamChat.MembersId) == 0 {
					t.Db.Delete(&teamChat)
				}
				//TODO - при выходе почистить сообщение капитана
				t.Db.Save(&teamChat)
				t.Db.Create(&database.NotificationModel{
					OwnerId: captain.ID,
					Message: fmt.Sprintf("Вы были исключены из командного чата %s", teamChat.Title),
				})
				t.Db.Create(&database.NotificationModel{
					OwnerId: memberId,
					Message: fmt.Sprintf("Вашу командый чат покинул капитан %s", captain.Username),
				})
			}
		}

		var members []database.UserModel
		t.Db.Where("id IN ?", leaveTeam.MembersId).Find(&members)
		var longestUser database.UserModel
		for _, member := range members {
			longestUser = members[0]
			if member.MemberSince.Before(longestUser.MemberSince) {
				longestUser = member
			}
		}
		leaveTeam.CaptainId = longestUser.ID
		t.Db.Save(&leaveTeam)
		t.Db.Create(&database.NotificationModel{
			OwnerId: longestUser.ID,
			Message: fmt.Sprintf(
				"Теперь вы,%s - капитан команды %s",
				longestUser.Username,
				leaveTeam.Title,
			),
		})
		for _, member := range members {
			t.Db.Create(&database.NotificationModel{
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
				t.Db.Create(&database.NotificationModel{
					OwnerId: leaveUser.ID,
					Message: fmt.Sprintf("%s, вы покинули команду %s", leaveUser.Username, leaveTeam.Title),
				})
				var teamChat database.TeamChatModel
				t.Db.Where("team_id = ?", leaveTeam.ID).First(&teamChat)
				//TODO - при выходе почистить все сообщения
				teamChat.MembersId = append(teamChat.MembersId[:index], teamChat.MembersId[index+1:]...)
				if len(teamChat.MembersId) == 0 {
					t.Db.Delete(&teamChat)
				}
				t.Db.Create(&database.NotificationModel{
					OwnerId: leaveUser.ID,
					Message: fmt.Sprintf("%s, вы покинули чат команды %s", leaveUser.Username, leaveTeam.Title),
				})
			}
		}
	}
	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) TransferCaptainRights(transfRightsForm request.TransferCaptainRightsForm) (int, error) {
	var newCap database.UserModel
	var captain database.UserModel
	var team database.TeamModel

	t.Db.Where("id = ?", transfRightsForm.TeamId).First(&team)
	t.Db.Where("username = ?", transfRightsForm.Owner).First(&captain)
	if captain.ID == team.CaptainId {
		t.Db.Where("id = ?", transfRightsForm.MemberId).First(&newCap)

		team.CaptainId = newCap.ID
		t.Db.Save(&team)

		var persAchievements database.PersonalAchievementModel
		t.Db.Where("key = ?", "receiver").First(&persAchievements)
		if !slices.Contains(persAchievements.OwnerIds, newCap.ID) {
			persAchievements.OwnerIds = append(persAchievements.OwnerIds, captain.ID)
			t.Db.Save(&persAchievements)
			t.Db.Create(&database.NotificationModel{
				OwnerId: newCap.ID,
				Message: fmt.Sprintf(
					"Поздравляю! Вы теперь теперь капитан команды - %s \n Вами получено достижение: %s",
					team.Title,
					persAchievements.Title),
			})
		}
		t.Db.Create(&database.NotificationModel{
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

func (t *TeamRepositoryImpl) DeleteMember(delMemberForm request.DeleteMemberForm) (int, error) {
	var currentTeam database.TeamModel

	t.Db.First(&currentTeam, delMemberForm.TeamId)

	for _, memberId := range currentTeam.MembersId {
		if memberId == delMemberForm.MemberId {

			updateErr := t.Db.Exec("UPDATE user_database SET team_id = 0 WHERE id = ?", delMemberForm.MemberId).Error
			if updateErr != nil {
				return http.StatusInternalServerError, updateErr
			}

			removeArrayErr := t.Db.Exec("UPDATE team_database SET members_id = ARRAY_REMOVE(members_id,?) WHERE id = ?",
				delMemberForm.MemberId,
				delMemberForm.TeamId,
			).Error
			if removeArrayErr != nil {
				return http.StatusInternalServerError, removeArrayErr
			}

			removeArrayErr = t.Db.Exec("UPDATE team_chat_database SET members_id = ARRAY_REMOVE(members_id,?) WHERE team_id = ?",
				delMemberForm.MemberId,
				delMemberForm.TeamId,
			).Error
			if removeArrayErr != nil {
				return http.StatusInternalServerError, removeArrayErr
			}

			t.Db.Create(&database.NotificationModel{
				OwnerId: memberId,
				Message: fmt.Sprintf("Вы были удалены из команды %s и ее командного чата", currentTeam.Title),
			})
		}
	}
	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) AddMembersInTeam(addMemberInTeamForm request.AddMembersInTeamForm) (int, error) {
	var currentTeam database.TeamModel
	var users []database.UserModel

	err := t.Db.Where("id = ?", addMemberInTeamForm.TeamId).First(&currentTeam).Error
	if err != nil {
		return http.StatusNotFound, err
	}

	err = t.Db.Where("id IN ?", addMemberInTeamForm.MembersId).Find(&users).Error
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

func (t *TeamRepositoryImpl) GetTeamMembers(teamID int64) (int, []*response.Member, error) {
	membersResponse := make([]*response.Member, 0)
	memberModels := make([]*database.UserModel, 0)

	team := database.TeamModel{}

	err := t.Db.First(&team, teamID).Error
	if err != nil {
		return http.StatusInternalServerError, nil, nil
	}

	t.Db.Model(&database.UserModel{}).
		Where("id = ANY(?)", team.MembersId).
		Find(&memberModels)

	for _, memberModel := range memberModels {
		memberResponse, _ := mapper.UserModelToMember(*memberModel)
		membersResponse = append(membersResponse, memberResponse)
	}

	return http.StatusOK, membersResponse, nil
}

func (t *TeamRepositoryImpl) RegisterTeam(registerTeamForm request.RegisterTeamForm) (int, error) {
	var existTeam database.TeamModel

	teamExist := t.Db.Where("title = ?", registerTeamForm.Title).First(&existTeam).Error
	if teamExist == nil {
		return http.StatusBadRequest, errors.New("team already exists")
	}

	imageObj := database.ImageObj{
		Image: registerTeamForm.Image,
		Hash:  registerTeamForm.Hash,
	}
	imageJsonObj := utils.ToJSON(imageObj)

	newTeam := &database.TeamModel{
		Title:           registerTeamForm.Title,
		Description:     registerTeamForm.Description,
		CaptainId:       registerTeamForm.CaptainID,
		MembersId:       pq.Int64Array{registerTeamForm.CaptainID},
		WantedPositions: pq.StringArray{},
		Image:           datatypes.JSON(imageJsonObj),
	}
	err := t.Db.Create(&newTeam).Error

	if err != nil {
		return http.StatusInternalServerError, err
	}

	memberSince, _ := time.Parse(time.RFC3339, time.Now().String())
	t.Db.Where("id = ?", registerTeamForm.CaptainID).
		Updates(&database.UserModel{
			TeamId:      newTeam.ID,
			MemberSince: memberSince,
		})

	t.Db.Create(&database.NotificationModel{
		OwnerId: registerTeamForm.CaptainID,
		Message: fmt.Sprintf("Поздравляем, вы создали команду %s", newTeam.Title),
	})

	var persAchievement database.PersonalAchievementModel
	t.Db.Where("key = ?", "member").First(&persAchievement)
	if !slices.Contains(persAchievement.OwnerIds, registerTeamForm.CaptainID) {
		persAchievement.OwnerIds = append(persAchievement.OwnerIds, registerTeamForm.CaptainID)
		t.Db.Save(&persAchievement)
		t.Db.Create(&database.NotificationModel{
			OwnerId: registerTeamForm.CaptainID,
			Message: fmt.Sprintf("Вы получили достижение: %s", persAchievement.Title),
		})
	}

	t.Db.Create(&database.TeamChatModel{
		TeamId:    newTeam.ID,
		Title:     fmt.Sprintf("%s_chat", registerTeamForm.Title),
		MembersId: pq.Int64Array{registerTeamForm.CaptainID},
	})
	t.Db.Create(&database.NotificationModel{
		OwnerId: registerTeamForm.CaptainID,
		Message: fmt.Sprintf(
			"Теперь у вашей команды %s есть собственный командный чат %s_chat",
			registerTeamForm.Title,
			registerTeamForm.Title,
		),
	})

	return http.StatusCreated, nil
}

func (t *TeamRepositoryImpl) GetTeamsByParams(getAllTeamsForm request.GetTeamsByParamsForm) (int, []*response.Team, error) {
	teamModels := make([]database.TeamModel, 0)
	teamsResponse := make([]*response.Team, 0)

	sqlQuery := t.Db.Model(&database.TeamModel{})

	if getAllTeamsForm.Title != "" {
		sqlQuery = sqlQuery.Where("LOWER(title) LIKE LOWER(?)", "%"+getAllTeamsForm.Title+"%")
	}
	if getAllTeamsForm.Wanted != "" {
		sqlQuery = sqlQuery.Where("EXISTS (SELECT 1 FROM unnest(wanted_positions) AS position WHERE position LIKE ?)", "%"+getAllTeamsForm.Wanted+"%")
	}
	if getAllTeamsForm.Members != "" {
		membersIdString := strings.Split(getAllTeamsForm.Members, ",")
		membersId := make([]int64, len(membersIdString))
		for _, memberId := range membersIdString {
			num, _ := strconv.Atoi(memberId)
			membersId = append(membersId, int64(num))
		}

		sqlQuery.Where("CARDINALITY(members_id) BETWEEN ? AND ?", membersId[2], membersId[3])
	}

	sqlQuery.Find(&teamModels)

	for _, teamModel := range teamModels {
		teamResponse, _ := mapper.TeamModelToTeamResponse(teamModel)
		teamsResponse = append(teamsResponse, teamResponse)
	}

	return http.StatusOK, teamsResponse, nil
}

func (t *TeamRepositoryImpl) GetTeamById(teamID int64) (*response.Team, error) {
	teamModel := database.TeamModel{}

	if err := t.Db.Where("id = ?", teamID).First(&teamModel).Error; err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			return nil, fmt.Errorf("team %d not found", teamID)
		default:
			return nil, fmt.Errorf("failed to find team: %v", err)
		}
	}

	teamResponse, err := mapper.TeamModelToTeamResponse(teamModel)
	if err != nil {
		return nil, fmt.Errorf("failed to mapping team model: %v", err)
	}

	return teamResponse, nil
}
