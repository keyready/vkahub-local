package controllers

import (
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"github.com/gin-gonic/gin"
	"net/http"
)

type SkillController struct {
	skillService services.SkillService
}

func NewSkillControllers(skillService services.SkillService) *SkillController {
	return &SkillController{skillService: skillService}
}

func (s *SkillController) AddSkill(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var addSkillReq request.AddSkillReq

	if bindErr := ctx.ShouldBindJSON(&addSkillReq); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	addSkillReq.Author = ctx.GetString("username")

	httpCode, serviceErr := s.skillService.AddSkill(addSkillReq)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (s *SkillController) FetchAllSkills(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	idsString := ctx.Query("skillsId")

	httpCode, err, skills := s.skillService.FetchAllSkills(idsString)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, skills)
}
