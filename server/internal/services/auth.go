package services

import (
	"server/internal/authorizer"
	"server/internal/database"
	"server/internal/dto/request"
	"server/internal/repositories"
)

type AuthService interface {
	SignUp(singUp request.SignUpRequest, avatarName string) (httpCode int, err error)
	Login(login request.LoginRequest) (httpCode int, err error)
	RefreshToken(refreshToken string) (data authorizer.TokensResponse, err error)
	Logout(username string) (httpCode int, err error)
	GetRecoveryQuestions() (httpCode int, questions []database.RecoveryQuestionModel, err error)
	GetPersonalQuestion(getPersonalQuestionForm request.GetPersonalQuestionForm) (httpCode int, err error, question string)
	ApproveRecovery(approveRecoveryForm request.ApproveRecoveryForm) (httpCode int, err error)
	ChangePassword(recoveryPasswordForm request.RecoveryPasswordForm) (httpCode int, err error)
}

type AuthServiceImpl struct {
	AuthRepository repositories.AuthRepository
}

func NewAuthServiceImpl(authRepository repositories.AuthRepository) AuthService {
	return &AuthServiceImpl{
		AuthRepository: authRepository,
	}
}

func (a AuthServiceImpl) ChangePassword(recoveryPasswordForm request.RecoveryPasswordForm) (httpCode int, err error) {
	httpCode, err = a.AuthRepository.ChangePassword(recoveryPasswordForm)
	return httpCode, err
}

func (a AuthServiceImpl) ApproveRecovery(approveRecovery request.ApproveRecoveryForm) (httpCode int, err error) {
	httpCode, err = a.AuthRepository.ApproveRecovery(approveRecovery)
	return httpCode, err
}

func (a AuthServiceImpl) GetPersonalQuestion(getPersonalQuestionFormForm request.GetPersonalQuestionForm) (httpCode int, err error, question string) {
	httpCode, err, question = a.AuthRepository.GetPersonalQuestion(getPersonalQuestionFormForm)
	return httpCode, err, question
}

func (a AuthServiceImpl) GetRecoveryQuestions() (httpCode int, questions []database.RecoveryQuestionModel, err error) {
	httpCode, questions, err = a.AuthRepository.GetRecoveryQuestions()
	return httpCode, questions, err
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
