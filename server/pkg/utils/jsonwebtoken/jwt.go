package jsonwebtoken

import (
	"server/internal/dto/other"
	"server/internal/dto/response"

	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateTokens(username string) (respLogin response.LoginResponse) {

	accessClaims := other.JwtClaims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(3 * time.Hour)),
		},
	}

	refreshClaims := other.JwtClaims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	jwtAccessSecretKey := []byte(`access-secret-key`)
	accessTokenString, _ := accessToken.SignedString(jwtAccessSecretKey)

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	jwtRefreshSecretKey := []byte(`refresh-secret-key`)
	refreshTokenString, _ := refreshToken.SignedString(jwtRefreshSecretKey)

	tokens := response.LoginResponse{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}

	return tokens

}
