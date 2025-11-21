package v1

import (
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewFeedbackRoutes(r *gin.Engine, fc *controllers.FeedbackController) {
	feedRoutes := r.Group("/api/feedbacks")

	feedRoutes.Use(middleware.AuthMiddleware())

	feedRoutes.GET("", fc.FetchAllFeedbacks)
	feedRoutes.POST("/create", fc.AddFeedback)
}
