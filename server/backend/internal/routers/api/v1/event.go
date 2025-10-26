package v1

import (
	"backend/internal/controllers"
	"backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func NewEventRouters(r *gin.Engine, ec *controllers.EventController) {
	eventRouters := r.Group("/api/events")

	eventRouters.Use(middleware.AuthMiddleware())

	eventRouters.GET("", ec.FetchAllEvents)
	eventRouters.POST("/create", ec.AddEvent)
	eventRouters.GET("/event", ec.FetchOneEvent)
	eventRouters.GET("/tracks", ec.FetchTracksEvent)
	eventRouters.POST("/parse", ec.ParseInfoEvent)
}
