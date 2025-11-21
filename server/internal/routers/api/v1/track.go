package v1

import (
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewTrackRouters(r *gin.Engine, trc *controllers.TrackController) {
	trackController := r.Group("/api/tracks")

	trackController.Use(middleware.AuthMiddleware())

	trackController.POST("/add", trc.AddTrack)
	trackController.GET("/track", trc.FetchOneTrack)
	trackController.POST("/partTeam", trc.PartTeamInTrack)
}
