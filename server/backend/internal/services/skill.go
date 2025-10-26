package services

import (
	"backend/internal/dto/request"
	"backend/internal/models"
	"backend/internal/repositories"
)

type SkillService interface {
	AddSkill(addSkill request.AddSkillReq) (httpCode int, err error)
	FetchAllSkills(skillIdsString string) (httpCode int, err error, skills []models.SkillModel)
}

type SkillServiceImpl struct {
	SkillRepository repositories.SkillRepository
}

func NewSkillServiceImpl(skillRepository repositories.SkillRepository) SkillService {
	return &SkillServiceImpl{SkillRepository: skillRepository}
}

func (s SkillServiceImpl) AddSkill(addSkill request.AddSkillReq) (httpCode int, err error) {
	httpCode, err = s.SkillRepository.AddSkill(addSkill)
	return httpCode, err
}

func (s SkillServiceImpl) FetchAllSkills(skillIdsString string) (httpCode int, err error, skills []models.SkillModel) {
	httpCode, err, skills = s.SkillRepository.FetchAllSkills(skillIdsString)
	return httpCode, err, skills
}
