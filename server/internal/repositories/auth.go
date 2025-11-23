package repositories

import (
	"errors"
	"net/http"
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/dto/response"
	"server/internal/models"
	"server/internal/utils"
	"server/pkg/jsonwebtoken"

	"gorm.io/gorm"
)

type AuthRepository interface {
	SignUp(signUp request.SignUpRequest, avatarName string) (httpCode int, err error)
	Login(login request.LoginRequest) (httpCode int, err error)
	RefreshToken(refreshToken string) (tokens response.LoginResponse, err error)
	Logout(username string) (httpCode int, err error)
	ResetPassword(mail string) (httpCode int, err error)
	RecoveryPassword(RecPasswdReq other.RecoveryPassword) (httpCode int, err error)
}

type AuthRepositoryImpl struct {
	Db *gorm.DB
}

func NewAuthRepositoryImpl(Db *gorm.DB) AuthRepository {
	return &AuthRepositoryImpl{Db: Db}
}

func (a *AuthRepositoryImpl) RecoveryPassword(RecPasswdReq other.RecoveryPassword) (httpCode int, err error) {
	// var recPasswdUser models.UserModel

	// claims := &jsonwebtoken.RecTokenClaims{}

	// _, err = jwt.ParseWithClaims(RecPasswdReq.RecoveryToken, claims, func(token *jwt.Token) (interface{}, error) {
	// 	return []byte(os.Getenv("JWT_ACCESS_SECRET_KEY")), nil
	// })
	// if err != nil {
	// 	return http.StatusInternalServerError, err
	// }

	// userMail := claims.Mail
	// err = a.Db.Where("mail = ?", userMail).First(&recPasswdUser).Error
	// if err != nil {
	// 	return http.StatusNotFound, err
	// }

	// hashPassword, _ := hash.HashData(RecPasswdReq.Password)
	// recPasswdUser.Password = hashPassword

	// a.Db.Save(&recPasswdUser)
	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) ResetPassword(mail string) (int, error) {
	var resetPasswordUser models.UserModel

	err := a.Db.Where("mail = ?", mail).First(&resetPasswordUser).Error
	if err == gorm.ErrRecordNotFound {
		return http.StatusNotFound, err
	}

	return http.StatusOK, err
}

func (a *AuthRepositoryImpl) SignUp(signUp request.SignUpRequest, avatarName string) (httpCode int, err error) {
	var userExist models.UserModel
	if err = a.Db.Where("username = ?", signUp.Username).First(&userExist).Error; err == nil {
		return http.StatusBadRequest, errors.New("User with this username or mail already exists")
	}

	hashPassword, _ := utils.GenerateHash(signUp.Password)
	a.Db.Create(&models.UserModel{
		Username: signUp.Username,
		Password: hashPassword,
		Avatar:   avatarName,
		// Roles:    []string{"user", "mailConfirmed"},
		// Portfolio: datatypes.JSON([]byte(`[]`)),
		// Skills:    []string{},
		// Positions: []string{},
	})

	return http.StatusCreated, nil
}

func (a *AuthRepositoryImpl) Login(login request.LoginRequest) (httpCode int, err error) {
	var loginUser models.UserModel
	if err = a.Db.Where("username = ?", login.Username).First(&loginUser).Error; err != nil {
		return http.StatusNotFound, errors.New("User not found")
	}

	verifyPasswd := utils.CompareHash(loginUser.Password, login.Password)
	if !verifyPasswd {
		return http.StatusBadRequest, errors.New("Invalid password")
	}

	loginUser.RefreshToken = login.RefreshToken
	a.Db.Save(&loginUser)

	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) RefreshToken(refreshToken string) (tokens response.LoginResponse, err error) {
	var tmpUser models.UserModel

	err = a.Db.Where("refresh_token = ?", refreshToken).First(&tmpUser).Error
	if err != nil {
		return tokens, err
	}

	payload := jsonwebtoken.Payload{
		Username: tmpUser.Username,
	}

	tokens = jsonwebtoken.GenerateTokens(payload)

	tmpUser.RefreshToken = tokens.RefreshToken
	a.Db.Save(&tmpUser)

	return tokens, nil
}

func (a *AuthRepositoryImpl) Logout(username string) (httpCode int, err error) {

	var logoutUser models.UserModel
	err = a.Db.Where("username = ?", username).First(&logoutUser).Error
	if err != nil {
		return http.StatusNotFound, err
	}

	logoutUser.RefreshToken = ""
	a.Db.Save(&logoutUser)

	return http.StatusOK, nil
}
