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
	if err := s.Db.Create(
		&database.SkillModel{
			Name:   addSkillForm.Name,
			Author: addSkillForm.Author.Username,
		}).Error; err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusCreated, nil
}

func (s SkillRepositoryImpl) GetAllSkills(skillsString string) (int, []database.SkillModel, error) {
	skills := make([]database.SkillModel, 0)

	if skillsString != "" {
		skillsSplit := strings.Split(skillsString, ",")

		skillIDs := make([]int64, len(skillsSplit))
		for _, skillID := range skillsSplit {
			skillIDInt, _ := strconv.ParseInt(skillID, 10, 64)
			skillIDs = append(skillIDs, skillIDInt)
		}

		err := s.Db.Where("id IN ?", skillIDs).Find(&skills).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return http.StatusNotFound, nil, fmt.Errorf("skills not found: %v", err)
			}
		}
	}

	err := s.Db.Find(&skills).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return http.StatusNotFound, nil, fmt.Errorf("skills not found: %v", err)
		}
	}

	return http.StatusOK, skills, nil
}
