package repositories

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"server/internal/authorizer"
	"server/internal/database"
	"server/internal/dto/request"
	"server/internal/utils"
	"strings"

	"gorm.io/gorm"
)

type AuthRepository interface {
	SignUp(signUp request.SignUpRequest, avatarName string) (httpCode int, err error)
	Login(login request.LoginRequest) (httpCode int, err error)
	RefreshToken(refreshToken string) (tokens authorizer.TokensResponse, err error)
	Logout(username string) (httpCode int, err error)

	GetRecoveryQuestions() (httpCode int, questions []database.RecoveryQuestionModel, err error)
	GetPersonalQuestion(getPersonalQuestionForm request.GetPersonalQuestionForm) (httpCode int, err error, question string)
	ApproveRecovery(approveRecoveryForm request.ApproveRecoveryForm) (httpCode int, err error)
	ChangePassword(recoveryPasswordForm request.RecoveryPasswordForm) (httpCode int, err error)
}

type AuthRepositoryImpl struct {
	Db         *gorm.DB
	jwtService *authorizer.Authorizer
}

func NewAuthRepositoryImpl(
	Db *gorm.DB,
	jwtService *authorizer.Authorizer,
) AuthRepository {
	return &AuthRepositoryImpl{
		Db:         Db,
		jwtService: jwtService,
	}
}

func (a *AuthRepositoryImpl) ChangePassword(recoveryPasswordForm request.RecoveryPasswordForm) (httpCode int, err error) {
	userRecovery := database.UserModel{}
	if err = a.Db.Where("username = ?", recoveryPasswordForm.Username).First(&userRecovery).Error; err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to recovery password: %v", err)
	}

	hashNewPassword, _ := utils.GenerateHash(recoveryPasswordForm.NewPassword)
	userRecovery.Password = hashNewPassword
	a.Db.Save(&userRecovery)

	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) ApproveRecovery(
	approveRecoveryForm request.ApproveRecoveryForm,
) (httpCode int, err error) {
	userRecovery := database.UserModel{}
	recovery := database.RecoveryQuestion{}

	if err = a.Db.Where("username = ?", approveRecoveryForm.Username).First(&userRecovery).Error; err != nil {
		return http.StatusInternalServerError,
			fmt.Errorf(
				"user %s not found in system", approveRecoveryForm.Username,
			)
	}

	if decodeErr := json.Unmarshal(userRecovery.Recovery, &recovery); decodeErr != nil {
		return http.StatusInternalServerError,
			fmt.Errorf("failed to decode recovery: %v", decodeErr)
	}

	if validateAnswer := utils.CompareHash(
		recovery.Answer,
		strings.ReplaceAll(
			strings.ToLower(approveRecoveryForm.Answer),
			" ",
			"_",
		),
	); !validateAnswer {
		return http.StatusForbidden,
			errors.New("answer is invalid")
	}

	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) GetPersonalQuestion(
	getPersonalQuestionForm request.GetPersonalQuestionForm,
) (httpCode int, err error, recoveryQuestion string) {
	userRecovery := database.UserModel{}
	recovery := database.RecoveryQuestion{}

	if err = a.Db.Where("username = ?", getPersonalQuestionForm.Username).First(&userRecovery).Error; err != nil {
		return http.StatusNotFound,
			fmt.Errorf(
				"user %s not found in system", getPersonalQuestionForm.Username,
			),
			""
	}

	if decodeErr := json.Unmarshal(userRecovery.Recovery, &recovery); decodeErr != nil {
		return http.StatusInternalServerError,
			fmt.Errorf(
				"failed to decode: %v", decodeErr,
			),
			""
	}

	if strings.Compare(recovery.Question, "") == 0 {
		return http.StatusNotAcceptable,
			errors.New("no recovery question set"), ""
	}

	return http.StatusOK, nil, recovery.Question
}

func (a *AuthRepositoryImpl) GetRecoveryQuestions() (httpCode int, questions []database.RecoveryQuestionModel, err error) {
	if err = a.Db.Find(&questions).Error; err != nil {
		return http.StatusInternalServerError, nil, err
	}
	return http.StatusOK, questions, nil
}

func (a *AuthRepositoryImpl) SignUp(signUp request.SignUpRequest, avatarName string) (httpCode int, err error) {
	var userExist database.UserModel
	if err = a.Db.Where("username = ?", signUp.Username).First(&userExist).Error; err == nil {
		return http.StatusBadRequest, errors.New("user with this username already exists")
	}

	hashPassword, _ := utils.GenerateHash(signUp.Password)

	a.Db.Create(&database.UserModel{
		Username: signUp.Username,
		Password: hashPassword,
		Avatar:   avatarName,
	})

	return http.StatusCreated, nil
}

func (a *AuthRepositoryImpl) Login(login request.LoginRequest) (httpCode int, err error) {
	var loginUser database.UserModel
	if err = a.Db.Where("username = ?", login.Username).First(&loginUser).Error; err != nil {
		return http.StatusNotFound, errors.New("User not found")
	}

	verifyPasswd := utils.CompareHash(loginUser.Password, login.Password)
	if !verifyPasswd {
		return http.StatusBadRequest, errors.New("Invalid password")
	}

	a.Db.Save(&loginUser)

	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) RefreshToken(refreshToken string) (tokens authorizer.TokensResponse, err error) {
	var tmpUser database.UserModel

	err = a.Db.Where("refresh_token = ?", refreshToken).First(&tmpUser).Error
	if err != nil {
		return tokens, err
	}

	payload := authorizer.Payload{
		Username: tmpUser.Username,
	}

	tokens = a.jwtService.Authorizer.GenerateTokens(payload)

	tmpUser.RefreshToken = tokens.RefreshToken
	a.Db.Save(&tmpUser)

	return tokens, nil
}

func (a *AuthRepositoryImpl) Logout(username string) (httpCode int, err error) {

	var logoutUser database.UserModel
	err = a.Db.Where("username = ?", username).First(&logoutUser).Error
	if err != nil {
		return http.StatusNotFound, err
	}

	logoutUser.RefreshToken = ""
	a.Db.Save(&logoutUser)

	return http.StatusOK, nil
}
