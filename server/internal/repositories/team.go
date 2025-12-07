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

		_ = utils.FromJSON(updateTeam.Image, &imageObj)
		imageObj.Image = editTeamForm.Image

		imageJSON, _ := utils.ToJSON(imageObj)
		updateTeam.Image = imageJSON

		if err := t.Db.Save(&updateTeam).Error; err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to upd team image: %v", err)
		}
	}

	t.Db.Create(&database.NotificationModel{
		OwnerID: updateTeam.CaptainID,
		Message: fmt.Sprintf(
			`
				Данные о вашей команде %s обновлены
			`,
			updateTeam.Title,
		),
	})

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) PartInTeam(partInTeamForm request.PartInTeamForm) (int, error) {
	createdAt, _ := time.Parse(time.RFC3339, time.Now().String())
	prop := database.ProposalModel{
		Type:      "request",
		TeamID:    partInTeamForm.TeamID,
		OwnerID:   partInTeamForm.MemberID,
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
	t.Db.Where("id = ?", leaveUser.TeamID).First(&leaveTeam)

	if leaveTeam.CaptainID == leaveUser.ID {
		var captain database.UserModel
		t.Db.Where("id = ?", leaveUser.ID).First(&captain)

		captain.TeamID = 0
		t.Db.Save(&captain)

		leaveTeam.CaptainID = 0
		for index, memberId := range leaveTeam.MemberIDs {
			if memberId == leaveUser.ID {
				leaveTeam.MemberIDs = append(leaveTeam.MemberIDs[:index], leaveTeam.MemberIDs[index+1:]...)
				if len(leaveTeam.MemberIDs) == 0 {
					t.Db.Delete(&leaveTeam)
				}
				t.Db.Create(&database.NotificationModel{
					OwnerID: memberId,
					Message: fmt.Sprintf(
						`
							Вашу команду покинул участник %s
						`,
						leaveUser.Username,
					),
				})
				t.Db.Create(&database.NotificationModel{
					OwnerID: captain.ID,
					Message: fmt.Sprintf(
						`
							Вы покинули команду %s
						`,
						leaveTeam.Title,
					),
				})
			}
		}

		var teamChat database.TeamModel
		t.Db.Where("team_id = ?", captain.TeamID).First(&teamChat)
		for index, memberId := range teamChat.MemberIDs {
			if memberId == leaveUser.ID {
				teamChat.MemberIDs = append(teamChat.MemberIDs[:index], teamChat.MemberIDs[:index+1]...)
				if len(teamChat.MemberIDs) == 0 {
					t.Db.Delete(&teamChat)
				}
				//TODO - при выходе почистить сообщение капитана
				t.Db.Save(&teamChat)
				t.Db.Create(&database.NotificationModel{
					OwnerID: captain.ID,
					Message: fmt.Sprintf(
						`
							Вы были исключены из командного чата %s
						`,
						teamChat.Title,
					),
				})
				t.Db.Create(&database.NotificationModel{
					OwnerID: memberId,
					Message: fmt.Sprintf(
						`
							Вашу командый чат покинул капитан %s
						`,
						captain.Username,
					),
				})
			}
		}

		var members []database.UserModel
		t.Db.Where("id IN ?", leaveTeam.MemberIDs).Find(&members)
		var longestUser database.UserModel
		for _, member := range members {
			longestUser = members[0]
			if member.MemberSince.Before(longestUser.MemberSince) {
				longestUser = member
			}
		}
		leaveTeam.CaptainID = longestUser.ID
		t.Db.Save(&leaveTeam)
		t.Db.Create(&database.NotificationModel{
			OwnerID: longestUser.ID,
			Message: fmt.Sprintf(
				`
					Теперь вы, %s - капитан команды %s
				`,
				longestUser.Username,
				leaveTeam.Title,
			),
		})
		for _, member := range members {
			t.Db.Create(&database.NotificationModel{
				OwnerID: member.ID,
				Message: fmt.Sprintf(
					`
						Теперь в вашей команде %s новый капитан - %s
					`,
					leaveTeam.Title,
					longestUser.Username,
				),
			})
		}
	} else {
		for index, value := range leaveTeam.MemberIDs {
			if value == leaveUser.ID {
				leaveTeam.MemberIDs = append(leaveTeam.MemberIDs[:index], leaveTeam.MemberIDs[index+1:]...)
				if len(leaveTeam.MemberIDs) == 0 {
					t.Db.Delete(&leaveTeam)
				}
				leaveUser.TeamID = 0
				t.Db.Save(&leaveUser)
				t.Db.Save(&leaveTeam)
				t.Db.Create(&database.NotificationModel{
					OwnerID: leaveUser.ID,
					Message: fmt.Sprintf(
						`
							Вы покинули команду %s
						`,
						leaveTeam.Title,
					),
				})
				var teamChat database.TeamChatModel
				t.Db.Where("team_id = ?", leaveTeam.ID).First(&teamChat)
				//TODO - при выходе почистить все сообщения
				teamChat.MemberIDs = append(teamChat.MemberIDs[:index], teamChat.MemberIDs[index+1:]...)
				if len(teamChat.MemberIDs) == 0 {
					t.Db.Delete(&teamChat)
				}
				t.Db.Create(&database.NotificationModel{
					OwnerID: leaveUser.ID,
					Message: fmt.Sprintf(
						`
							Вы покинули чат команды %s
						`,
						leaveTeam.Title,
					),
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

	t.Db.Where("id = ?", transfRightsForm.TeamID).First(&team)
	t.Db.Where("username = ?", transfRightsForm.Owner).First(&captain)
	if captain.ID == team.CaptainID {
		t.Db.Where("id = ?", transfRightsForm.MemberID).First(&newCap)

		team.CaptainID = newCap.ID
		t.Db.Save(&team)

		var persAchievements database.PersonalAchievementModel
		t.Db.Where("key = ?", "receiver").First(&persAchievements)
		if !slices.Contains(persAchievements.OwnerIDs, newCap.ID) {
			persAchievements.OwnerIDs = append(persAchievements.OwnerIDs, captain.ID)
			t.Db.Save(&persAchievements)
			t.Db.Create(&database.NotificationModel{
				OwnerID: newCap.ID,
				Message: fmt.Sprintf(
					`
						Поздравляем! Вы теперь теперь капитан команды - %s \n 
						Вами получено достижение: %s
					`,
					team.Title,
					persAchievements.Title,
				),
			})
		}
		t.Db.Create(&database.NotificationModel{
			OwnerID: captain.ID,
			Message: fmt.Sprintf(
				`
					Поздравляем! Вы теперь теперь капитан команды - %s \n 
					%s передал вам право управления
				`,
				team.Title,
				captain.Username,
			),
		})
	}

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) DeleteMember(delMemberForm request.DeleteMemberForm) (int, error) {
	var currentTeam database.TeamModel

	t.Db.First(&currentTeam, delMemberForm.TeamID)

	for _, memberId := range currentTeam.MemberIDs {
		if memberId == delMemberForm.MemberID {

			updateErr := t.Db.Exec("UPDATE user_database SET team_id = 0 WHERE id = ?", delMemberForm.MemberID).Error
			if updateErr != nil {
				return http.StatusInternalServerError, updateErr
			}

			removeArrayErr := t.Db.Exec("UPDATE team_database SET members_id = ARRAY_REMOVE(members_id,?) WHERE id = ?",
				delMemberForm.MemberID,
				delMemberForm.TeamID,
			).Error
			if removeArrayErr != nil {
				return http.StatusInternalServerError, removeArrayErr
			}

			removeArrayErr = t.Db.Exec("UPDATE team_chat_database SET members_id = ARRAY_REMOVE(members_id,?) WHERE team_id = ?",
				delMemberForm.MemberID,
				delMemberForm.TeamID,
			).Error
			if removeArrayErr != nil {
				return http.StatusInternalServerError, removeArrayErr
			}

			t.Db.Create(&database.NotificationModel{
				OwnerID: memberId,
				Message: fmt.Sprintf(
					`
						Вас удалили из команды %s.
					`,
					currentTeam.Title,
				),
			})
		}
	}

	return http.StatusOK, nil
}

func (t *TeamRepositoryImpl) AddMembersInTeam(addMemberInTeamForm request.AddMembersInTeamForm) (int, error) {
	var currentTeam database.TeamModel
	var users []database.UserModel

	err := t.Db.Where("id = ?", addMemberInTeamForm.TeamID).First(&currentTeam).Error
	if err != nil {
		return http.StatusNotFound, err
	}

	err = t.Db.Where("id IN ?", addMemberInTeamForm.MemberIDs).Find(&users).Error
	if err != nil {
		return http.StatusNotFound, err
	}

	for _, user := range users {
		user.TeamID = currentTeam.ID
		memberSince, _ := time.Parse(time.RFC3339, time.Now().String())
		user.MemberSince = memberSince
		t.Db.Save(&user)
		currentTeam.MemberIDs = append(currentTeam.MemberIDs, user.ID)
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
		Where("id = ANY(?)", team.MemberIDs).
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
		Hash:  registerTeamForm.AvatarHash,
	}
	imageJSON, _ := utils.ToJSON(imageObj)

	newTeam := &database.TeamModel{
		Title:       registerTeamForm.Title,
		Description: registerTeamForm.Description,
		CaptainID:   registerTeamForm.CaptainID,
		MemberIDs:   pq.Int64Array{registerTeamForm.CaptainID},
		Image:       imageJSON,
	}
	err := t.Db.Create(&newTeam).Error

	if err != nil {
		return http.StatusInternalServerError, err
	}

	memberSince, _ := time.Parse(time.RFC3339, time.Now().String())
	t.Db.Where("id = ?", registerTeamForm.CaptainID).
		Updates(&database.UserModel{
			TeamID:      newTeam.ID,
			MemberSince: memberSince,
		})

	t.Db.Create(&database.NotificationModel{
		OwnerID: registerTeamForm.CaptainID,
		Message: fmt.Sprintf(
			`
				Поздравляем, вы создали команду %s
			`,
			newTeam.Title,
		),
	})

	var persAchievement database.PersonalAchievementModel
	t.Db.Where("key = ?", "member").First(&persAchievement)
	if !slices.Contains(persAchievement.OwnerIDs, registerTeamForm.CaptainID) {
		persAchievement.OwnerIDs = append(persAchievement.OwnerIDs, registerTeamForm.CaptainID)
		t.Db.Save(&persAchievement)
		t.Db.Create(&database.NotificationModel{
			OwnerID: registerTeamForm.CaptainID,
			Message: fmt.Sprintf(
				`
					Вы получили достижение: %s
				`,
				persAchievement.Title,
			),
		})
	}

	t.Db.Create(&database.TeamChatModel{
		TeamID:    newTeam.ID,
		Title:     fmt.Sprintf("%s_chat", registerTeamForm.Title),
		MemberIDs: pq.Int64Array{registerTeamForm.CaptainID},
	})
	t.Db.Create(&database.NotificationModel{
		OwnerID: registerTeamForm.CaptainID,
		Message: fmt.Sprintf(
			`
				Теперь у вашей команды %s есть собственный командный чат %s_chat
			`,
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
