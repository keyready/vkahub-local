package services

import (
	"server/internal/authorizer"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/repositories"
)

type AuthService interface {
	SignUp(singUpForm request.SignUpForm) (int, error)
	Login(loginForm request.LoginForm) (int, error)
	RefreshToken(refreshToken string) (*authorizer.TokensResponse, error)
	Logout(username string) (int, error)
	GetRecoveryQuestions() (int, []database.RecoveryQuestionModel, error)
	GetPersonalQuestion(getPersonalQuestionForm request.GetPersonalQuestionForm) (int, string, error)
	ApproveRecovery(approveRecoveryForm request.ApproveRecoveryForm) (int, error)
	ChangePassword(recoveryPasswordForm request.RecoveryPasswordForm) (int, error)
}

type AuthServiceImpl struct {
	AuthRepository repositories.AuthRepository
}

func NewAuthServiceImpl(authRepository repositories.AuthRepository) AuthService {
	return &AuthServiceImpl{
		AuthRepository: authRepository,
	}
}

func (a AuthServiceImpl) ChangePassword(recoveryPasswordForm request.RecoveryPasswordForm) (int, error) {
	httpCode, err := a.AuthRepository.ChangePassword(recoveryPasswordForm)
	return httpCode, err
}

func (a AuthServiceImpl) ApproveRecovery(approveRecovery request.ApproveRecoveryForm) (int, error) {
	httpCode, err := a.AuthRepository.ApproveRecovery(approveRecovery)
	return httpCode, err
}

func (a AuthServiceImpl) GetPersonalQuestion(getPersonalQuestionFormForm request.GetPersonalQuestionForm) (int, string, error) {
	httpCode, err, question := a.AuthRepository.GetPersonalQuestion(getPersonalQuestionFormForm)
	return httpCode, question, err
}

func (a AuthServiceImpl) GetRecoveryQuestions() (int, []database.RecoveryQuestionModel, error) {
	httpCode, questions, err := a.AuthRepository.GetRecoveryQuestions()
	return httpCode, questions, err
}

func (a AuthServiceImpl) SignUp(signUpForm request.SignUpForm) (int, error) {
	httpCode, err := a.AuthRepository.SignUp(signUpForm)
	return httpCode, err
}

func (a AuthServiceImpl) Login(loginForm request.LoginForm) (int, error) {
	httpCode, err := a.AuthRepository.Login(loginForm)
	return httpCode, err
}

func (a AuthServiceImpl) RefreshToken(refreshToken string) (*authorizer.TokensResponse, error) {
	tokens, err := a.AuthRepository.RefreshToken(refreshToken)
	return tokens, err
}

func (a AuthServiceImpl) Logout(username string) (int, error) {
	httpCode, err := a.AuthRepository.Logout(username)
	return httpCode, err
}
