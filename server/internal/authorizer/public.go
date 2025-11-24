package authorizer

type Authorizer struct {
	Authorizer IAuthorizer
}

type IAuthorizer interface {
	GenerateTokens(payload Payload) (tokens TokensResponse)
	ValidateToken(tokenString string) (*JwtClaims, error)
}
