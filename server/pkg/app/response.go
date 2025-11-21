package app

import (
	"github.com/gin-gonic/gin"
)

type Gin struct {
	Ctx *gin.Context
}

func (g *Gin) ErrorResponse(httpCode int, err error) {
	g.Ctx.AbortWithStatusJSON(httpCode, gin.H{"error": err.Error()})
}

func (g *Gin) SuccessResponse(httpCode int, data interface{}) {
	g.Ctx.JSON(httpCode, data)
}
