package v1

import (
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewAuthRouters(r *gin.Engine, ac *controllers.AuthController) {
	authRouters := r.Group("/api/auth")

	authRouters.POST("/sign-up", ac.SignUp)
	authRouters.POST("/login", ac.Login)
	authRouters.GET("/logout", middleware.AuthMiddleware(), ac.Logout)
	authRouters.POST("/refresh_token", ac.RefreshToken)
	authRouters.POST("/recovery", ac.ResetPassword)
	authRouters.POST("/change_password", ac.RecoveryPassword)
}
