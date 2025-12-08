package controllers

import (
	"net/http"
	"server/internal/cloud"
	"server/internal/forms/dto"
	"server/internal/forms/request"
	"server/internal/services"
	"server/internal/utils"
	"server/pkg/app"

	"github.com/gin-gonic/gin"
)

type TeamChatController struct {
	teamChatService services.TeamChatService
	cloud           *cloud.Cloud
}

func NewTeamChatController(
	teamChatService services.TeamChatService,
	cloud *cloud.Cloud,
) *TeamChatController {
	return &TeamChatController{
		teamChatService: teamChatService,
		cloud:           cloud,
	}
}

func (teamChatC *TeamChatController) CreateMessage(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}
	formData := request.WriteMessageForm{}

	if bindErr := gCtx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	ctx := gCtx.Request.Context()

	multipartForm, _ := gCtx.MultipartForm()

	for _, img := range multipartForm.File["attachment"] {
		readFileParams := utils.ReadFileParams{
			File:    img,
			SaveDir: dto.CHAT_ATTACHMENTS_FOLDER,
		}

		readFileResult, err := utils.ReadFile(readFileParams)
		if err != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				err,
			)
			return
		}

		if saveErr := teamChatC.cloud.Cloud.UploadFile(ctx, readFileResult.FileKey, readFileResult.FileData); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
			return
		}

		formData.AttachmentNames = append(formData.AttachmentNames, readFileResult.FullFilePath)
	}

	formData.Author.Username = gCtx.GetString("username")
	httpCode, err := teamChatC.teamChatService.CreateMessage(formData)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (teamChatC *TeamChatController) DeleteMessage(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.DeleteMessageForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	jsonForm.Author.Username = appGin.Ctx.GetString("username")

	httpCode, _, err := teamChatC.teamChatService.DeleteMessage(jsonForm)
	if err != nil {
		appGin.ErrorResponse(http.StatusInternalServerError, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (teamChatC *TeamChatController) EditMessage(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.EditMessageForm{}

	bindErr := ctx.ShouldBindJSON(&jsonForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	jsonForm.Author.Username = appGin.Ctx.GetString("username")

	httpCode, err := teamChatC.teamChatService.EditMessage(jsonForm)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, gin.H{})
}
