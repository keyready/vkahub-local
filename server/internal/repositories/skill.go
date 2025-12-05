package repositories

import (
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

type SkillRepository interface {
	AddSkill(addSkillForm request.AddSkillForm) (int, error)
	GetAllSkills(skillIDs string) (int, []database.SkillModel, error)
}

type SkillRepositoryImpl struct {
	Db *gorm.DB
}

func NewSkillRepositoryImpl(db *gorm.DB) SkillRepository {
	return &SkillRepositoryImpl{Db: db}
}

func (s SkillRepositoryImpl) AddSkill(addSkillForm request.AddSkillForm) (int, error) {
	if addDbErr := s.Db.Create(
		&database.SkillModel{
			Name:   addSkillForm.Name,
			Author: addSkillForm.Author,
		}).Error; addDbErr != nil {
		return http.StatusBadRequest, addDbErr
	}

	return http.StatusOK, nil
}

func (s SkillRepositoryImpl) GetAllSkills(skillIDs string) (int, []database.SkillModel, error) {
	skills := make([]database.SkillModel, 0)

	if skillIDs != "" {
		skillIdsSlice := strings.Split(skillIDs, ",")
		var skillIds []int64
		for _, skillId := range skillIdsSlice {
			skillIdInt, _ := strconv.ParseInt(skillId, 10, 64)
			skillIds = append(skillIds, skillIdInt)
		}

		s.Db.Where("id IN ?", skillIds).Find(&skills)

	} else {
		s.Db.Find(&skills)
	}

	return http.StatusOK, skills, nil
}
