package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewTeamChatRoutes(r *gin.Engine, jwtService *authorizer.Authorizer, teamChatC *controllers.TeamChatController) {
	teamChatRoutes := r.Group("/api/messages")
	teamChatRoutes.Use(middleware.AuthMiddleware(jwtService))
	{
		teamChatRoutes.POST("/delete", teamChatC.DeleteMessage)
		teamChatRoutes.POST("/edit", teamChatC.UpdateMessage)
		teamChatRoutes.POST("/create", teamChatC.CreateMessage)
	}
}
