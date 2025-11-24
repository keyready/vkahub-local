package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewFeedbackRoutes(r *gin.Engine, jwtService *authorizer.Authorizer, fc *controllers.FeedbackController) {
	feedRoutes := r.Group("/api/feedbacks")
	feedRoutes.Use(middleware.AuthMiddleware(jwtService))
	{
		feedRoutes.GET("", fc.FetchAllFeedbacks)
		feedRoutes.POST("/create", fc.AddFeedback)
	}
}
