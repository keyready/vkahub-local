package controllers

import (
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type ProposalController struct {
	proposalService services.ProposalService
}

func NewProposalControllers(proposalService services.ProposalService) *ProposalController {
	return &ProposalController{proposalService: proposalService}
}

func (pc *ProposalController) CancelProposal(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	propId, _ := strconv.ParseInt(ctx.PostForm("proposalId"), 10, 64)
	aprProp := request.ApproveProposalRequest{
		Username:   ctx.GetString("username"),
		ProposalId: propId,
	}

	httpCode, err := pc.proposalService.CancelProposal(aprProp.ProposalId)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (pc *ProposalController) ApproveProposal(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	propId, _ := strconv.ParseInt(ctx.PostForm("proposalId"), 10, 64)

	aprProp := request.ApproveProposalRequest{
		Username:   ctx.GetString("username"),
		ProposalId: propId,
	}

	httpCode, err := pc.proposalService.ApproveProposal(aprProp)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (pc *ProposalController) CreateProposal(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var cpe request.CreateProposalRequest

	bindErr := ctx.ShouldBindJSON(&cpe)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, serviceErr := pc.proposalService.CreateProposal(cpe)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (pc *ProposalController) FetchPersonalProposals(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	fetchPropRequest := request.FetchProposalRequest{
		Type:       ctx.Query("type"),
		KtoSmotrit: ctx.GetString("username"),
	}

	httpCode, err, data := pc.proposalService.FetchPersonalProposals(fetchPropRequest)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, data)
}
