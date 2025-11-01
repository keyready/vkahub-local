package controllers

import (
	"backend/internal/services"
	"backend/pkg/app"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReportController struct {
	reportService services.ReportService
}

func NewReportControllers(reportService services.ReportService) *ReportController {
	return &ReportController{reportService: reportService}
}

func (rc *ReportController) GenerateReport(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	eventId, _ := strconv.ParseInt(ctx.PostForm("eventId"), 10, 64)

	httpCode, err, reportName := rc.reportService.GenerateReport(eventId)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"reportName": "/app/reports/" + reportName})
	// ctx.File("/app/server/backend/" + reportName)
}
