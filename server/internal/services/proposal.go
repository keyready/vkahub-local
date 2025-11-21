package services

import (
	"server/internal/dto/request"
	"server/internal/dto/response"
	"server/internal/repositories"
)

type ProposalService interface {
	CreateProposal(CreateProp request.CreateProposalRequest) (httpCode int, err error)
	FetchPersonalProposals(FetchProp request.FetchProposalRequest) (httpCode int, err error, data []response.FetchProposalEntityResponse)
	ApproveProposal(aprProp request.ApproveProposalRequest) (httpCode int, err error)
	CancelProposal(proposalId int64) (httpCode int, err error)
}

type ProposalServiceImpl struct {
	ProposalRepository repositories.ProposalRepository
}

func NewProposalServiceImpl(proposalRepository repositories.ProposalRepository) ProposalService {
	return &ProposalServiceImpl{ProposalRepository: proposalRepository}
}

func (p ProposalServiceImpl) ApproveProposal(aprProp request.ApproveProposalRequest) (httpCode int, err error) {
	httpCode, err = p.ProposalRepository.ApproveProposal(aprProp)
	return httpCode, err
}

func (p ProposalServiceImpl) CancelProposal(proposalId int64) (httpCode int, err error) {
	httpCode, err = p.ProposalRepository.CancelProposal(proposalId)
	return httpCode, err
}

func (p ProposalServiceImpl) FetchPersonalProposals(FetchProp request.FetchProposalRequest) (httpCode int, err error, data []response.FetchProposalEntityResponse) {
	httpCode, err, data = p.ProposalRepository.FetchPersonalProposals(FetchProp)
	return httpCode, err, data
}

func (p ProposalServiceImpl) CreateProposal(CreateProp request.CreateProposalRequest) (httpCode int, err error) {
	httpCode, err = p.ProposalRepository.CreateProposal(CreateProp)
	return httpCode, err
}
