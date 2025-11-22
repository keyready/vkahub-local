package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/services"
	"server/pkg/app"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type EventController struct {
	eventService services.EventService
}

func NewEventController(service services.EventService) *EventController {
	return &EventController{eventService: service}
}

func (ec *EventController) AddEvent(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	formData := request.AddEventReq{}

	bindErr := appGin.Ctx.Bind(&formData)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	formData.Image.Filename = fmt.Sprintf(
		"%s%s",
		uuid.NewString(),
		filepath.Ext(formData.Image.Filename),
	)

	if saveErr := ctx.SaveUploadedFile(
		formData.Image,
		filepath.Join(
			other.EVENTS_STORAGE,
			formData.Image.Filename,
		),
	); saveErr != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			saveErr,
		)
	}

	_, err := ec.eventService.AddEvent(formData)
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
