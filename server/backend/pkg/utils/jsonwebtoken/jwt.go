package jsonwebtoken

import (
	"backend/internal/dto/other"
	"backend/internal/dto/response"
	"os"

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
	jwtAccessSecretKey := []byte(os.Getenv("JWT_ACCESS_SECRET_KEY"))
	accessTokenString, _ := accessToken.SignedString(jwtAccessSecretKey)

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	jwtRefreshSecretKey := []byte(os.Getenv("JWT_REFRESH_SECRET_KEY"))
	refreshTokenString, _ := refreshToken.SignedString(jwtRefreshSecretKey)

	tokens := response.LoginResponse{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}

	return tokens

}

type RecTokenClaims struct {
	jwt.RegisteredClaims
	Mail string
}

func GenerateTokenRecPassword(mail string) (token string) {
	tokenClaims := other.JwtClaims{
		Mail: mail,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(10 * time.Minute)),
		},
	}

	recPasswdToken := jwt.NewWithClaims(jwt.SigningMethodHS256, tokenClaims)
	secretKey := []byte(os.Getenv("JWT_ACCESS_SECRET_KEY"))
	recPasswdTokenString, _ := recPasswdToken.SignedString(secretKey)

	return recPasswdTokenString
}
