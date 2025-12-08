package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewSkillRoutes(r *gin.Engine, jwtService *authorizer.Authorizer, sc *controllers.SkillController) {
	skillRoutes := r.Group("/api/skills")
	skillRoutes.Use(middleware.AuthMiddleware(jwtService))
	{
		skillRoutes.GET("", sc.GetSkills)
		skillRoutes.POST("/create", sc.AddSkill)
	}
}
