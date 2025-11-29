package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"server/internal/cloud"
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/services"
	"server/internal/utils"
	"server/pkg/app"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type TeamController struct {
	teamService services.TeamService
	cloud       *cloud.Cloud
}

func NewTeamController(
	service services.TeamService,
	cloud *cloud.Cloud,
) *TeamController {
	return &TeamController{
		teamService: service,
		cloud:       cloud,
	}
}

func (tc *TeamController) EditTeam(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}
	formData := request.EditTeamInfoForm{}

	if bindErr := gCtx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	ctx := gCtx.Request.Context()

	image, err := appGin.Ctx.FormFile("image")
	if err != http.ErrMissingFile {
		// err := tc.cloud.Cloud.RemoveFile(ctx,)

		params := utils.ReadFileParams{
			File:    image,
			SaveDir: other.TEAM_IMAGES_STORAGE,
		}

		readFileResult, err := utils.ReadFile(params)
		if err != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				err,
			)
			return
		}

		if saveErr := tc.cloud.Cloud.UploadFile(ctx, readFileResult.FilePath, readFileResult.FileData); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
			return
		}

		formData.Image = readFileResult.FileName
	} else {
		formData.Image = ""
	}

	httpCode, err := tc.teamService.EditTeam(formData)
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

	savePath := filepath.Join(other.TEAM_IMAGES_STORAGE, fileName)
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
	var FetchAllTeams request.FetchAllTeamsByParamsRequest

	FetchAllTeams.Title = ctx.Query("title")
	FetchAllTeams.Wanted = ctx.Query("wanted")
	FetchAllTeams.Members = ctx.Query("members")

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
