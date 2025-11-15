package mapper

import (
	"backend/internal/dto/response"
	"backend/internal/models"
	"encoding/json"
)

func UserModelToUserData(userModel models.UserModel) (response.UserData, error) {
	portfolio := []models.PortfolioFile{}

	if decodeErr := json.Unmarshal(userModel.Portfolio, &portfolio); decodeErr != nil {
		return response.UserData{}, decodeErr
	}

	userData := response.UserData{
		Avatar:      userModel.Avatar,
		CreatedAt:   userModel.CreatedAt,
		Description: userModel.Description,
		Firstname:   userModel.Firstname,
		Middlename:  userModel.Middlename,
		Lastname:    userModel.Lastname,
		GroupNumber: userModel.GroupNumber,
		ID:          userModel.ID,
		Mail:        userModel.Mail,
		Positions:   userModel.Positions,
		Rank:        userModel.Rank,
		Roles:       userModel.Roles,
		Skills:      userModel.Skills,
		TeamId:      userModel.TeamId,
		Username:    userModel.Username,
		Portfolio:   portfolio,
	}

	return userData, nil
}

func UserModelToUserProfile(userModel models.UserModel) (response.ProfileData, error) {
	portfolio := []models.PortfolioFile{}

	if decodeErr := json.Unmarshal(userModel.Portfolio, &portfolio); decodeErr != nil {
		return response.ProfileData{}, decodeErr
	}

	profileData := response.ProfileData{
		ID:          userModel.ID,
		Username:    userModel.Username,
		TeamId:      userModel.TeamId,
		Firstname:   userModel.Firstname,
		Lastname:    userModel.Lastname,
		Description: userModel.Description,
		Avatar:      userModel.Avatar,
		Skills:      userModel.Skills,
		Positions:   userModel.Positions,
		CreatedAt:   userModel.CreatedAt,
		Portfolio:   portfolio,
	}

	return profileData, nil
}
