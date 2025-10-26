package controllers

import (
	"backend/internal/services"
	"backend/pkg/app"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
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

	appGin.SuccessResponse(http.StatusOK, gin.H{"reportName": reportName})
}
