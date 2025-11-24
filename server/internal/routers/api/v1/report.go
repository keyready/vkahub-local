package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewReportRoutes(r *gin.Engine, jwtService *authorizer.Authorizer, rc *controllers.ReportController) {
	reportRoutes := r.Group("/api/report")
	reportRoutes.Use(middleware.AuthMiddleware(jwtService))
	{
		reportRoutes.POST("/create-report", rc.GenerateReport)
	}
}
