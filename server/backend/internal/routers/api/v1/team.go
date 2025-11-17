package v1

import (
	"backend/internal/controllers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewTeamRouters(r *gin.Engine, tc *controllers.TeamController) {
	teamRouters := r.Group("/api/team")

	teamRouters.Use(middleware.AuthMiddleware())

	teamRouters.POST("/add", tc.RegisterTeam)
	teamRouters.GET("/fetch_team", tc.FetchOneTeamById)
	teamRouters.GET("/teams", tc.FetchAllTeamsByParams)
	teamRouters.GET("/members", tc.FetchTeamMembers)
	teamRouters.POST("/invite", tc.AddMembersInTeam)
	teamRouters.POST("/delete", tc.DeleteMember)
	teamRouters.POST("/transfer-captain-rights", tc.TransferCaptainRights)
	teamRouters.GET("/leave", tc.LeaveTeam)
	teamRouters.POST("/request", tc.PartInTeam)
	teamRouters.POST("/edit", tc.EditTeam)
}
