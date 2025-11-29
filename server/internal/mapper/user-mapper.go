package mapper

import (
	"encoding/json"
	"server/internal/database"
	"server/internal/dto/other"
	"server/internal/dto/response"
)

func UserModelToUserData(userModel database.UserModel) (response.UserData, error) {
	portfolio := []database.PortfolioFile{}
	recovery := other.RecoveryQuestionDTO{}

	if decodeErr := json.Unmarshal(userModel.Portfolio, &portfolio); decodeErr != nil {
		return response.UserData{}, decodeErr
	}

	if decodeErr := json.Unmarshal(userModel.Recovery, &recovery); decodeErr != nil {
		return response.UserData{}, decodeErr
	}

	userData := response.UserData{
		ID:               userModel.ID,
		Avatar:           userModel.Avatar,
		CreatedAt:        userModel.CreatedAt,
		Description:      userModel.Description,
		Firstname:        userModel.Firstname,
		Middlename:       userModel.Middlename,
		Lastname:         userModel.Lastname,
		GroupNumber:      userModel.GroupNumber,
		Positions:        userModel.Positions,
		Rank:             userModel.Rank,
		Roles:            userModel.Roles,
		Skills:           userModel.Skills,
		TeamId:           userModel.TeamId,
		Username:         userModel.Username,
		Portfolio:        portfolio,
		RecoveryQuestion: recovery.Question,
	}

	return userData, nil
}

func UserModelToUserProfile(userModel database.UserModel) (response.ProfileData, error) {
	portfolio := []database.PortfolioFile{}

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
