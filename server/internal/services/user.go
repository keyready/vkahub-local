package services

import (
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/dto/response"
	"server/internal/models"
	"server/internal/repositories"
)

type UserService interface {
	FetchAllMembersByParams(FetchAllMem request.FetchAllMembersByParamsRequest) (httpCode int, err error, members []response.FetchAllMembers)
	GetUserData(username string) (httpCode int, err error, userData response.UserData)
	GetProfile(username string) (httpCode int, err error, userData response.ProfileData)
	EditProfile(EditProfReq request.EditProfileInfoForm) (httpCode int, err error)
	FetchPersonalAchievements(username, personalUsername string) (httpCode int, err error, data []response.FetchPersonalAchievementResponse)
	FetchAllPersonalNotifications(allNtf request.FetchAllNotifications) (httpCode int, err error, ntfs []models.NotificationModel)
	UpdateNotification(updateNtf other.UpdateNotificationData) (httpCode int, err error)
	GetActualInfo() (httpCode int, err error, info response.ActualInfo)
	FetchAllMessages(fetchAllMessage request.FetchAllMessages) (httpCode int, err error, messages []response.FetchAllMessagesResponse)
	AddPortfolio(addPortfolioReq request.AddPortfolioForm, certificateNames []string) (httpCode int, err error)
	DeletePortfolio(certificateName, ownerName string) (httpCode int, err error)
	GetBannedReason(ownerID int64) (httpCode int, err error, banned models.BanModel)
}

type UserServiceImpl struct {
	UserRepository repositories.UserRepository
}

func NewUserServiceImpl(userRepository repositories.UserRepository) UserService {
	return &UserServiceImpl{
		UserRepository: userRepository,
	}
}

func (u UserServiceImpl) GetBannedReason(ownerID int64) (httpCode int, err error, banned models.BanModel) {
	httpCode, err, banned = u.UserRepository.GetBannedReason(ownerID)
	return httpCode, err, banned
}

func (u UserServiceImpl) DeletePortfolio(certificateName, ownerName string) (httpCode int, err error) {
	httpCode, err = u.UserRepository.DeletePortfolio(certificateName, ownerName)
	return httpCode, err
}

func (u UserServiceImpl) AddPortfolio(addPortfolioReq request.AddPortfolioForm, certificateNames []string) (httpCode int, err error) {
	httpCode, err = u.UserRepository.AddPortfolio(addPortfolioReq, certificateNames)
	return httpCode, err
}

func (u UserServiceImpl) FetchAllMessages(fetchAllMessage request.FetchAllMessages) (httpCode int, err error, messages []response.FetchAllMessagesResponse) {
	httpCode, err, messages = u.UserRepository.FetchAllMessages(fetchAllMessage)
	return httpCode, err, messages
}

func (u UserServiceImpl) GetActualInfo() (httpCode int, err error, info response.ActualInfo) {
	httpCode, err, info = u.UserRepository.GetActualInfo()
	return httpCode, err, info
}

func (u UserServiceImpl) UpdateNotification(updateNtf other.UpdateNotificationData) (httpCode int, err error) {
	httpCode, err = u.UserRepository.UpdateNotificationStatus(updateNtf)
	return httpCode, err
}

func (u UserServiceImpl) FetchAllPersonalNotifications(allNtf request.FetchAllNotifications) (httpCode int, err error, ntfs []models.NotificationModel) {
	httpCode, err, ntfs = u.UserRepository.FetchAllPersonalNotifications(allNtf)
	return httpCode, err, ntfs
}

func (u UserServiceImpl) FetchPersonalAchievements(username, personalUsername string) (httpCode int, err error, data []response.FetchPersonalAchievementResponse) {
	httpCode, err, data = u.UserRepository.FetchPersonalAchievements(username, personalUsername)
	return httpCode, err, data
}

func (u UserServiceImpl) EditProfile(EditProfReq request.EditProfileInfoForm) (httpCode int, err error) {
	httpCode, err = u.UserRepository.EditProfile(EditProfReq)
	return httpCode, err
}

func (u UserServiceImpl) FetchAllMembersByParams(FetchAllMem request.FetchAllMembersByParamsRequest) (httpCode int, err error, members []response.FetchAllMembers) {
	httpCode, err, members = u.UserRepository.FetchAllMembersByParams(FetchAllMem)
	return httpCode, err, members
}

func (u UserServiceImpl) GetUserData(username string) (httpCode int, err error, userData response.UserData) {
	httpCode, err, userData = u.UserRepository.GetUserData(username)
	return httpCode, err, userData
}

func (u UserServiceImpl) GetProfile(username string) (httpCode int, err error, userData response.ProfileData) {
	httpCode, err, userData = u.UserRepository.GetProfile(username)
	return httpCode, err, userData
}
