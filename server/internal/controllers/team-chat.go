package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/services"
	"server/pkg/app"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TeamChatController struct {
	teamChatService services.TeamChatService
}

func NewTeamChatController(teamChatService services.TeamChatService) *TeamChatController {
	return &TeamChatController{teamChatService: teamChatService}
}

func (teamChatC *TeamChatController) CreateMessage(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	formData := request.WriteMessageForm{}

	if bindErr := ctx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	multipartForm, _ := ctx.MultipartForm()

	for _, img := range multipartForm.File["attachment"] {
		fileName := fmt.Sprintf("%s%s", uuid.NewString(), filepath.Ext(img.Filename))
		img.Filename = fileName

		savePath := filepath.Join(other.CHAT_ATTACHMENTS_STORAGE, fileName)
		if saveErr := ctx.SaveUploadedFile(img, savePath); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
			return
		}

		formData.AttachmentNames = append(formData.AttachmentNames, fileName)
	}

	formData.Author = ctx.GetString("username")
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
