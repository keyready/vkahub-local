package controllers

import (
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

const (
	TEAM_IMAGE_STORAGE = "/app/team-images"
)

type TeamController struct {
	teamService services.TeamService
}

func NewTeamController(service services.TeamService) *TeamController {
	return &TeamController{
		teamService: service,
	}
}

func (tc *TeamController) EditTeam(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var editTeamRequest request.EditTeamRequest

	bindErr := ctx.ShouldBind(&editTeamRequest)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := tc.teamService.EditTeam(editTeamRequest)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, gin.H{})
}

func (tc *TeamController) PartInTeam(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var partInTeam request.PartInTeam

	bindErr := ctx.ShouldBindJSON(&partInTeam)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := tc.teamService.PartInTeam(partInTeam)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (tc *TeamController) TransferCaptainRights(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var transCaptainRig request.TransferCaptainRightsRequest

	bindErr := ctx.ShouldBindJSON(&transCaptainRig)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	transCaptainRig.Owner = ctx.GetString("username")

	httpCode, serviceErr := tc.teamService.TransferCaptainRights(transCaptainRig)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (tc *TeamController) DeleteMember(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var deleteMember request.DeleteMemberRequest

	bindErr := ctx.ShouldBindJSON(&deleteMember)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, serviceErr := tc.teamService.DeleteMember(deleteMember)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusOK, gin.H{})
}

func (tc *TeamController) RegisterTeam(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	formData := request.RegisterTeamForm{}

	bindErr := ctx.ShouldBind(&formData)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	fileName := fmt.Sprintf("%s_%s", formData.Title, strings.ReplaceAll(formData.Image.Filename, " ", "_"))
	formData.Image.Filename = fileName

	httpCode, serviceErr := tc.teamService.RegisterTeam(formData)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	savePath := filepath.Join(TEAM_IMAGE_STORAGE, fileName)
	if saveErr := appGin.Ctx.SaveUploadedFile(formData.Image, savePath); saveErr != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			saveErr,
		)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (tc *TeamController) FetchOneTeamById(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	tId := ctx.Query("id")

	teamId, _ := strconv.ParseInt(tId, 10, 64)

	httpCode, serviceErr, data := tc.teamService.FetchOneTeamById(teamId)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(httpCode, data)
}

func (tc *TeamController) FetchAllTeamsByParams(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	v := validator.New()
	var FetchAllTeams request.FetchAllTeamsByParamsRequest

	FetchAllTeams.Title = ctx.Query("title")
	FetchAllTeams.Wanted = ctx.Query("wanted")
	FetchAllTeams.Members = ctx.Query("members")

	validErr := v.Struct(FetchAllTeams)
	if validErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, validErr)
		return
	}

	httpCode, _, data := tc.teamService.FetchAllTeamsByParams(FetchAllTeams)

	appGin.SuccessResponse(httpCode, data)
}

func (tc *TeamController) FetchTeamMembers(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	tId := ctx.Query("teamId")
	teamId, _ := strconv.ParseInt(tId, 10, 64)

	httpCode, serviceErr, users := tc.teamService.FetchTeamMembers(teamId)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(httpCode, users)
}

func (tc *TeamController) AddMembersInTeam(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var addMemInTeam request.AddMembersInTeamRequest

	bindErr := ctx.ShouldBindJSON(&addMemInTeam)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, serviceErr := tc.teamService.AddMembersInTeam(addMemInTeam)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (tc *TeamController) LeaveTeam(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	username := ctx.GetString("username")

	httpCode, _ := tc.teamService.LeaveTeam(username)

	appGin.SuccessResponse(httpCode, gin.H{})
}
