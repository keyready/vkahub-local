package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewPositionsRoutes(r *gin.Engine, jwtService *authorizer.Authorizer, rc *controllers.PositionController) {
	positionRoutes := r.Group("/api/positions")
	positionRoutes.Use(middleware.AuthMiddleware(jwtService))
	{
		positionRoutes.GET("", rc.FetchAllPositions)
		positionRoutes.POST("/create", rc.AddPosition)
	}
}
