package mapper

import (
	"server/internal/database"
	"server/internal/forms/response"
	"server/internal/utils"
)

func EventModelToEventResponse(eventModel database.EventModel) (*response.Event, error) {
	imageObj := database.ImageObj{}

	if decodeErr := utils.FromJSON(eventModel.Image, &imageObj); decodeErr != nil {
		return nil, decodeErr
	}

	eventResponse := &response.Event{
		ID:                   eventModel.ID,
		Type:                 eventModel.Type,
		Title:                eventModel.Title,
		ShortDescription:     eventModel.ShortDescription,
		Description:          eventModel.Description,
		Image:                imageObj,
		ParticipantsTeamsIds: eventModel.ParticipantsTeamsIds,
		TracksId:             eventModel.TracksId,
		StartDate:            eventModel.StartDate,
		FinishDate:           eventModel.FinishDate,
		RegisterUntil:        eventModel.RegisterUntil,
		Sponsors:             eventModel.Sponsors,
	}

	return eventResponse, nil
}
