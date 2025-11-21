package v1

import (
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewPositionsRoutes(r *gin.Engine, rc *controllers.PositionController) {
	positionRoutes := r.Group("/api/positions")

	positionRoutes.Use(middleware.AuthMiddleware())

	positionRoutes.GET("", rc.FetchAllPositions)
	positionRoutes.POST("/create", rc.AddPosition)
}
