package authorizer

import "github.com/golang-jwt/jwt/v5"

type Payload struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
}

type JwtClaims struct {
	jwt.RegisteredClaims
	Payload Payload
}

type TokensResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
