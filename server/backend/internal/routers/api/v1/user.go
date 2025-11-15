package v1

import (
	"backend/internal/controllers"
	"backend/internal/middleware"

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
	userRouters.POST("/user/delete_porfolio", uc.DeletePortfolio)
}
