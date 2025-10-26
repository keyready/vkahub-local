package v1

import (
	"backend/internal/controllers"
	"backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func NewSkillRoutes(r *gin.Engine, sc *controllers.SkillController) {
	skillRoutes := r.Group("/api/skills")

	skillRoutes.Use(middleware.AuthMiddleware())

	skillRoutes.GET("", sc.FetchAllSkills)
	skillRoutes.POST("/create", sc.AddSkill)
}
