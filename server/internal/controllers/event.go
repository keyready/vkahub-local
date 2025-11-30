package controllers

import (
	"net/http"
	"server/internal/cloud"
	"server/internal/dto/other"
	"server/internal/dto/request"
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

func (ec *EventController) AddEvent(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}
	formData := request.AddEventReq{}

	if bindErr := appGin.Ctx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	readFileParams := utils.ReadFileParams{
		File:    formData.Image,
		SaveDir: other.EVENTS_STORAGE,
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
	if saveErr := ec.cloud.Cloud.UploadFile(ctx, readFileResult.FilePath, readFileResult.FileData); saveErr != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			saveErr,
		)
	}

	formData.Image.Filename = readFileResult.FilePath
	_, err = ec.eventService.AddEvent(formData)
	if err != nil {
		appGin.ErrorResponse(http.StatusInternalServerError, err)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (ec *EventController) FetchOneEvent(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	eventIdString := ctx.Query("eventId")
	eventId, _ := strconv.ParseInt(eventIdString, 10, 64)

	httpCode, err, data := ec.eventService.FetchOneEvent(eventId)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
	}

	appGin.SuccessResponse(httpCode, data)
}

func (ec *EventController) FetchAllEvents(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var fetchAllEvents request.FetchAllEventsRequest

	fetchAllEvents.Type = ctx.Query("type")
	fetchAllEvents.Username = ctx.GetString("username")

	httpCode, serviceErr, events := ec.eventService.FetchAllEvents(fetchAllEvents)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusOK, events)
}

func (ec *EventController) FetchTracksEvent(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	eventIdString := ctx.Query("eventId")
	eventId, _ := strconv.ParseInt(eventIdString, 10, 64)

	httpCode, err, data := ec.eventService.FetchTracksEvent(eventId)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, data)
}
