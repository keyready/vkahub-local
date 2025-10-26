package controllers

import (
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type EventController struct {
	eventService  services.EventService
}

func NewEventController(service services.EventService) *EventController {
	return &EventController{eventService: service}
}

func (ec *EventController) AddEvent(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var addEvent request.AddEventReq

	bindErr := appGin.Ctx.Bind(&addEvent)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	// extFile := strings.Split(addEvent.Image.Filename, ".")[len(strings.Split(addEvent.Image.Filename, "."))-1]
	// addEvent.Image.Filename = "events/" + uuid.NewString() + "." + extFile

	_, err := ec.eventService.AddEvent(addEvent)
	if err != nil {
		appGin.ErrorResponse(http.StatusInternalServerError, err)
		return
	}

	// bodyFile, _ := addEvent.Image.Open()
	// defer bodyFile.Close()
	// ec.YaCloudClient.PutObject(context.TODO(), &s3.PutObjectInput{
	// 	Bucket: aws.String(os.Getenv("BUCKET_NAME")),
	// 	Key:    aws.String(addEvent.Image.Filename),
	// 	Body:   bodyFile,
	// })

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (ec *EventController) ParseInfoEvent(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	url := ctx.PostForm("url")
	httpCode, err, shortInfoEvent := ec.eventService.ParseInfoEvent(url)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, shortInfoEvent)
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
