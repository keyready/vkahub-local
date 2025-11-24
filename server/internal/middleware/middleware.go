package middleware

import (
	"errors"
	"net/http"
	"server/internal/authorizer"
	"server/pkg/app"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtService *authorizer.Authorizer) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		appGin := app.Gin{Ctx: ctx}

		authHeader := appGin.Ctx.Request.Header.Get("Authorization")
		if authHeader == "" {
			appGin.ErrorResponse(http.StatusBadRequest, errors.New("not found authorization header"))
			return
		}

		accessTokenString := strings.Split(authHeader, " ")[1]

		claims, err := jwtService.Authorizer.ValidateToken(accessTokenString)
		if err != nil {
			appGin.ErrorResponse(
				http.StatusUnauthorized,
				err,
			)
			return
		}

		ctx.Set("username", claims.Payload.Username)

		ctx.Next()
	}
}
