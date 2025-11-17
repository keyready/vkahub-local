package repositories

import (
	"backend/internal/dto/other"
	"backend/internal/dto/request"
	"backend/internal/dto/response"
	"backend/internal/models"
	"backend/pkg/utils/hash"
	"backend/pkg/utils/jsonwebtoken"
	"errors"
	"fmt"
	"net/http"
	"os"
	"slices"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type AuthRepository interface {
	SignUp(signUp request.SignUpRequest) (httpCode int, err error)
	MailConfirm(code string) (httpCode int, err error)
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
	var recPasswdUser models.UserModel

	claims := &jsonwebtoken.RecTokenClaims{}

	_, err = jwt.ParseWithClaims(RecPasswdReq.RecoveryToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_ACCESS_SECRET_KEY")), nil
	})
	if err != nil {
		return http.StatusInternalServerError, err
	}

	userMail := claims.Mail
	err = a.Db.Where("mail = ?", userMail).First(&recPasswdUser).Error
	if err != nil {
		return http.StatusNotFound, err
	}

	hashPassword, _ := hash.HashData(RecPasswdReq.Password)
	recPasswdUser.Password = hashPassword

	a.Db.Save(&recPasswdUser)
	return http.StatusOK, nil
}

func (a *AuthRepositoryImpl) MailConfirm(uniqueLink string) (httpCode int, err error) {
	var mailUser models.UserModel

	err = a.Db.Where("confirm_link = ?", uniqueLink).First(&mailUser).Error
	if err == gorm.ErrRecordNotFound {
		return http.StatusNotFound, gorm.ErrRecordNotFound
	}

	mailUser.Roles = append(mailUser.Roles, "mailConfirmed")
	mailUser.IsMailConfirmed = true
	a.Db.Save(&mailUser)

	var firstPersonalAchievement models.PersonalAchievementModel
	a.Db.Where("key = ?", "confirmed").First(&firstPersonalAchievement)
	if !slices.Contains(firstPersonalAchievement.OwnerIds, mailUser.ID) {
		firstPersonalAchievement.OwnerIds = append(firstPersonalAchievement.OwnerIds, mailUser.ID)
		a.Db.Save(&firstPersonalAchievement)
		a.Db.Create(&models.NotificationModel{
			OwnerId: mailUser.ID,
			Message: fmt.Sprintf(
				"Вами получено первое достижение: %s \n Вы можете просматривать новые достижения в своем личном кабинете, а сервис будет уведомлять о них",
				firstPersonalAchievement.Title),
		})
	}

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

func (a *AuthRepositoryImpl) SignUp(signUp request.SignUpRequest) (httpCode int, err error) {
	var userExist models.UserModel
	if err = a.Db.Where("username = ?", signUp.Username).First(&userExist).Error; err == nil {
		return http.StatusBadRequest, errors.New("User with this username or mail already exists")
	}

	hashPassword, _ := hash.HashData(signUp.Password)
	a.Db.Create(&models.UserModel{
		Username:    signUp.Username,
		Mail:        "default-mail-vkahub@vkahub.ru",
		Password:    hashPassword,
		Avatar:      signUp.Avatar.Filename,
		ConfirmLink: signUp.ConfirmLink,
		Roles:       []string{"user", "mailConfirmed"},
		Portfolio:   datatypes.JSON([]byte(`[]`)),
		Skills:      []string{},
		Positions:   []string{},
	})

	//privateKey, genKeyErr := encryption.GenerateRSAKeys(10)
	//if genKeyErr != nil {
	//	return http.StatusInternalServerError, err
	//}
	//
	//privateKeyString := encryption.PrivateKeyToString(privateKey)
	//publicKeyString, _ := encryption.PublicKeyToString(&privateKey.PublicKey)

	return http.StatusCreated, nil
}

func (a *AuthRepositoryImpl) Login(login request.LoginRequest) (httpCode int, err error) {
	var loginUser models.UserModel
	if err = a.Db.Where("username = ?", login.Username).First(&loginUser).Error; err != nil {
		return http.StatusNotFound, errors.New("User not found")
	}

	verifyPasswd := hash.CheckHashData(loginUser.Password, login.Password)
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

	tokens = jsonwebtoken.GenerateTokens(tmpUser.Username)

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
