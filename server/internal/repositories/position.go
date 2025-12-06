package repositories

import (
	"errors"
	"fmt"
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
	if err := p.DB.Create(
		&database.PositionModel{
			Name:   addPositionForm.Name,
			Author: addPositionForm.Author,
		}).Error; err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusCreated, nil
}

func (p *PositionRepositoryImpl) GetPositions(positionsString string) (int, []database.PositionModel, error) {
	positions := make([]database.PositionModel, 0)

	if positionsString != "" {
		positionsSplit := strings.Split(positionsString, ",")

		positionIDs := make([]int64, len(positionsSplit))
		for _, positionID := range positionsSplit {
			positionIDInt, _ := strconv.ParseInt(positionID, 10, 64)
			positionIDs = append(positionIDs, positionIDInt)
		}

		err := p.DB.Where("id IN ?", positionIDs).Find(&positions).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return http.StatusNotFound, nil, fmt.Errorf("skills not found: %v", err)
			}
		}
	}

	err := p.DB.Find(&positions).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return http.StatusNotFound, nil, fmt.Errorf("skills not found: %v", err)
		}
	}

	return http.StatusOK, positions, nil
}
