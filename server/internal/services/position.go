package services

import (
	"server/internal/database"
	"server/internal/dto/request"
	"server/internal/repositories"
)

type PositionService interface {
	AddPosition(addPosition request.AddPositionReq) (httpCode int, err error)
	FetchAllPositions(s string) (httpCode int, err error, positions []database.PositionModel)
}

type PositionServiceImpl struct {
	posRep repositories.PositionRepository
}

func NewPosServiceImpl(posRep repositories.PositionRepository) PositionService {
	return &PositionServiceImpl{posRep: posRep}
}

func (p PositionServiceImpl) AddPosition(addPosition request.AddPositionReq) (httpCode int, err error) {
	httpCode, err = p.posRep.AddPosition(addPosition)
	return httpCode, err
}

func (p PositionServiceImpl) FetchAllPositions(s string) (httpCode int, err error, positions []database.PositionModel) {
	httpCode, err, positions = p.posRep.FetchAllPositions(s)
	return httpCode, err, positions
}
