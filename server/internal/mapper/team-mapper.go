package mapper

import (
	"server/internal/database"
	"server/internal/forms/response"
	"server/internal/utils"
)

func TeamModelToTeamResponse(teamModel database.TeamModel) (*response.Team, error) {
	imageObj := database.ImageObj{}

	if decodeErr := utils.FromJSON(teamModel.Image, &imageObj); decodeErr != nil {
		return nil, decodeErr
	}

	teamRespose := &response.Team{
		ID:              teamModel.ID,
		Title:           teamModel.Title,
		Description:     teamModel.Description,
		Image:           imageObj,
		CaptainID:       teamModel.CaptainID,
		WantedPositions: teamModel.WantedPositions,
		EventLocation:   teamModel.EventLocation,
		MembersID:       teamModel.MemberIDs,
	}

	return teamRespose, nil
}
