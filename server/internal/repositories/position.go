package repositories

import (
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

type PositionRepository interface {
	AddPosition(addPositionForm request.AddPositionForm) (int, error)
	GetPositions(positionIDs string) (int, []database.PositionModel, error)
}

type PositionRepositoryImpl struct {
	DB *gorm.DB
}

func NewPositionRepImpl(DB *gorm.DB) PositionRepository {
	return &PositionRepositoryImpl{DB: DB}
}

func (p *PositionRepositoryImpl) AddPosition(addPositionForm request.AddPositionForm) (int, error) {
	if addDdErr := p.DB.Create(
		&database.PositionModel{
			Name:   addPositionForm.Name,
			Author: addPositionForm.Author,
		}).Error; addDdErr != nil {
		return http.StatusBadRequest, addDdErr
	}

	return http.StatusOK, nil
}

func (p *PositionRepositoryImpl) GetPositions(positionIDs string) (int, []database.PositionModel, error) {
	positions := make([]database.PositionModel, 0)

	if positionIDs != "" {
		positionIdsSlice := strings.Split(positionIDs, ",")
		var positionIds []int64
		for _, positionIdStr := range positionIdsSlice {
			positionId, _ := strconv.ParseInt(positionIdStr, 10, 64)
			positionIds = append(positionIds, positionId)
		}

		p.DB.Where("id IN (?)", positionIds).Find(&positions)
	} else {
		p.DB.Find(&positions)
	}

	return http.StatusOK, positions, nil
}
