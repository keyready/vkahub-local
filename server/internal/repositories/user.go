package repositories

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"server/internal/cloud"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/forms/response"
	"server/internal/mapper"
	"server/internal/utils"
	"slices"
	"strings"
	"unicode/utf8"

	"gorm.io/gorm"
)

type UserRepository interface {
	GetMembersByParams(getMembersForm request.GetMembersByParamsForm) (int, []*response.Member, error)
	GetMemberByUsername(username string) (int, *response.Member, error)
	GetUserData(username string) (int, *response.UserData, error)
	GetProfile(username string) (int, *response.ProfileData, error)
	EditProfile(editProfileForm request.EditProfileInfoForm) (int, error)
	GetPersonalAchievements(username, personalUsername string) (int, []response.PersonalAchievement, error)
	GetPersonalNotifications(getNotificationsForm request.GetNotificationsForm) (int, []database.NotificationModel)
	UpdateNotificationStatus(updateNotificationForm request.UpdateNotificationForm) (int, error)
	GetActualInfo() response.ActualInfo
	GetMessages(getMessagesForm request.GetMessagesForm) (int, []response.Message, error)
	AddPortfolio(addPortfolioForm request.AddPortfolioForm) (int, error)
	DeletePortfolio(ctx context.Context, certificateName, ownerName string) (int, error)
	GetBannedReason(ownerID int64) (int, *database.BanModel, error)
	SetSettings(ctx context.Context, saveSettingsForm request.SetSettingsForm) error
	GetSettings(ctx context.Context, username string) (string, error)
}

type UserRepositoryImpl struct {
	Db    *gorm.DB
	cloud *cloud.Cloud
}

func NewUserRepositoryImpl(Db *gorm.DB, cloud *cloud.Cloud) UserRepository {
	return &UserRepositoryImpl{Db: Db, cloud: cloud}
}

func (u *UserRepositoryImpl) GetSettings(ctx context.Context, username string) (string, error) {
	settings := ""
	err := u.Db.Model(&database.UserModel{}).
		Select("settings").
		Where("username = ?", username).
		Scan(&settings).Error
	if err != nil {
		return "", fmt.Errorf("failed to select user-settings: %v", err)
	}
	return settings, nil
}

func (u *UserRepositoryImpl) SetSettings(ctx context.Context, saveSettingsForm request.SetSettingsForm) error {
	err := u.Db.Model(&database.UserModel{}).
		Where("username = ?", saveSettingsForm.Username).
		Update("settings", saveSettingsForm.Settings).Error
	if err != nil {
		return fmt.Errorf("failed to update user-settings: %v", err)
	}
	return nil
}

func (u *UserRepositoryImpl) GetBannedReason(ownerID int64) (int, *database.BanModel, error) {
	banned := database.BanModel{}
	err := u.Db.Where("owner_id = ?", ownerID).First(&banned).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return http.StatusNotFound, nil, fmt.Errorf("current user %d is not banned", ownerID)
		}
		return http.StatusInternalServerError, nil, fmt.Errorf("failed to select ban for user %d: %v", ownerID, err)
	}
	return http.StatusOK, &banned, nil
}

func (u *UserRepositoryImpl) DeletePortfolio(ctx context.Context, certificateName, ownerName string) (int, error) {
	owner := database.UserModel{}
	err := u.Db.Where("username = ?", ownerName).First(&owner).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return http.StatusNotFound, fmt.Errorf("user %s not found", ownerName)
		}
		return http.StatusInternalServerError, fmt.Errorf("failed to select owner %s: %v", ownerName, err)
	}

	// TODO jsonPortfolio := make(map[string]interface{})
	// err := u.Db.Model(&database.UserModel{}).
	// 	Select("portfolio -> 'jsonStrPortfolio' as jsonStrPortfolio").
	// 	Where("username = ?", ownerName).
	// 	Scan(&jsonStrPortfolio).Error

	portfolio := make([]database.PortfolioFile, len(owner.Portfolio))
	_ = utils.FromJSON(owner.Portfolio, portfolio)

	removeIndex := slices.IndexFunc(portfolio, func(p database.PortfolioFile) bool {
		return p.Url == certificateName
	})
	if removeIndex == -1 {
		return http.StatusNotFound, fmt.Errorf("certificate %s already delete", certificateName)
	}

	removeCert := portfolio[removeIndex]
	updPortfolio := slices.Delete(portfolio, removeIndex, removeIndex+1)

	err = u.cloud.Cloud.RemoveFile(ctx, strings.SplitN(removeCert.Url, "/", 2)[1])
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to remove certificate: %v", err)
	}

	jsonPortfolio, err := utils.ToJSON(updPortfolio)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to convert portfolio: %v", err)
	}

	owner.Portfolio = jsonPortfolio
	if err = u.Db.Save(&owner).Error; err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to save owner portfolio: %v", err)
	}

	return http.StatusOK, nil
}

func (u *UserRepositoryImpl) AddPortfolio(addPortfolioForm request.AddPortfolioForm) (int, error) {
	owner := database.UserModel{}
	_ = u.Db.Where("username = ?", addPortfolioForm.Owner).First(&owner)

	portfolio := make([]database.PortfolioFile, 0)
	_ = utils.FromJSON(owner.Portfolio, portfolio)

	for _, certName := range addPortfolioForm.Certificates {
		fileType := "img"
		if filepath.Ext(certName) == ".pdf" {
			fileType = "pdf"
		}

		portfolio = append(
			portfolio,
			database.PortfolioFile{
				EventName: addPortfolioForm.EventName,
				Place:     addPortfolioForm.Place,
				Url:       certName,
				Type:      fileType,
			},
		)
	}

	portfolioJSON, _ := utils.ToJSON(portfolio)
	owner.Portfolio = portfolioJSON

	if err := u.Db.Save(&owner).Error; err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to upd portfolio: %v", err)
	}

	return http.StatusCreated, nil
}

func (u *UserRepositoryImpl) GetMessages(getMessagesForm request.GetMessagesForm) (int, []response.Message, error) {
	teamChat := database.TeamChatModel{}
	messageModels := make([]database.ChatMessageModel, 0)
	messages := make([]response.Message, 0)

	err := u.Db.Where("team_id = ?", getMessagesForm.TeamID).First(&teamChat)
	if err != nil {
		return http.StatusNotFound, nil, fmt.Errorf("team %d not found", getMessagesForm.TeamID)
	}
	u.Db.Where("team_chat_id = ?", teamChat.ID).Find(&messageModels)

	for _, msg := range messageModels {
		author := database.UserModel{}
		u.Db.Where("username = ?", msg.Author).First(&author)

		avatarObj := database.ImageObj{}
		utils.FromJSON(author.Avatar, &avatarObj)

		respMsg := response.Message{
			ID:      msg.ID,
			Message: msg.Message,
			Author: response.MessageAvatar{
				Username: msg.Author,
				Avatar:   avatarObj.Image,
			},
			Attachments: msg.Attachment,
			TeamChatID:  msg.TeamChatID,
			CreatedAt:   msg.CreatedAt,
			UpdatedAt:   msg.UpdatedAt,
			DeletedAt:   msg.DeletedAt,
		}

		messages = append(messages, respMsg)
	}

	return http.StatusOK, messages, nil
}

func (u *UserRepositoryImpl) GetActualInfo() response.ActualInfo {
	info := response.ActualInfo{}

	var totalUsers int64
	u.Db.Model(&database.UserModel{}).Count(&totalUsers)
	info.TotalUsers = totalUsers

	var totalTeams int64
	u.Db.Model(&database.TeamModel{}).Count(&totalTeams)
	info.TotalTeams = totalTeams

	var totalEvents int64
	u.Db.Model(&database.EventModel{}).Count(&totalEvents)
	info.TotalEvents = totalEvents

	var totalWinners int64
	u.Db.Model(&database.AchievementModel{}).Where("result = ?", "winner").Count(&totalWinners)
	info.TotalWinners = totalWinners

	var onlineUsers int64
	u.Db.Model(&database.UserModel{}).Where("online = true").Count(&onlineUsers)
	info.OnlineClients = onlineUsers

	return info
}

func (u *UserRepositoryImpl) UpdateNotificationStatus(updateNotificationForm request.UpdateNotificationForm) (int, error) {
	err := u.Db.Model(&database.NotificationModel{}).
		Where("id = ?", updateNotificationForm.NotificationID).
		Update("status", "read").Error
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to update status notification: %v", err)
	}
	return http.StatusOK, nil
}

func (u *UserRepositoryImpl) GetPersonalNotifications(getNotificationsForm request.GetNotificationsForm) (int, []database.NotificationModel) {
	ntfs := make([]database.NotificationModel, 0)
	err := u.Db.
		Where("owner_id = ?", getNotificationsForm.UserId).
		Where("status = ?", getNotificationsForm.Type).
		Find(&ntfs).Error
	if err != nil {
		return http.StatusNotFound, nil
	}
	return http.StatusOK, ntfs
}

func (u *UserRepositoryImpl) GetPersonalAchievements(username, personalUsername string) (int, []response.PersonalAchievement, error) {
	owner := database.UserModel{}
	personalAchievementModels := make([]database.PersonalAchievementModel, 0)
	allMembers := make([]database.UserModel, 0)

	personalAchivements := make([]response.PersonalAchievement, 0)

	if username != "" {
		u.Db.Where("username = ?", username).First(&owner)
	} else {
		u.Db.Where("username = ?", personalUsername).First(&owner)
	}

	u.Db.Find(&personalAchievementModels)
	u.Db.Find(&allMembers)

	for _, achievement := range personalAchievementModels {
		if slices.Contains(achievement.OwnerIDs, owner.ID) {
			rarity := float64(len(achievement.OwnerIDs)) / float64(len(allMembers))
			resp := response.PersonalAchievement{
				ID:          achievement.ID,
				Title:       achievement.Title,
				Description: achievement.Description,
				Image:       achievement.Image,
				Rarity:      rarity,
			}
			personalAchivements = append(personalAchivements, resp)
		}
	}

	return http.StatusOK, personalAchivements, nil
}

func (u *UserRepositoryImpl) EditProfile(editProfileForm request.EditProfileInfoForm) (int, error) {
	var userExist database.UserModel

	u.Db.Where("id = ?", editProfileForm.UserID).First(&userExist)

	var currentUser database.UserModel
	if findUserErr := u.Db.First(&currentUser, editProfileForm.UserID).Error; findUserErr != nil {
		return http.StatusNotFound, findUserErr
	}

	currentUser.Firstname = editProfileForm.Firstname
	currentUser.Middlename = editProfileForm.Middlename
	currentUser.Lastname = editProfileForm.Lastname
	currentUser.GroupNumber = editProfileForm.GroupNumber
	currentUser.Rank = editProfileForm.Rank
	currentUser.Description = editProfileForm.Description

	if !slices.Contains(currentUser.Roles, "profileConfirmed") {
		currentUser.Roles = append(currentUser.Roles, "profileConfirmed")
	}

	if editProfileForm.Skills != nil {
		currentUser.Skills = editProfileForm.Skills
	}
	if editProfileForm.Positions != nil {
		currentUser.Positions = editProfileForm.Positions
	}

	if editProfileForm.Avatar != "" {
		// 	removeErr := u.cloud.Cloud.RemoveFile(context.Background(), currentUser.Avatar[strings.Index(currentUser.Avatar, "/")+1:])
		// 	if removeErr != nil {
		// 		return http.StatusInternalServerError, fmt.Errorf("failed to remove avatar: %v", err)
		// 	}
		avatarObj := database.ImageObj{
			Image: editProfileForm.Avatar,
			Hash:  editProfileForm.AvatarHash,
		}
		avatarJSON, _ := utils.ToJSON(avatarObj)

		currentUser.Avatar = avatarJSON
	}

	if currentUser.Recovery != nil {
		hashAnwser, _ := utils.GenerateHash(
			strings.ReplaceAll(
				strings.ToLower(editProfileForm.Answer),
				" ",
				"_",
			),
		)

		recoveryObj := database.RecoveryQuestion{
			Question: editProfileForm.Question,
			Answer:   hashAnwser,
		}

		recoveryJSON, _ := utils.ToJSON(recoveryObj)
		currentUser.Recovery = recoveryJSON
	}

	u.Db.Save(&currentUser)

	return http.StatusOK, nil
}

func (u *UserRepositoryImpl) GetProfile(username string) (int, *response.ProfileData, error) {
	userModel := database.UserModel{}
	dbErr := u.Db.Model(&database.UserModel{}).Where("username = ?", username).First(&userModel).Error
	if dbErr != nil {
		return http.StatusNotFound, nil, dbErr
	}

	userData, err := mapper.UserModelToUserProfile(userModel)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, userData, nil
}

func (u *UserRepositoryImpl) GetUserData(username string) (int, *response.UserData, error) {
	user := database.UserModel{}
	dbErr := u.Db.Model(&database.UserModel{}).Where("username = ?", username).First(&user).Error
	if dbErr != nil {
		return http.StatusNotFound, nil, dbErr
	}

	userData, err := mapper.UserModelToUserData(user)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, userData, nil
}

func (u *UserRepositoryImpl) GetMemberByUsername(username string) (int, *response.Member, error) {
	memberModel := database.UserModel{}

	dbErr := u.Db.Where("username = ?", username).Find(&memberModel).Error
	if dbErr != nil {
		return http.StatusNotFound, nil, dbErr
	}

	memberResponse, _ := mapper.UserModelToMember(memberModel)

	return http.StatusOK, memberResponse, nil
}

func (u *UserRepositoryImpl) GetMembersByParams(getMembersForm request.GetMembersByParamsForm) (int, []*response.Member, error) {
	memberModels := make([]database.UserModel, 0)
	membersResponse := make([]*response.Member, 0)

	sqlQuery := u.Db.
		Model(&database.UserModel{}).
		Where("is_profile_confirmed = ?", true)

	if getMembersForm.IsMember == "false" {
		sqlQuery.Where("team_id = ?", 0)
	}

	if getMembersForm.Username != "" {
		sqlQuery.Where("LOWER(username) LIKE ?", "%"+getMembersForm.Username+"%")
	}
	if getMembersForm.Lastname != "" {
		runes := []rune{}
		for _, r := range getMembersForm.Lastname {
			runeValue, _ := utf8.DecodeRuneInString(string(r))
			runes = append(runes, runeValue)
		}
		getMembersForm.Lastname = string(runes)
		sqlQuery.Where("LOWER(lastname) LIKE LOWER(?)", "%"+getMembersForm.Lastname+"%")
	}

	if getMembersForm.Wanted != "" {
		fmt.Print(getMembersForm.Wanted)
		sqlQuery.Where("? = ANY(positions)", getMembersForm.Wanted)
	}

	if getMembersForm.Skills != "" {
		skills := strings.Split(getMembersForm.Skills, ",")
		sqlQuery.Where("skills && ?", skills)
	}

	sqlQuery.Find(&memberModels)

	for _, memberModel := range memberModels {
		memberResponse, _ := mapper.UserModelToMember(memberModel)
		membersResponse = append(membersResponse, memberResponse)
	}

	return http.StatusOK, membersResponse, nil
}
