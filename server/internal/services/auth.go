package services

import (
	"server/internal/authorizer"
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/repositories"
)

type AuthService interface {
	SignUp(singUp request.SignUpRequest, avatarName string) (httpCode int, err error)
	Login(login request.LoginRequest) (httpCode int, err error)
	RefreshToken(refreshToken string) (data authorizer.TokensResponse, err error)
	Logout(username string) (httpCode int, err error)
	ResetPassword(mail string) (httpCode int, err error)
	RecoveryPassword(RecoveryPass other.RecoveryPassword) (httpCode int, err error)
}

type AuthServiceImpl struct {
	AuthRepository repositories.AuthRepository
}

func NewAuthServiceImpl(authRepository repositories.AuthRepository) AuthService {
	return &AuthServiceImpl{
		AuthRepository: authRepository,
	}
}

func (a AuthServiceImpl) SignUp(signUp request.SignUpRequest, avatarName string) (httpCode int, err error) {
	httpCode, err = a.AuthRepository.SignUp(signUp, avatarName)
	return httpCode, err
}

func (a AuthServiceImpl) Login(login request.LoginRequest) (httpCode int, err error) {
	httpCode, err = a.AuthRepository.Login(login)
	return httpCode, err
}

func (a AuthServiceImpl) RefreshToken(refreshToken string) (authorizer.TokensResponse, error) {
	tokens, err := a.AuthRepository.RefreshToken(refreshToken)
	return tokens, err
}

func (a AuthServiceImpl) Logout(username string) (httpCode int, err error) {
	httpCode, err = a.AuthRepository.Logout(username)
	return httpCode, err
}

func (a AuthServiceImpl) ResetPassword(mail string) (httpCode int, err error) {
	httpCode, err = a.AuthRepository.ResetPassword(mail)
	return httpCode, err
}

func (a AuthServiceImpl) RecoveryPassword(RecoveryPasswd other.RecoveryPassword) (httpCode int, err error) {
	httpCode, err = a.AuthRepository.RecoveryPassword(RecoveryPasswd)
	return httpCode, err
}
