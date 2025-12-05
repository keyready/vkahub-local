package mapper

import (
	"server/internal/database"
	"server/internal/forms/response"
	"server/internal/utils"
)

func UserModelToMember(userModel database.UserModel) (*response.Member, error) {
	avatarObj := database.ImageObj{}
	utils.FromJSON(userModel.Avatar, &avatarObj)

	member := &response.Member{
		ID:        userModel.ID,
		Username:  userModel.Username,
		TeamId:    userModel.TeamId,
		Firstname: userModel.Firstname,
		Lastname:  userModel.Lastname,
		Avatar:    avatarObj,
		Skills:    userModel.Skills,
		Positions: userModel.Positions,
	}

	return member, nil
}

func UserModelToUserData(userModel database.UserModel) (*response.UserData, error) {
	portfolio := make([]database.PortfolioFile, 0)
	recovery := database.RecoveryQuestion{}
	avatarObj := database.ImageObj{}

	if decodeErr := utils.FromJSON(userModel.Portfolio, &portfolio); decodeErr != nil {
		return nil, decodeErr
	}

	if decodeErr := utils.FromJSON(userModel.Recovery, &recovery); decodeErr != nil {
		return nil, decodeErr
	}

	if decodeErr := utils.FromJSON(userModel.Avatar, &avatarObj); decodeErr != nil {
		return nil, decodeErr
	}

	userData := &response.UserData{
		ID:               userModel.ID,
		Avatar:           avatarObj,
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

func UserModelToUserProfile(userModel database.UserModel) (*response.ProfileData, error) {
	portfolio := make([]database.PortfolioFile, 0)
	avatarObj := database.ImageObj{}

	if decodeErr := utils.FromJSON(userModel.Portfolio, &portfolio); decodeErr != nil {
		return nil, decodeErr
	}

	if decodeErr := utils.FromJSON(userModel.Avatar, &avatarObj); decodeErr != nil {
		return nil, decodeErr
	}

	profileData := &response.ProfileData{
		ID:          userModel.ID,
		Username:    userModel.Username,
		TeamId:      userModel.TeamId,
		Firstname:   userModel.Firstname,
		Lastname:    userModel.Lastname,
		Description: userModel.Description,
		Avatar:      avatarObj,
		Skills:      userModel.Skills,
		Positions:   userModel.Positions,
		CreatedAt:   userModel.CreatedAt,
		Portfolio:   portfolio,
	}

	return profileData, nil
}
