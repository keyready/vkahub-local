package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewBugRoutes(r *gin.Engine, jwtService *authorizer.Authorizer, bc *controllers.BugController) {
	bugRoutes := r.Group("/api/bugs")
	bugRoutes.Use(middleware.AuthMiddleware(jwtService))
	{
		bugRoutes.POST("/create", bc.RegisterBug)
		bugRoutes.GET("", bc.GetBugs)
		bugRoutes.POST("/change-status", bc.UpdateBug)
	}
}
