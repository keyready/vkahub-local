package controllers

import (
	"server/pkg/app"
	"net/http"
	"server/internal/dto/request"
	"server/internal/services"

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
	var addPosition request.AddPositionReq

	bindErr := ctx.ShouldBindJSON(&addPosition)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	addPosition.Author = ctx.GetString("username")

	httpCode, serviceErr := p.positionService.AddPosition(addPosition)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (p *PositionController) FetchAllPositions(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	idsString := ctx.Query("positionIds")

	httpCode, err, positions := p.positionService.FetchAllPositions(idsString)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, positions)
}
