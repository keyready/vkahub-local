package authorizer

type Authorizer struct {
	Authorizer IAuthorizer
}

type IAuthorizer interface {
	GenerateTokens(payload Payload) (*TokensResponse, error)
	ValidateToken(tokenString string) (*JwtClaims, error)
}
