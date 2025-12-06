package controllers

import (
	"net/http"
	"server/internal/forms/request"
	"server/internal/services"
	"server/pkg/app"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProposalController struct {
	proposalService services.ProposalService
}

func NewProposalControllers(proposalService services.ProposalService) *ProposalController {
	return &ProposalController{proposalService: proposalService}
}

func (pc *ProposalController) CancelProposal(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	proposalID, _ := strconv.ParseInt(ctx.PostForm("proposalId"), 10, 64)

	httpCode, err := pc.proposalService.CancelProposal(proposalID)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (pc *ProposalController) ApproveProposal(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	propId, _ := strconv.ParseInt(ctx.PostForm("proposalId"), 10, 64)

	form := request.ApproveProposalForm{
		Username:   ctx.GetString("username"),
		ProposalID: propId,
	}

	httpCode, err := pc.proposalService.ApproveProposal(form)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (pc *ProposalController) CreateProposal(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.CreateProposalForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, serviceErr := pc.proposalService.CreateProposal(jsonForm)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (pc *ProposalController) GetPersonalProposals(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	form := request.GetProposalForm{
		Type:     ctx.Query("type"),
		Observer: ctx.GetString("username"),
	}

	httpCode, proposals, err := pc.proposalService.GetPersonalProposals(form)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, proposals)
}
