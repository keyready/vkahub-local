package services

import (
	"server/internal/forms/request"
	"server/internal/forms/response"
	"server/internal/repositories"
)

type ProposalService interface {
	CreateProposal(createPropForm request.CreateProposalForm) (int, error)
	GetPersonalProposals(getProposalsForm request.GetProposalForm) (int, []response.Proposal, error)
	ApproveProposal(approveProposalForm request.ApproveProposalForm) (int, error)
	CancelProposal(proposalID int64) (int, error)
}

type ProposalServiceImpl struct {
	ProposalRepository repositories.ProposalRepository
}

func NewProposalServiceImpl(proposalRepository repositories.ProposalRepository) ProposalService {
	return &ProposalServiceImpl{ProposalRepository: proposalRepository}
}

func (p ProposalServiceImpl) ApproveProposal(approveProposalForm request.ApproveProposalForm) (int, error) {
	httpCode, err := p.ProposalRepository.ApproveProposal(approveProposalForm)
	return httpCode, err
}

func (p ProposalServiceImpl) CancelProposal(proposalID int64) (int, error) {
	httpCode, err := p.ProposalRepository.CancelProposal(proposalID)
	return httpCode, err
}

func (p ProposalServiceImpl) GetPersonalProposals(getProposalsForm request.GetProposalForm) (int, []response.Proposal, error) {
	httpCode, proposals, err := p.ProposalRepository.GetPersonalProposals(getProposalsForm)
	return httpCode, proposals, err
}

func (p ProposalServiceImpl) CreateProposal(createPropForm request.CreateProposalForm) (int, error) {
	httpCode, err := p.ProposalRepository.CreateProposal(createPropForm)
	return httpCode, err
}
