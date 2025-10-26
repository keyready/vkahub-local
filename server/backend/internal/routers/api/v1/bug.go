package v1

import (
	"backend/internal/controllers"
	"backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func NewBugRoutes(r *gin.Engine, bc *controllers.BugController) {
	bugRoutes := r.Group("/api/bugs")

	bugRoutes.Use(middleware.AuthMiddleware())

	bugRoutes.POST("/create", bc.AddBug)
	bugRoutes.GET("", bc.FetchAllBugs)
	bugRoutes.POST("/change-status", bc.UpdateBug)
}
