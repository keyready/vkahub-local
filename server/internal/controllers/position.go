package controllers

import (
	"net/http"
	"server/internal/forms/request"
	"server/internal/services"
	"server/pkg/app"

	"github.com/gin-gonic/gin"
)

type PositionController struct {
	positionService services.PositionService
}

func NewPositionController(positionService services.PositionService) *PositionController {
	return &PositionController{positionService: positionService}
}

func (p *PositionController) AddPosition(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.AddPositionForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	jsonForm.Author.Username = ctx.GetString("username")

	httpCode, serviceErr := p.positionService.AddPosition(jsonForm)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (p *PositionController) GetPositions(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	idsString := ctx.Query("positionIds")

	httpCode, positions, err := p.positionService.GetPositions(idsString)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, positions)
}
