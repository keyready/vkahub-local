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

type EventController struct {
	eventService services.EventService
	cloud        *cloud.Cloud
}

func NewEventController(
	service services.EventService,
	cloud *cloud.Cloud,
) *EventController {
	return &EventController{
		eventService: service,
		cloud:        cloud,
	}
}

func (ec *EventController) RegisterEvent(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}
	formData := request.RegisterEventForm{}

	if bindErr := appGin.Ctx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	image, err := gCtx.FormFile("image")
	if err != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError, err,
		)
		return
	}

	readFileParams := utils.ReadFileParams{
		File:    image,
		SaveDir: dto.EVENTS_FOLDER,
	}

	readFileResult, err := utils.ReadFile(readFileParams)
	if err != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			err,
		)
		return
	}

	ctx := gCtx.Request.Context()
	if saveErr := ec.cloud.Cloud.UploadFile(ctx, readFileResult.FileKey, readFileResult.FileData); saveErr != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			saveErr,
		)
	}

	formData.Image = readFileResult.FullFilePath
	_, err = ec.eventService.RegisterEvent(formData)
	if err != nil {
		appGin.ErrorResponse(http.StatusInternalServerError, err)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (ec *EventController) GetEvent(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	eventIdString := ctx.Query("eventId")
	eventId, _ := strconv.ParseInt(eventIdString, 10, 64)

	httpCode, event, err := ec.eventService.GetEvent(eventId)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
	}

	appGin.SuccessResponse(httpCode, event)
}

func (ec *EventController) GetEvents(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	form := request.GetEventsForm{}

	form.Type = ctx.Query("type")
	form.Username = ctx.GetString("username")

	httpCode, events, err := ec.eventService.GetEvents(form)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, events)
}

func (ec *EventController) GetTracksEvent(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	eventIdString := ctx.Query("eventId")
	eventId, _ := strconv.ParseInt(eventIdString, 10, 64)

	httpCode, tracks, err := ec.eventService.GetTracksEvent(eventId)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, tracks)
}
