package v1

import (
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewProposalRouters(r *gin.Engine, rc *controllers.ProposalController) {
	proposalRouters := r.Group("/api/proposal")

	proposalRouters.Use(middleware.AuthMiddleware())

	proposalRouters.POST("/create", rc.CreateProposal)
	proposalRouters.GET("", rc.FetchPersonalProposals)
	proposalRouters.POST("/approve", rc.ApproveProposal)
	proposalRouters.POST("/cancel", rc.CancelProposal)
}
