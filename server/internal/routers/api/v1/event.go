package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewEventRouters(r *gin.Engine, jwtService *authorizer.Authorizer, ec *controllers.EventController) {
	eventRouters := r.Group("/api/events")
	eventRouters.Use(middleware.AuthMiddleware(jwtService))
	{
		eventRouters.GET("", ec.GetEvents)
		eventRouters.POST("/create", ec.RegisterEvent)
		eventRouters.GET("/event", ec.GetEvent)
		eventRouters.GET("/tracks", ec.GetTracksEvent)
	}
}
