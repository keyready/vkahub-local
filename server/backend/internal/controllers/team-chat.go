package controllers

import (
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"github.com/gin-gonic/gin"
	"net/http"
)

type TeamChatController struct {
	teamChatService services.TeamChatService
}

func NewTeamChatController(teamChatService services.TeamChatService) *TeamChatController {
	return &TeamChatController{teamChatService: teamChatService}
}

func (teamChatC *TeamChatController) CreateMessage(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var newMessage request.CreateMessage

	bindErr := ctx.ShouldBind(&newMessage)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	// for _, img := range newMessage.Attachment {
	// 	img.Filename = "chat-attachments/" + uuid.NewString() + "." + strings.Split(img.Filename, ".")[len(strings.Split(img.Filename, "."))-1]
	// 	newMessage.AttachmentNames = append(newMessage.AttachmentNames, img.Filename)
	// 	bodyFile, _ := img.Open()

	// 	_, uploadErr := teamChatC.YaCloudClient.PutObject(context.TODO(), &s3.PutObjectInput{
	// 		Bucket: aws.String(os.Getenv("BUCKET_NAME")),
	// 		Key:    aws.String(img.Filename),
	// 		Body:   bodyFile,
	// 	})
	// 	if uploadErr != nil {
	// 		appGin.ErrorResponse(http.StatusInternalServerError, uploadErr)
	// 	}
	// }

	newMessage.Author = ctx.GetString("username")
	httpCode, err := teamChatC.teamChatService.CreateMessage(newMessage)
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
