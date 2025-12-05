package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewUserRouters(r *gin.Engine, jwtService *authorizer.Authorizer, uc *controllers.UserController) {
	userRouters := r.Group("/api")

	r.GET("/api/profile", uc.GetProfile)

	userRouters.Use(middleware.AuthMiddleware(jwtService))
	{
		userRouters.POST("/notifications/read", uc.UpdateNotification)
		userRouters.GET("/members", uc.GetMembersByParams)
		userRouters.GET("/get_user_data", uc.GetUserData)
		userRouters.POST("/user/change_profile", uc.EditProfile)
		userRouters.GET("/profile-achievements", uc.GetPersonalAchievements)
		userRouters.POST("/user/add_portfolio", uc.AddPortfolio)
		userRouters.POST("/user/delete_portfolio", uc.DeletePortfolio)
		userRouters.GET("/user/get_banned_reason", uc.GetBannedReason)
		userRouters.POST("/user/settings", uc.SetSettings)
		userRouters.GET("/user/settings", uc.GetSettings)
	}
}
