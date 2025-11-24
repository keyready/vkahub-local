package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewAuthRouters(
	r *gin.Engine,
	jwtService *authorizer.Authorizer,
	ac *controllers.AuthController,
) {
	authRouters := r.Group("/api/auth")
	{
		authRouters.POST("/sign-up", ac.SignUp)
		authRouters.POST("/login", ac.Login)
		authRouters.GET("/logout", middleware.AuthMiddleware(jwtService), ac.Logout)
		authRouters.POST("/refresh_token", ac.RefreshToken)
		authRouters.POST("/recovery", ac.ResetPassword)
		authRouters.POST("/change_password", ac.RecoveryPassword)
	}
}
