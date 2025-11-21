package middleware

import (
	"errors"
	"net/http"
	"server/internal/dto/other"
	"server/pkg/app"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		appGin := app.Gin{Ctx: ctx}

		authHeader := appGin.Ctx.Request.Header.Get("Authorization")
		if authHeader == "" {
			appGin.ErrorResponse(http.StatusBadRequest, errors.New("not found authorization header"))
			return
		}

		accessTokenString := strings.Split(authHeader, " ")[1]

		claims := &other.JwtClaims{}
		token, err := jwt.ParseWithClaims(accessTokenString, claims, func(t *jwt.Token) (interface{}, error) {
			expTime, _ := claims.GetExpirationTime()
			if time.Now().Unix() > expTime.Unix() {
				return nil, jwt.ErrTokenExpired
			}
			return []byte(`access-secret-key`), nil
		})

		if err != nil || !token.Valid {
			appGin.ErrorResponse(http.StatusUnauthorized, err)
			return
		}

		ctx.Set("username", claims.Username)

		ctx.Next()
	}
}
