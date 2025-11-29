package middleware

import (
	"errors"
	"net/http"
	"server/internal/authorizer"
	"strings"

	"github.com/gin-gonic/gin"
)

func OnlineMiddleware() gin.HandlerFunc {
	return func(gCtx *gin.Context) {
		if username, exists := gCtx.Get("username"); exists {
			_ = username
			// TODO - маркируем валидный авторизованный запрос (пользователь подтвердил онлайн)

			gCtx.Next()
		}
	}
}

func AuthMiddleware(jwtService *authorizer.Authorizer) gin.HandlerFunc {
	return func(gCtx *gin.Context) {

		authHeader := gCtx.Request.Header.Get("Authorization")
		if authHeader == "" {
			gCtx.AbortWithError(
				http.StatusUnauthorized,
				errors.New("auth header not found"),
			)

			gCtx.JSON(
				http.StatusUnauthorized,
				gin.H{"error": "Неавторизованный запрос"},
			)

			return
		}

		accessTokenString := strings.Split(authHeader, " ")[1]

		claims, err := jwtService.Authorizer.ValidateToken(accessTokenString)
		if err != nil {
			gCtx.AbortWithError(
				http.StatusUnauthorized,
				errors.New("token is invalid"),
			)

			gCtx.JSON(
				http.StatusUnauthorized,
				gin.H{"error": "Неавторизованный запрос"},
			)
			return
		}

		gCtx.Set("username", claims.Payload.Username)

		gCtx.Next()
	}
}
