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
		eventRouters.GET("", ec.FetchAllEvents)
		eventRouters.POST("/create", ec.AddEvent)
		eventRouters.GET("/event", ec.FetchOneEvent)
		eventRouters.GET("/tracks", ec.FetchTracksEvent)
	}
}
