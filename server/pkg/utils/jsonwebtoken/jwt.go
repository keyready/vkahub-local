package jsonwebtoken

import (
	"server/internal/dto/response"

	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Payload struct {
	Username string `json:"username"`
}

type JwtClaims struct {
	jwt.RegisteredClaims
	Payload Payload
}

func GenerateTokens(payload Payload) (respLogin response.LoginResponse) {

	accessClaims := JwtClaims{
		Payload: payload,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(3 * time.Hour)),
		},
	}

	refreshClaims := JwtClaims{
		Payload: payload,
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
