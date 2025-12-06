package repositories

import (
	"errors"
	"fmt"
	"net/http"
	"server/internal/authorizer"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/utils"
	"strings"

	"gorm.io/gorm"
)

type AuthRepository interface {
	SignUp(signUpForm request.SignUpForm) (int, error)
	SignIn(signInForm request.SignInForm) (int, *authorizer.TokensResponse, error)
	RefreshToken(refreshToken string) (*authorizer.TokensResponse, error)
	Logout(username string) (int, error)
	GetRecoveryQuestions() (int, []database.RecoveryQuestionModel, error)
	GetPersonalQuestion(getPersonalQuestionForm request.GetPersonalQuestionForm) (int, string, error)
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
	hashNewPassword, _ := utils.GenerateHash(recoveryPasswordForm.NewPassword)

	err := a.Db.Model(&database.UserModel{}).
		Where("username = ?", recoveryPasswordForm.Username).
		Update("password", hashNewPassword).Error
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to change password: %v", err)
	}

	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) ApproveRecovery(
	approveRecoveryForm request.ApproveRecoveryForm,
) (httpCode int, err error) {
	userRecovery := database.UserModel{}
	recovery := database.RecoveryQuestion{}

	if err = a.Db.Where("username = ?", approveRecoveryForm.Username).First(&userRecovery).Error; err != nil {
		return http.StatusInternalServerError, fmt.Errorf("user %s not found in system", approveRecoveryForm.Username)
	}

	if decodeErr := utils.FromJSON(userRecovery.Recovery, &recovery); decodeErr != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to decode recovery: %v", decodeErr)
	}

	if validateAnswer := utils.CompareHash(
		recovery.Answer,
		strings.ReplaceAll(
			strings.ToLower(approveRecoveryForm.Answer),
			" ",
			"_",
		),
	); !validateAnswer {
		return http.StatusForbidden, errors.New("answer is invalid")
	}

	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) GetPersonalQuestion(
	getPersonalQuestionForm request.GetPersonalQuestionForm,
) (int, string, error) {
	userRecovery := database.UserModel{}
	recovery := database.RecoveryQuestion{}

	if err := a.Db.Where("username = ?", getPersonalQuestionForm.Username).First(&userRecovery).Error; err != nil {
		return http.StatusNotFound, "", fmt.Errorf("user %s not found in system", getPersonalQuestionForm.Username)
	}

	if decodeErr := utils.FromJSON(userRecovery.Recovery, &recovery); decodeErr != nil {
		return http.StatusInternalServerError, "", fmt.Errorf("failed to decode: %v", decodeErr)
	}

	if strings.Compare(recovery.Question, "") == 0 {
		return http.StatusNotAcceptable, "", errors.New("no recovery question set")
	}

	return http.StatusOK, recovery.Question, nil
}

func (a *AuthRepositoryImpl) GetRecoveryQuestions() (int, []database.RecoveryQuestionModel, error) {
	questions := make([]database.RecoveryQuestionModel, 0)
	if err := a.Db.Find(&questions).Error; err != nil {
		return http.StatusInternalServerError, nil, err
	}
	return http.StatusOK, questions, nil
}

func (a *AuthRepositoryImpl) SignUp(signUpForm request.SignUpForm) (int, error) {
	var exists bool
	err := a.Db.Model(&database.UserModel{}).
		Select("COUNT (*) > 0").
		Where("username = ?", signUpForm.Username).
		Find(&exists).Error
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to select user: %v", err)
	}
	if exists {
		return http.StatusBadRequest, errors.New("user with this username already exists")
	}

	hashPassword, _ := utils.GenerateHash(signUpForm.Password)

	avatarObj := database.ImageObj{
		Image: signUpForm.Avatar,
		Hash:  signUpForm.AvatarHash,
	}
	avatarJSON, _ := utils.ToJSON(avatarObj)

	err = a.Db.Create(&database.UserModel{
		Username: signUpForm.Username,
		Password: hashPassword,
		Avatar:   avatarJSON,
	}).Error
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to create new user: %v", err)
	}

	return http.StatusCreated, nil
}

func (a *AuthRepositoryImpl) SignIn(signInForm request.SignInForm) (int, *authorizer.TokensResponse, error) {
	var userID int64
	hashPassword := ""

	err := a.Db.Model(&database.UserModel{}).
		Select("id, password").
		Where("username = ?", signInForm.Username).
		Row().
		Scan(&userID, &hashPassword).Error
	if err != nil || hashPassword == "" {
		return http.StatusNotFound, nil, errors.New("invalid credentials")
	}

	verifyPasswd := utils.CompareHash(hashPassword, signInForm.Password)
	if !verifyPasswd {
		return http.StatusBadRequest, nil, errors.New("invalid credentials")
	}

	payload := authorizer.Payload{
		ID:       userID,
		Username: signInForm.Username,
	}

	tokens, jwtErr := a.jwtService.Authorizer.GenerateTokens(payload)
	if jwtErr != nil {
		return http.StatusInternalServerError, nil, fmt.Errorf("failed to generate tokens: %v", jwtErr)
	}

	return http.StatusOK, tokens, nil
}

func (a *AuthRepositoryImpl) RefreshToken(refreshToken string) (*authorizer.TokensResponse, error) {
	claims, err := a.jwtService.Authorizer.ValidateToken(refreshToken)
	if err != nil {
		return nil, fmt.Errorf("failed to verify refresh token: %v", err)
	}

	payload := authorizer.Payload{
		Username: claims.Payload.Username,
		ID:       claims.Payload.ID,
	}
	tokens, err := a.jwtService.Authorizer.GenerateTokens(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to generate jwt token: %s", err)
	}

	err = a.Db.Model(&database.UserModel{}).
		Where("refresh_token = ?", refreshToken).
		Update("refresh_token", tokens.RefreshToken).Error
	if err != nil {
		return nil, err
	}

	return tokens, nil
}

func (a *AuthRepositoryImpl) Logout(username string) (int, error) {
	err := a.Db.Model(&database.UserModel{}).
		Where("username = ?", username).
		Update("refresh_token", "").Error
	if err != nil {
		return http.StatusNotFound, nil
	}

	return http.StatusOK, nil
}
