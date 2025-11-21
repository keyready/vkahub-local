package v1

import (
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewReportRoutes(r *gin.Engine, rc *controllers.ReportController) {
	reportRoutes := r.Group("/api/report")

	reportRoutes.Use(middleware.AuthMiddleware())

	reportRoutes.POST("/create-report", rc.GenerateReport)
}
