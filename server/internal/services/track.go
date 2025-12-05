package services

import (
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/repositories"
)

type TrackService interface {
	AddTrack(addTrackForm request.AddTrackForm) (int, error)
	PartTeamInTrack(partTeamInTrackForm request.PartTeamInTrackForm) (int, error)
	GetTrack(getTrackForm request.GetTrackForm) (int, database.TrackModel, error)
}

type TrackServiceImpl struct {
	TrackRepository repositories.TrackRepository
}

func NewTrackServiceImpl(trackRepository repositories.TrackRepository) TrackService {
	return &TrackServiceImpl{
		TrackRepository: trackRepository,
	}
}

func (t TrackServiceImpl) PartTeamInTrack(partTeamInTrackForm request.PartTeamInTrackForm) (int, error) {
	httpCode, err := t.TrackRepository.PartTeamInTrack(partTeamInTrackForm)
	return httpCode, err
}

func (t TrackServiceImpl) GetTrack(getTrackForm request.GetTrackForm) (int, database.TrackModel, error) {
	httpCode, track, err := t.TrackRepository.GetTrack(getTrackForm)
	return httpCode, track, err
}

func (t TrackServiceImpl) AddTrack(addTrackForm request.AddTrackForm) (int, error) {
	httpCode, err := t.TrackRepository.AddTrack(addTrackForm)
	return httpCode, err
}
