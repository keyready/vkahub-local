package repositories

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"server/internal/authorizer"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/utils"
	"strings"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type AuthRepository interface {
	SignUp(signUpForm request.SignUpForm) (int, error)
	Login(loginForm request.LoginForm) (int, error)
	RefreshToken(refreshToken string) (*authorizer.TokensResponse, error)
	Logout(username string) (int, error)
	GetRecoveryQuestions() (int, []database.RecoveryQuestionModel, error)
	GetPersonalQuestion(getPersonalQuestionForm request.GetPersonalQuestionForm) (int, error, string)
	ApproveRecovery(approveRecoveryForm request.ApproveRecoveryForm) (int, error)
	ChangePassword(recoveryPasswordForm request.RecoveryPasswordForm) (int, error)
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

func (a *AuthRepositoryImpl) ChangePassword(recoveryPasswordForm request.RecoveryPasswordForm) (int, error) {
	userRecovery := database.UserModel{}
	if err := a.Db.Where("username = ?", recoveryPasswordForm.Username).First(&userRecovery).Error; err != nil {
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
) (int, error, string) {
	userRecovery := database.UserModel{}
	recovery := database.RecoveryQuestion{}

	if err := a.Db.Where("username = ?", getPersonalQuestionForm.Username).First(&userRecovery).Error; err != nil {
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

func (a *AuthRepositoryImpl) GetRecoveryQuestions() (int, []database.RecoveryQuestionModel, error) {
	questions := make([]database.RecoveryQuestionModel, 0)
	if err := a.Db.Find(&questions).Error; err != nil {
		return http.StatusInternalServerError, nil, err
	}
	return http.StatusOK, questions, nil
}

func (a *AuthRepositoryImpl) SignUp(signUpForm request.SignUpForm) (int, error) {
	userExist := database.UserModel{}
	if err := a.Db.Where("username = ?", signUpForm.Username).First(&userExist).Error; err == nil {
		return http.StatusBadRequest, errors.New("user with this username already exists")
	}

	hashPassword, _ := utils.GenerateHash(signUpForm.Password)

	avatarObj := database.ImageObj{
		Image: signUpForm.Avatar,
		Hash:  signUpForm.AvatarHash,
	}
	avatarJson := utils.ToJSON(avatarObj)

	a.Db.Create(&database.UserModel{
		Username: signUpForm.Username,
		Password: hashPassword,
		Avatar:   datatypes.JSON(avatarJson),
	})

	return http.StatusCreated, nil
}

func (a *AuthRepositoryImpl) Login(loginForm request.LoginForm) (int, error) {
	loginUser := database.UserModel{}
	if err := a.Db.Where("username = ?", loginForm.Username).First(&loginUser).Error; err != nil {
		return http.StatusNotFound, errors.New("user not found")
	}

	verifyPasswd := utils.CompareHash(loginUser.Password, loginForm.Password)
	if !verifyPasswd {
		return http.StatusBadRequest, errors.New("invalid password")
	}

	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) RefreshToken(refreshToken string) (*authorizer.TokensResponse, error) {
	userModel := database.UserModel{}

	err := a.Db.Where("refresh_token = ?", refreshToken).First(&userModel).Error
	if err != nil {
		return nil, err
	}

	payload := authorizer.Payload{
		Username: userModel.Username,
	}

	tokens, err := a.jwtService.Authorizer.GenerateTokens(payload)
	if err != nil {
		return nil, err
	}

	userModel.RefreshToken = tokens.RefreshToken
	a.Db.Save(&userModel)

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
