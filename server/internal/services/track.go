package services

import (
	"server/internal/database"
	"server/internal/dto/request"
	"server/internal/repositories"
)

type TrackService interface {
	AddTrack(addTrack request.AddTrackDto) (httpCode int, err error)
	FetchOneTrack(fetchOneTrack request.FetchOneTrackReq) (httpCode int, err error, data database.TrackModel)
	PartTeamInTrack(pTeamInTrack request.PartTeamInTrackRequest) (httpCode int, err error)
}

type TrackServiceImpl struct {
	TrackRepository repositories.TrackRepository
}

func NewTrackServiceImpl(trackRepository repositories.TrackRepository) TrackService {
	return &TrackServiceImpl{
		TrackRepository: trackRepository,
	}
}

func (t TrackServiceImpl) PartTeamInTrack(partTeamInTrack request.PartTeamInTrackRequest) (httpCode int, err error) {
	httpCode, err = t.TrackRepository.PartTeamInTrack(partTeamInTrack)
	return httpCode, err
}

func (t TrackServiceImpl) FetchOneTrack(fetchOneTrack request.FetchOneTrackReq) (httpCode int, err error, data database.TrackModel) {
	httpCode, err, data = t.TrackRepository.FetchOneTrack(fetchOneTrack)
	return httpCode, err, data
}

func (t TrackServiceImpl) AddTrack(addTrack request.AddTrackDto) (httpCode int, err error) {
	httpCode, err = t.TrackRepository.AddTrack(addTrack)
	return httpCode, err
}
