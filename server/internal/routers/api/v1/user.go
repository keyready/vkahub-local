package v1

import (
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewUserRouters(r *gin.Engine, uc *controllers.UserController) {
	userRouters := r.Group("/api")

	userRouters.Use(middleware.AuthMiddleware())

	userRouters.POST("/notifications/read", uc.UpdateNotification)
	userRouters.GET("/members", uc.FetchAllMembersByParams)
	userRouters.GET("/get_user_data", uc.GetUserData)
	userRouters.GET("/profile", uc.GetProfile)
	userRouters.POST("/user/change_profile", uc.EditProfile)
	userRouters.GET("/profile-achievements", uc.FetchPersonalAchievements)
	userRouters.POST("/user/add_portfolio", uc.AddPortfolio)
	userRouters.POST("/user/delete_portfolio", uc.DeletePortfolio)
	userRouters.GET("/user/get_banned_reason", uc.GetBannedReason)
}
