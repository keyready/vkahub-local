package controllers

import (
	"net/http"
	"server/internal/cloud"
	"server/internal/dto/other"
	"server/internal/dto/request"
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
			SaveDir: other.CHAT_ATTACHMENTS_STORAGE,
		}

		readFileResult, err := utils.ReadFile(readFileParams)
		if err != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				err,
			)
			return
		}

		if saveErr := teamChatC.cloud.Cloud.UploadFile(ctx, readFileResult.FilePath, readFileResult.FileData); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
			return
		}

		formData.AttachmentNames = append(formData.AttachmentNames, readFileResult.FilePath)
	}

	formData.Author = gCtx.GetString("username")
	httpCode, err := teamChatC.teamChatService.CreateMessage(formData)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (teamChatC *TeamChatController) DeleteMessage(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var deleteMessage request.DeleteMessage

	deleteMessage.Author = appGin.Ctx.GetString("username")

	bindErr := ctx.ShouldBindJSON(&deleteMessage)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err, _ := teamChatC.teamChatService.DeleteMessage(deleteMessage)
	if err != nil {
		appGin.ErrorResponse(http.StatusInternalServerError, err)
		return
	}

	// for _, message := range attachmentsMessage {
	// 	teamChatC.YaCloudClient.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
	// 		Bucket: aws.String(os.Getenv("BUCKET_NAME")),
	// 		Key:    aws.String(message),
	// 	})
	// }

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (teamChatC *TeamChatController) UpdateMessage(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var updateMessage request.UpdateMessage

	updateMessage.Author = appGin.Ctx.GetString("username")

	bindErr := ctx.ShouldBindJSON(&updateMessage)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := teamChatC.teamChatService.UpdateMessage(updateMessage)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, gin.H{})
}
