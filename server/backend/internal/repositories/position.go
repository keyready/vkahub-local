package repositories

import (
	"backend/internal/dto/request"
	"backend/internal/models"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"strings"
)

type PositionRepository interface {
	AddPosition(addPosition request.AddPositionReq) (httpCode int, err error)
	FetchAllPositions(positionIdsString string) (httpCode int, err error, positions []models.PositionModel)
}

type PositionRepositoryImpl struct {
	DB          *gorm.DB
}

func NewPositionRepImpl(DB *gorm.DB) PositionRepository {
	return &PositionRepositoryImpl{DB: DB}
}

func (p *PositionRepositoryImpl) AddPosition(addPosition request.AddPositionReq) (httpCode int, err error) {
	if addDdErr := p.DB.Create(
		&models.PositionModel{
			Name:   addPosition.Name,
			Author: addPosition.Author,
		}).Error; addDdErr != nil {
		return http.StatusBadRequest, addDdErr
	}

	// deletedKeys, _ := p.RedisClient.Keys(context.TODO(), "positionsCache:*").Result()
	// if len(deletedKeys) > 0 {
	// 	_, err = p.RedisClient.Del(context.TODO(), deletedKeys...).Result()
	// 	if err != nil {
	// 		return http.StatusInternalServerError, err
	// 	}
	// }

	return http.StatusOK, nil
}

func (p *PositionRepositoryImpl) FetchAllPositions(positionIdsString string) (httpCode int, err error, positions []models.PositionModel) {
	if positionIdsString != ""{
		positionIdsSlice := strings.Split(positionIdsString, ",")
		var positionIds []int64
		for _, positionIdStr := range positionIdsSlice {
			positionId, _ := strconv.ParseInt(positionIdStr, 10, 64)
			positionIds = append(positionIds, positionId)
		}

		p.DB.Where("id IN (?)", positionIds).Find(&positions)
	}else{
		p.DB.Find(&positions)
	}

	return http.StatusOK, nil, positions
}
