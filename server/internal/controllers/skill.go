package controllers

import (
	"net/http"
	"server/internal/forms/request"
	"server/internal/services"
	"server/pkg/app"

	"github.com/gin-gonic/gin"
)

type SkillController struct {
	skillService services.SkillService
}

func NewSkillControllers(skillService services.SkillService) *SkillController {
	return &SkillController{skillService: skillService}
}

func (s *SkillController) AddSkill(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.AddSkillForm{}

	if bindErr := ctx.ShouldBindJSON(&jsonForm); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	jsonForm.Author = ctx.GetString("username")

	httpCode, serviceErr := s.skillService.AddSkill(jsonForm)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (s *SkillController) GetSkills(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	idsString := ctx.Query("skillsId")

	httpCode, skills, err := s.skillService.GetAllSkills(idsString)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, skills)
}
