package v1

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewProposalRouters(r *gin.Engine, jwtService *authorizer.Authorizer, rc *controllers.ProposalController) {
	proposalRouters := r.Group("/api/proposal")
	proposalRouters.Use(middleware.AuthMiddleware(jwtService))
	{
		proposalRouters.POST("/create", rc.CreateProposal)
		proposalRouters.GET("", rc.FetchPersonalProposals)
		proposalRouters.POST("/approve", rc.ApproveProposal)
		proposalRouters.POST("/cancel", rc.CancelProposal)
	}
}
