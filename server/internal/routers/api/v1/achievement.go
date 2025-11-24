package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewAchievementRoutes(
	r *gin.Engine,
	jwtService *authorizer.Authorizer,
	ac *controllers.AchievementController,
) {
	acRoutes := r.Group("/api/achievements")
	acRoutes.Use(middleware.AuthMiddleware(jwtService))
	{
		acRoutes.POST("/create", ac.AddAchievement)
		acRoutes.GET("", ac.FetchAchievementsTeam)
	}
}
