package services

import (
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/repositories"
)

type PositionService interface {
	AddPosition(addPositionForm request.AddPositionForm) (int, error)
	GetPositions(positionIDs string) (int, []database.PositionModel, error)
}

type PositionServiceImpl struct {
	posRep repositories.PositionRepository
}

func NewPosServiceImpl(posRep repositories.PositionRepository) PositionService {
	return &PositionServiceImpl{posRep: posRep}
}

func (p PositionServiceImpl) AddPosition(addPositionForm request.AddPositionForm) (int, error) {
	httpCode, err := p.posRep.AddPosition(addPositionForm)
	return httpCode, err
}

func (p PositionServiceImpl) GetPositions(positionIDs string) (int, []database.PositionModel, error) {
	httpCode, positions, err := p.posRep.GetPositions(positionIDs)
	return httpCode, positions, err
}
