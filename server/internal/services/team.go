package services

import (
	"server/internal/cloud"
	"server/internal/forms/request"
	"server/internal/forms/response"
	"server/internal/repositories"
)

type TeamService interface {
	GetTeamMembers(teamID int64) (int, []*response.Member, error)
	RegisterTeam(registerTeamForm request.RegisterTeamForm) (int, error)
	GetTeamById(teamID int64) (*response.Team, error)
	GetTeamsByParams(getAllTeamsForm request.GetTeamsByParamsForm) (int, []*response.Team, error)
	AddMembersInTeam(addMemberInTeamForm request.AddMembersInTeamForm) (int, error)
	DeleteMember(delMemberForm request.DeleteMemberForm) (int, error)
	TransferCaptainRights(transfRightsForm request.TransferCaptainRightsForm) (int, error)
	LeaveTeam(username string) (int, error)
	PartInTeam(partInTeamForm request.PartInTeamForm) (int, error)
	EditTeam(editTeamForm request.EditTeamInfoForm) (int, error)
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

func (t TeamServiceImpl) EditTeam(editTeamForm request.EditTeamInfoForm) (int, error) {
	httpCode, err := t.TeamRepository.EditTeam(editTeamForm)
	return httpCode, err
}

func (t TeamServiceImpl) PartInTeam(partInTeamForm request.PartInTeamForm) (int, error) {
	httpCode, err := t.TeamRepository.PartInTeam(partInTeamForm)
	return httpCode, err
}

func (t TeamServiceImpl) LeaveTeam(username string) (int, error) {
	httpCode, err := t.TeamRepository.LeaveTeam(username)
	return httpCode, err
}

func (t TeamServiceImpl) TransferCaptainRights(transfRightsForm request.TransferCaptainRightsForm) (int, error) {
	httpCode, err := t.TeamRepository.TransferCaptainRights(transfRightsForm)
	return httpCode, err
}

func (t TeamServiceImpl) DeleteMember(delMemberForm request.DeleteMemberForm) (int, error) {
	httpCode, err := t.TeamRepository.DeleteMember(delMemberForm)
	return httpCode, err
}

func (t TeamServiceImpl) AddMembersInTeam(addMemberInTeamForm request.AddMembersInTeamForm) (int, error) {
	httpCode, err := t.TeamRepository.AddMembersInTeam(addMemberInTeamForm)
	return httpCode, err
}

func (t TeamServiceImpl) RegisterTeam(registerTeamForm request.RegisterTeamForm) (int, error) {
	httpCode, err := t.TeamRepository.RegisterTeam(registerTeamForm)
	return httpCode, err
}

func (t TeamServiceImpl) GetTeamById(teamID int64) (*response.Team, error) {
	findTeam, err := t.TeamRepository.GetTeamById(teamID)
	return findTeam, err
}

func (t TeamServiceImpl) GetTeamsByParams(getAllTeamsForm request.GetTeamsByParamsForm) (int, []*response.Team, error) {
	httpCode, teams, err := t.TeamRepository.GetTeamsByParams(getAllTeamsForm)
	return httpCode, teams, err
}

func (t TeamServiceImpl) GetTeamMembers(teamID int64) (int, []*response.Member, error) {
	httpCode, teamMembers, err := t.TeamRepository.GetTeamMembers(teamID)
	return httpCode, teamMembers, err
}
