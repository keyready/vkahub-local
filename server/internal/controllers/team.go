package controllers

import (
	"net/http"
	"server/internal/cloud"
	"server/internal/forms/dto"
	"server/internal/forms/request"
	"server/internal/services"
	"server/internal/utils"
	"server/pkg/app"
	"strconv"

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
			SaveDir: dto.TEAM_IMAGES_FOLDER,
		}

		readFileResult, err := utils.ReadFile(params)
		if err != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				err,
			)
			return
		}

		if saveErr := tc.cloud.Cloud.UploadFile(ctx, readFileResult.FileKey, readFileResult.FileData); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
			return
		}

		formData.Image = readFileResult.FullFilePath
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
	jsonForm := request.PartInTeamForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := tc.teamService.PartInTeam(jsonForm)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (tc *TeamController) TransferCaptainRights(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.TransferCaptainRightsForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	jsonForm.Owner = ctx.GetString("username")

	httpCode, serviceErr := tc.teamService.TransferCaptainRights(jsonForm)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (tc *TeamController) DeleteMember(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.DeleteMemberForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, serviceErr := tc.teamService.DeleteMember(jsonForm)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusOK, gin.H{})
}

func (tc *TeamController) RegisterTeam(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}

	formData := request.RegisterTeamForm{}

	if bindErr := gCtx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	image, err := gCtx.FormFile("image")
	if err != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			err,
		)
		return
	}

	readFileParams := utils.ReadFileParams{
		File:    image,
		SaveDir: dto.TEAM_IMAGES_FOLDER,
	}

	readFileResult, err := utils.ReadFile(readFileParams)
	if err != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			err,
		)
		return
	}

	formData.Image = readFileResult.FullFilePath

	httpCode, serviceErr := tc.teamService.RegisterTeam(formData)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	ctx := gCtx.Request.Context()
	if saveErr := tc.cloud.Cloud.UploadFile(ctx, readFileResult.FileKey, readFileResult.FileData); saveErr != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			saveErr,
		)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (tc *TeamController) GetTeamById(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	teamId := ctx.Query("id")

	teamID, _ := strconv.ParseInt(teamId, 10, 64)

	team, err := tc.teamService.GetTeamById(teamID)
	if err != nil {
		appGin.ErrorResponse(http.StatusInternalServerError, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, team)
}

func (tc *TeamController) GetTeamsByParams(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	queryForm := request.GetTeamsByParamsForm{}

	if bindErr := ctx.ShouldBindQuery(&queryForm); bindErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			bindErr,
		)
		return
	}
	// form.Title = ctx.Query("title")
	// form.Wanted = ctx.Query("wanted")
	// form.Members = ctx.Query("members")

	httpCode, _, data := tc.teamService.GetTeamsByParams(queryForm)

	appGin.SuccessResponse(httpCode, data)
}

func (tc *TeamController) GetTeamMembers(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	tId := ctx.Query("teamId")
	teamId, _ := strconv.ParseInt(tId, 10, 64)

	httpCode, members, err := tc.teamService.GetTeamMembers(teamId)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, members)
}

func (tc *TeamController) AddMembersInTeam(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.AddMembersInTeamForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, serviceErr := tc.teamService.AddMembersInTeam(jsonForm)
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
