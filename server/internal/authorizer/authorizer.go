package authorizer

import (
	"fmt"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWT struct {
	config *Config
}

func New(cfg *Config) *Authorizer {
	jwtServ := &JWT{
		config: cfg,
	}

	return &Authorizer{
		Authorizer: jwtServ,
	}
}

func (j *JWT) GenerateTokens(payload Payload) (tokens TokensResponse) {

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
	jwtAccessSecretKey := []byte(j.config.AccessSecretKey)
	accessTokenString, signedErr := accessToken.SignedString(jwtAccessSecretKey)
	if signedErr != nil {
		log.Fatalln("failed to signed access: ", signedErr.Error())
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	jwtRefreshSecretKey := []byte(j.config.RefreshSecretKey)
	refreshTokenString, signedErr := refreshToken.SignedString(jwtRefreshSecretKey)
	if signedErr != nil {
		log.Fatalln("failed to signed refresh: ", signedErr.Error())
	}

	return TokensResponse{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}
}

func (j *JWT) ValidateToken(tokenString string) (*JwtClaims, error) {
	claims := &JwtClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		expTime, _ := claims.GetExpirationTime()
		if time.Now().Unix() > expTime.Unix() {
			return nil, jwt.ErrTokenExpired
		}
		return []byte(j.config.AccessSecretKey), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("token is invalid: %v", err)
	}

	return claims, nil
}
