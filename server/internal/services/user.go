package services

import (
	"context"
	"server/internal/cloud"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/forms/response"
	"server/internal/repositories"
)

type UserService interface {
	GetMembersByParams(getMembersForm request.GetMembersByParamsForm) (int, []*response.Member, error)
	// GetMemberByUsername(username string) (int, *response.Member, error)
	GetUserData(username string) (int, *response.UserData, error)
	GetProfile(username string) (int, *response.ProfileData, error)
	EditProfile(editProfileForm request.EditProfileInfoForm) (int, error)
	GetPersonalAchievements(username, personalUsername string) (int, []response.PersonalAchievement, error)
	GetPersonalNotifications(getNotificationsForm request.GetNotificationsForm) (int, []database.NotificationModel)
	UpdateNotificationStatus(updateNotificationForm request.UpdateNotificationForm) (int, error)
	GetActualInfo() response.ActualInfo
	GetMessages(getMessagesForm request.GetMessagesForm) (int, []response.Message, error)
	AddPortfolio(addPortfolioForm request.AddPortfolioForm) (int, error)
	DeletePortfolio(certificateName, ownerName string) (int, error)
	GetBannedReason(ownerID int64) (int, *database.BanModel, error)
	SetSettings(ctx context.Context, saveSettingsForm request.SetSettingsForm) error
	GetSettings(ctx context.Context, username string) (string, error)
}

type UserServiceImpl struct {
	UserRepository repositories.UserRepository
	cloud          *cloud.Cloud
}

func NewUserServiceImpl(
	userRepository repositories.UserRepository,
	cloud *cloud.Cloud,
) UserService {
	return &UserServiceImpl{
		UserRepository: userRepository,
		cloud:          cloud,
	}
}

func (u UserServiceImpl) GetSettings(ctx context.Context, username string) (string, error) {
	return u.UserRepository.GetSettings(ctx, username)
}

func (u UserServiceImpl) SetSettings(ctx context.Context, saveSettingsForm request.SetSettingsForm) error {
	return u.UserRepository.SetSettings(ctx, saveSettingsForm)
}

func (u UserServiceImpl) GetBannedReason(ownerID int64) (int, *database.BanModel, error) {
	httpCode, banned, err := u.UserRepository.GetBannedReason(ownerID)
	return httpCode, banned, err
}

func (u UserServiceImpl) DeletePortfolio(certificateName, ownerName string) (httpCode int, err error) {
	httpCode, err = u.UserRepository.DeletePortfolio(certificateName, ownerName)
	return httpCode, err
}

func (u UserServiceImpl) AddPortfolio(addPortfolioForm request.AddPortfolioForm) (int, error) {
	httpCode, err := u.UserRepository.AddPortfolio(addPortfolioForm)
	return httpCode, err
}

func (u UserServiceImpl) GetMessages(getMessagesForm request.GetMessagesForm) (int, []response.Message, error) {
	httpCode, messages, err := u.UserRepository.GetMessages(getMessagesForm)
	return httpCode, messages, err
}

func (u UserServiceImpl) GetActualInfo() response.ActualInfo {
	return u.UserRepository.GetActualInfo()
}

func (u UserServiceImpl) UpdateNotificationStatus(updateNotificationForm request.UpdateNotificationForm) (int, error) {
	httpCode, err := u.UserRepository.UpdateNotificationStatus(updateNotificationForm)
	return httpCode, err
}

func (u UserServiceImpl) GetPersonalNotifications(getNotificationsForm request.GetNotificationsForm) (int, []database.NotificationModel) {
	httpCode, ntfs := u.UserRepository.GetPersonalNotifications(getNotificationsForm)
	return httpCode, ntfs
}

func (u UserServiceImpl) GetPersonalAchievements(username, personalUsername string) (int, []response.PersonalAchievement, error) {
	httpCode, achievements, err := u.UserRepository.GetPersonalAchievements(username, personalUsername)
	return httpCode, achievements, err
}

func (u UserServiceImpl) EditProfile(editProfileForm request.EditProfileInfoForm) (int, error) {
	httpCode, err := u.UserRepository.EditProfile(editProfileForm)
	return httpCode, err
}

func (u UserServiceImpl) GetMembersByParams(getMembersForm request.GetMembersByParamsForm) (int, []*response.Member, error) {
	httpCode, members, err := u.UserRepository.GetMembersByParams(getMembersForm)
	return httpCode, members, err
}

func (u UserServiceImpl) GetUserData(username string) (int, *response.UserData, error) {
	httpCode, userData, err := u.UserRepository.GetUserData(username)
	return httpCode, userData, err
}

func (u UserServiceImpl) GetProfile(username string) (int, *response.ProfileData, error) {
	httpCode, profileData, err := u.UserRepository.GetProfile(username)
	return httpCode, profileData, err
}
