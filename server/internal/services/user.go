package services

import (
	"context"
	"fmt"
	"net/http"
	"server/internal/cloud"
	"server/internal/database"
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/dto/response"
	"server/internal/repositories"
	"time"
)

type UserService interface {
	FetchAllMembersByParams(FetchAllMem request.FetchAllMembersByParamsRequest) (httpCode int, err error, members []response.FetchAllMembers)
	GetUserData(username string) (httpCode int, err error, userData response.UserData)
	GetProfile(username string) (httpCode int, err error, userData response.ProfileData)
	EditProfile(EditProfReq request.EditProfileInfoForm) (httpCode int, err error)
	FetchPersonalAchievements(username, personalUsername string) (httpCode int, err error, data []response.FetchPersonalAchievementResponse)
	FetchAllPersonalNotifications(allNtf request.FetchAllNotifications) (httpCode int, err error, ntfs []database.NotificationModel)
	UpdateNotification(updateNtf other.UpdateNotificationData) (httpCode int, err error)
	GetActualInfo() (httpCode int, err error, info response.ActualInfo)
	FetchAllMessages(fetchAllMessage request.FetchAllMessages) (httpCode int, err error, messages []response.FetchAllMessagesResponse)
	AddPortfolio(addPortfolioReq request.AddPortfolioForm, certificateNames []string) (httpCode int, err error)
	DeletePortfolio(certificateName, ownerName string) (httpCode int, err error)
	GetBannedReason(ownerID int64) (httpCode int, err error, banned database.BanModel)
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

func (u UserServiceImpl) GetBannedReason(ownerID int64) (httpCode int, err error, banned database.BanModel) {
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

	for _, message := range messages {
		urls := make([]string, len(message.Attachments))
		for _, attach := range message.Attachments {
			url, err := u.cloud.Cloud.GetSharedURL(context.Background(), attach, time.Hour*2)
			if err != nil {
				return http.StatusInsufficientStorage, fmt.Errorf("failed to get share-link: %v", err), nil
			}
			urls = append(urls, url)
		}
		message.Attachments = urls
	}

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

func (u UserServiceImpl) FetchAllPersonalNotifications(allNtf request.FetchAllNotifications) (httpCode int, err error, ntfs []database.NotificationModel) {
	httpCode, err, ntfs = u.UserRepository.FetchAllPersonalNotifications(allNtf)
	return httpCode, err, ntfs
}

func (u UserServiceImpl) FetchPersonalAchievements(username, personalUsername string) (httpCode int, err error, data []response.FetchPersonalAchievementResponse) {
	httpCode, err, data = u.UserRepository.FetchPersonalAchievements(username, personalUsername)

	for _, achivement := range data {
		url, err := u.cloud.Cloud.GetSharedURL(context.Background(), achivement.Image, time.Hour*2)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to get share-link: %v", err), nil
		}
		achivement.Image = url
	}

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

	url, err := u.cloud.Cloud.GetSharedURL(context.Background(), userData.Avatar, time.Hour*2)
	userData.Avatar = url

	return httpCode, err, userData
}

func (u UserServiceImpl) GetProfile(username string) (httpCode int, err error, profileData response.ProfileData) {
	httpCode, err, profileData = u.UserRepository.GetProfile(username)

	url, err := u.cloud.Cloud.GetSharedURL(context.Background(), profileData.Avatar, time.Hour*2)
	profileData.Avatar = url

	return httpCode, err, profileData
}
