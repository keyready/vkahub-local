package services

import (
	"context"
	"fmt"
	"net/http"
	"server/internal/cloud"
	"server/internal/dto/request"
	"server/internal/dto/response"
	"server/internal/repositories"
	"time"
)

type TeamService interface {
	FetchTeamMembers(teamId int64) (httpCode int, err error, members []response.FetchAllMembers)
	RegisterTeam(formData request.RegisterTeamForm) (httpCode int, err error)
	FetchOneTeamById(teamId int64) (httpCode int, err error, findTeam response.FetchAllTeamsByParams)
	FetchAllTeamsByParams(FetchAllTeams request.FetchAllTeamsByParamsRequest) (httpCode int, err error, teams []response.FetchAllTeamsByParams)
	AddMembersInTeam(AddMemInTeam request.AddMembersInTeamRequest) (httpCode int, err error)
	DeleteMember(DeleteMemReq request.DeleteMemberRequest) (httpCode int, err error)
	TransferCaptainRights(TransferCaptain request.TransferCaptainRightsRequest) (httpCode int, err error)
	LeaveTeam(username string) (httpCode int, err error)
	PartInTeam(partInTeam request.PartInTeam) (httpCode int, err error)
	EditTeam(EditTeamReq request.EditTeamInfoForm) (httpCode int, err error)
}

type TeamServiceImpl struct {
	TeamRepository repositories.TeamRepository
	cloud          *cloud.Cloud
}

func NewTeamServiceImpl(
	teamRepository repositories.TeamRepository,
	cloud *cloud.Cloud,
) TeamService {
	return &TeamServiceImpl{
		TeamRepository: teamRepository,
		cloud:          cloud,
	}
}

func (t TeamServiceImpl) EditTeam(EditTeamReq request.EditTeamInfoForm) (httpCode int, err error) {
	httpCode, err = t.TeamRepository.EditTeam(EditTeamReq)
	return httpCode, err
}

func (t TeamServiceImpl) PartInTeam(partInTeam request.PartInTeam) (httpCode int, err error) {
	httpCode, err = t.TeamRepository.PartInTeam(partInTeam)
	return httpCode, err
}

func (t TeamServiceImpl) LeaveTeam(username string) (httpCode int, err error) {
	httpCode, err = t.TeamRepository.LeaveTeam(username)
	return httpCode, err
}

func (t TeamServiceImpl) TransferCaptainRights(TransferCaptain request.TransferCaptainRightsRequest) (httpCode int, err error) {
	httpCode, err = t.TeamRepository.TransferCaptainRights(TransferCaptain)
	return httpCode, err
}

func (t TeamServiceImpl) DeleteMember(DeleteMemReq request.DeleteMemberRequest) (httpCode int, err error) {
	httpCode, err = t.TeamRepository.DeleteMember(DeleteMemReq)
	return httpCode, err
}

func (t TeamServiceImpl) AddMembersInTeam(AddMemInTeam request.AddMembersInTeamRequest) (httpCode int, err error) {
	httpCode, err = t.TeamRepository.AddMembersInTeam(AddMemInTeam)
	return httpCode, err
}

func (t TeamServiceImpl) RegisterTeam(formData request.RegisterTeamForm) (httpCode int, err error) {
	httpCode, err = t.TeamRepository.RegisterTeam(formData)
	return httpCode, err
}

func (t TeamServiceImpl) FetchOneTeamById(teamId int64) (httpCode int, err error, findTeam response.FetchAllTeamsByParams) {
	httpCode, err, findTeam = t.TeamRepository.FetchOneTeamById(teamId)
	url, err := t.cloud.Cloud.GetSharedURL(context.Background(), findTeam.Image, time.Hour*2)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to get share-link: %v", err), findTeam
	}

	findTeam.Image = url

	return httpCode, err, findTeam
}

func (t TeamServiceImpl) FetchAllTeamsByParams(FetchAllTeams request.FetchAllTeamsByParamsRequest) (httpCode int, err error, teams []response.FetchAllTeamsByParams) {
	httpCode, err, teams = t.TeamRepository.FetchAllTeamsByParams(FetchAllTeams)

	for _, team := range teams {
		url, err := t.cloud.Cloud.GetSharedURL(context.Background(), team.Image, time.Hour*2)
		if err != nil {
			return http.StatusInternalServerError, fmt.Errorf("failed to get share-link: %v", err), nil
		}

		team.Image = url
	}

	return httpCode, err, teams
}

func (t TeamServiceImpl) FetchTeamMembers(teamId int64) (httpCode int, err error, teamMembers []response.FetchAllMembers) {
	httpCode, err, teamMembers = t.TeamRepository.FetchTeamMembers(teamId)
	return httpCode, err, teamMembers
}
