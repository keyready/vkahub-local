package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewTeamRouters(r *gin.Engine, jwtService *authorizer.Authorizer, tc *controllers.TeamController) {
	teamRouters := r.Group("/api/team")

	r.GET("/api/team/teams", tc.GetTeamsByParams)
	r.GET("/api/team/members", tc.GetTeamMembers)

	teamRouters.Use(middleware.AuthMiddleware(jwtService))
	{
		teamRouters.POST("/add", tc.RegisterTeam)
		teamRouters.GET("/fetch_team", tc.GetTeamById)
		teamRouters.POST("/invite", tc.AddMembersInTeam)
		teamRouters.POST("/delete", tc.DeleteMember)
		teamRouters.POST("/transfer-captain-rights", tc.TransferCaptainRights)
		teamRouters.GET("/leave", tc.LeaveTeam)
		teamRouters.POST("/request", tc.PartInTeam)
		teamRouters.POST("/edit", tc.EditTeam)
	}
}
