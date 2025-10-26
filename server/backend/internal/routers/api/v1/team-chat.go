package v1

import (
	"backend/internal/controllers"
	"backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func NewTeamChatRoutes(r *gin.Engine, teamChatC *controllers.TeamChatController) {
	teamChatRoutes := r.Group("/api/messages")

	teamChatRoutes.Use(middleware.AuthMiddleware())

	teamChatRoutes.POST("/delete", teamChatC.DeleteMessage)
	teamChatRoutes.POST("/edit", teamChatC.UpdateMessage)
	teamChatRoutes.POST("/create", teamChatC.CreateMessage)
}
