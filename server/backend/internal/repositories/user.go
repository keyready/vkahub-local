package repositories

import (
	"backend/internal/dto/other"
	"backend/internal/dto/request"
	"backend/internal/dto/response"
	"backend/internal/models"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strings"
	"unicode/utf8"

	"gorm.io/gorm"
)

type UserRepository interface {
	FetchAllMembersByParams(FetchAllMem request.FetchAllMembersByParamsRequest) (httpCode int, err error, members []response.FetchAllMembers)
	FetchOneMemberByUsername(username string) (httpCode int, err error, member response.FetchAllMembers)
	GetUserData(username string) (httpCode int, err error, userData response.UserData)
	GetProfile(username string) (httpCode int, err error, userData response.ProfileData)
	EditProfile(EditProf request.EditProfileRequest) (httpCode int, err error)
	FetchPersonalAchievements(username, personalUsername string) (httpCode int, err error, data []response.FetchPersonalAchievementResponse)
	FetchAllPersonalNotifications(allNtf request.FetchAllNotifications) (httpCode int, err error, ntfs []models.NotificationModel)
	UpdateNotificationStatus(updateNotification other.UpdateNotificationData) (httpCode int, err error)
	GetActualInfo() (httpCode int, err error, info response.ActualInfo)
	FetchAllMessages(fetchAllMessage request.FetchAllMessages) (httpCode int, err error, messages []response.FetchAllMessagesResponse)
}

type UserRepositoryImpl struct {
	Db *gorm.DB
}

func NewUserRepositoryImpl(Db *gorm.DB) UserRepository {
	return &UserRepositoryImpl{Db: Db}
}

func (u *UserRepositoryImpl) FetchAllMessages(fetchAllMessage request.FetchAllMessages) (httpCode int, err error, respMessage []response.FetchAllMessagesResponse) {
	var teamChat models.TeamChatModel
	var messages []models.ChatMessageModel

	if fetchAllMessage.TeamId < 0 {
		return http.StatusInternalServerError, errors.New("нет такой команды"), respMessage
	}
	u.Db.Where("team_id = ?", fetchAllMessage.TeamId).First(&teamChat)
	u.Db.Where("team_chat_id = ?", teamChat.ID).Find(&messages)

	for _, msg := range messages {
		var author models.UserModel
		u.Db.Where("username = ?", msg.Author).First(&author)
		respMsg := response.FetchAllMessagesResponse{
			ID:      msg.ID,
			Message: msg.Message,
			Author: response.MessageAvatar{
				Username: msg.Author,
				Avatar:   author.Avatar,
			},
			Attachments: msg.Attachment,
			TeamChatId:  msg.TeamChatId,
			CreatedAt:   msg.CreatedAt,
			UpdatedAt:   msg.UpdatedAt,
			DeletedAt:   msg.DeletedAt,
		}
		respMessage = append(respMessage, respMsg)
	}

	return http.StatusOK, nil, respMessage
}

func (u *UserRepositoryImpl) GetActualInfo() (httpCode int, err error, info response.ActualInfo) {
	var totalUsers int64
	u.Db.Model(&models.UserModel{}).Count(&totalUsers)
	info.TotalUsers = totalUsers

	var totalTeams int64
	u.Db.Model(&models.TeamModel{}).Count(&totalTeams)
	info.TotalTeams = totalTeams

	var totalEvents int64
	u.Db.Model(&models.EventModel{}).Count(&totalEvents)
	info.TotalEvents = totalEvents

	var totalWinners int64
	u.Db.Model(&models.AchievementModel{}).Where("result = ?", "winner").Count(&totalWinners)
	info.TotalWinners = totalWinners

	return http.StatusOK, nil, info
}

func (u *UserRepositoryImpl) UpdateNotificationStatus(updateNotification other.UpdateNotificationData) (httpCode int, err error) {
	var updateNtf models.NotificationModel
	u.Db.Where("id = ?", updateNotification.NotificationID).First(&updateNtf)
	updateNtf.Status = "read"
	u.Db.Save(&updateNtf)
	return http.StatusOK, nil
}

func (u *UserRepositoryImpl) FetchAllPersonalNotifications(allNtf request.FetchAllNotifications) (httpCode int, err error, data []models.NotificationModel) {
	err = u.Db.Where("owner_id = ?", allNtf.UserId).Where("status = ?", allNtf.Type).Find(&data).Error
	if err != nil {
		var tmp []models.NotificationModel
		return http.StatusOK, nil, tmp
	}
	return http.StatusOK, nil, data
}

func (u *UserRepositoryImpl) FetchPersonalAchievements(username, personalUsername string) (httpCode int, err error, data []response.FetchPersonalAchievementResponse) {
	var owner models.UserModel

	if username != "" {
		u.Db.Where("username = ?", username).First(&owner)
	} else {
		u.Db.Where("username = ?", personalUsername).First(&owner)
	}

	var allPerAchievements []models.PersonalAchievementModel
	u.Db.Find(&allPerAchievements)

	var allMembers []models.UserModel
	u.Db.Find(&allMembers)

	for _, achievement := range allPerAchievements {
		if slices.Contains(achievement.OwnerIds, owner.ID) {
			rarity := float64(len(achievement.OwnerIds)) / float64(len(allMembers))
			resp := response.FetchPersonalAchievementResponse{
				ID:          achievement.ID,
				Title:       achievement.Title,
				Description: achievement.Description,
				Image:       achievement.Image,
				Rarity:      rarity,
			}
			data = append(data, resp)
		}
	}

	return http.StatusOK, nil, data
}

func (u *UserRepositoryImpl) EditProfile(EditProf request.EditProfileRequest) (httpCode int, err error) {
	var userExist models.UserModel

	u.Db.Where("id = ?", EditProf.ID).First(&userExist)

	var currentUser models.UserModel
	if findUserErr := u.Db.First(&currentUser, EditProf.ID).Error; findUserErr != nil {
		return http.StatusNotFound, findUserErr
	}

	currentUser.Firstname = EditProf.Firstname
	currentUser.Middlename = EditProf.Middlename
	currentUser.Lastname = EditProf.Lastname
	currentUser.GroupNumber = EditProf.GroupNumber
	currentUser.Rank = EditProf.Rank
	currentUser.Description = EditProf.Description
	if !slices.Contains(currentUser.Roles, "profileConfirmed") {
		currentUser.Roles = append(currentUser.Roles, "profileConfirmed")
	}
	currentUser.IsProfileConfirmed = true
	currentUser.Skills = EditProf.Skills
	currentUser.Positions = EditProf.Positions
	u.Db.Save(&currentUser)

	return http.StatusOK, nil
}

func (u *UserRepositoryImpl) GetProfile(username string) (httpCode int, err error, userData response.ProfileData) {
	dbErr := u.Db.Model(&models.UserModel{}).Where("username = ?", username).First(&userData).Error
	if dbErr != nil {
		return http.StatusNotFound, gorm.ErrRecordNotFound, userData
	}
	return http.StatusOK, nil, userData
}

func (u *UserRepositoryImpl) GetUserData(username string) (httpCode int, err error, userData response.UserData) {
	dbErr := u.Db.Model(&models.UserModel{}).Where("username = ?", username).First(&userData).Error
	if dbErr != nil {
		return http.StatusNotFound, gorm.ErrRecordNotFound, userData
	}
	return http.StatusOK, nil, userData
}

func (u *UserRepositoryImpl) FetchOneMemberByUsername(username string) (httpCode int, err error, member response.FetchAllMembers) {
	dbErr := u.Db.Where("username = ?", username).Find(&member).Error
	if dbErr != nil {
		return http.StatusNotFound, dbErr, member
	}
	return http.StatusOK, nil, member
}

func (u *UserRepositoryImpl) FetchAllMembersByParams(fetchAllMembersRequest request.FetchAllMembersByParamsRequest) (httpCode int, err error, members []response.FetchAllMembers) {
	sqlQuery := u.Db.
		Model(&models.UserModel{}).
		Where("is_profile_confirmed = ?", true)
		// Where("is_mail_confirmed = ?", true)

	if fetchAllMembersRequest.IsMember == "false" {
		sqlQuery.Where("team_id = ?", 0)
	}

	if fetchAllMembersRequest.Username != "" {
		sqlQuery.Where("LOWER(username) LIKE ?", "%"+fetchAllMembersRequest.Username+"%")
	}
	if fetchAllMembersRequest.Lastname != "" {
		runes := []rune{}
		for _, r := range fetchAllMembersRequest.Lastname {
			runeValue, _ := utf8.DecodeRuneInString(string(r))
			runes = append(runes, runeValue)
		}
		fetchAllMembersRequest.Lastname = string(runes)
		sqlQuery.Where("LOWER(lastname) LIKE LOWER(?)", "%"+fetchAllMembersRequest.Lastname+"%")
	}

	if fetchAllMembersRequest.Wanted != "" {
		fmt.Print(fetchAllMembersRequest.Wanted)
		sqlQuery.Where("? = ANY(positions)", fetchAllMembersRequest.Wanted)
	}

	if fetchAllMembersRequest.Skills != "" {
		skills := strings.Split(fetchAllMembersRequest.Skills, ",")
		sqlQuery.Where("skills && ?", skills)
	}

	sqlQuery.Find(&members)

	return http.StatusOK, nil, members
}
