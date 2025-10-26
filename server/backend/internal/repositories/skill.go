package repositories

import (
	"backend/internal/dto/request"
	"backend/internal/models"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"strings"
)

type SkillRepository interface {
	AddSkill(addSkill request.AddSkillReq) (httpCode int, err error)
	FetchAllSkills(skillIdsString string) (httpCode int, err error, skills []models.SkillModel)
}

type SkillRepositoryImpl struct {
	Db          *gorm.DB
}

func NewSkillRepositoryImpl(db *gorm.DB) SkillRepository {
	return &SkillRepositoryImpl{Db: db}
}

func (s SkillRepositoryImpl) AddSkill(addSkill request.AddSkillReq) (httpCode int, err error) {
	if addDbErr := s.Db.Create(
		&models.SkillModel{
			Name:   addSkill.Name,
			Author: addSkill.Author,
		}).Error; addDbErr != nil {
		return http.StatusBadRequest, addDbErr
	}

	// deletedKeys, _ := s.redisClient.Keys(context.TODO(), "skillsCache:*").Result()
	// if len(deletedKeys) > 0 {
	// 	_, err = s.redisClient.Del(context.TODO(), deletedKeys...).Result()
	// 	if err != nil {
	// 		return http.StatusInternalServerError, err
	// 	}
	// }
	return http.StatusOK, nil
}

func (s SkillRepositoryImpl) FetchAllSkills(skillIdsString string) (httpCode int, err error, skills []models.SkillModel) {
	if skillIdsString != "" {
		skillIdsSlice := strings.Split(skillIdsString, ",")
		var skillIds []int64
		for _, skillId := range skillIdsSlice {
			skillIdInt, _ := strconv.ParseInt(skillId, 10, 64)
			skillIds = append(skillIds, skillIdInt)
		}

		s.Db.Where("id IN ?", skillIds).Find(&skills)

	}else{
		s.Db.Find(&skills)
	}
	
	return http.StatusOK, nil, skills
}
