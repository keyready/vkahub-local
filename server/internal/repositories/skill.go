package repositories

import (
	"net/http"
	"server/internal/dto/request"
	"server/internal/database"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

type SkillRepository interface {
	AddSkill(addSkill request.AddSkillReq) (httpCode int, err error)
	FetchAllSkills(skillIdsString string) (httpCode int, err error, skills []database.SkillModel)
}

type SkillRepositoryImpl struct {
	Db *gorm.DB
}

func NewSkillRepositoryImpl(db *gorm.DB) SkillRepository {
	return &SkillRepositoryImpl{Db: db}
}

func (s SkillRepositoryImpl) AddSkill(addSkill request.AddSkillReq) (httpCode int, err error) {
	if addDbErr := s.Db.Create(
		&database.SkillModel{
			Name:   addSkill.Name,
			Author: addSkill.Author,
		}).Error; addDbErr != nil {
		return http.StatusBadRequest, addDbErr
	}

	return http.StatusOK, nil
}

func (s SkillRepositoryImpl) FetchAllSkills(skillIdsString string) (httpCode int, err error, skills []database.SkillModel) {
	if skillIdsString != "" {
		skillIdsSlice := strings.Split(skillIdsString, ",")
		var skillIds []int64
		for _, skillId := range skillIdsSlice {
			skillIdInt, _ := strconv.ParseInt(skillId, 10, 64)
			skillIds = append(skillIds, skillIdInt)
		}

		s.Db.Where("id IN ?", skillIds).Find(&skills)

	} else {
		s.Db.Find(&skills)
	}

	return http.StatusOK, nil, skills
}
