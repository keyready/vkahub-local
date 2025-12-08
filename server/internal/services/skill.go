package services

import (
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/repositories"
)

type SkillService interface {
	AddSkill(addSkillForm request.AddSkillForm) (int, error)
	GetAllSkills(skillIDs string) (int, []database.SkillModel, error)
}

type SkillServiceImpl struct {
	SkillRepository repositories.SkillRepository
}

func NewSkillServiceImpl(skillRepository repositories.SkillRepository) SkillService {
	return &SkillServiceImpl{SkillRepository: skillRepository}
}

func (s SkillServiceImpl) AddSkill(addSkillForm request.AddSkillForm) (int, error) {
	httpCode, err := s.SkillRepository.AddSkill(addSkillForm)
	return httpCode, err
}

func (s SkillServiceImpl) GetAllSkills(skillIDs string) (int, []database.SkillModel, error) {
	httpCode, skills, err := s.SkillRepository.GetAllSkills(skillIDs)
	return httpCode, skills, err
}
