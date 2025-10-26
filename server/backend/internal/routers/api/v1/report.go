package v1

import (
	"backend/internal/controllers"
	"backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func NewReportRoutes(r *gin.Engine, rc *controllers.ReportController) {
	reportRoutes := r.Group("/api/report")

	reportRoutes.Use(middleware.AuthMiddleware())

	reportRoutes.POST("/create-report", rc.GenerateReport)
}
