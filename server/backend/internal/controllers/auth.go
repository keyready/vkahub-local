package controllers

import (
	"backend/internal/dto/other"
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"backend/pkg/utils/jsonwebtoken"
	"net/http"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AuthController struct {
	authService     services.AuthService
}

func NewAuthController(service services.AuthService) *AuthController {
	return &AuthController{
		authService:     service,
	}
}

func (ac *AuthController) SignUp(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	v := validator.New()
	var sue request.SignUpRequest

	bindErr := ctx.ShouldBind(&sue)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	validErr := v.Struct(sue)
	if validErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, validErr)
		return
	}

	confirmLink := uuid.NewString()
	sue.ConfirmLink = confirmLink

	// extFile := strings.Split(sue.Avatar.Filename, ".")[len(strings.Split(sue.Avatar.Filename, "."))-1]
	// sue.Avatar.Filename = "users/" + uuid.NewString() + "." + extFile

	httpCode, serviceErr := ac.authService.SignUp(sue)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	// bodyFile, _ := sue.Avatar.Open()
	// ac.YaCloudUploader.PutObject(context.TODO(), &s3.PutObjectInput{
	// 	Bucket: aws.String(os.Getenv("BUCKET_NAME")),
	// 	Key:    aws.String(sue.Avatar.Filename),
	// 	Body:   bodyFile,
	// })

	// mailData := other.MailDto{
	// 	MailName: "ConfirmMail",
	// 	Receiver: sue.Mail,
	// 	Msg: other.MailBody{
	// 		TypeMsg:     "text/html",
	// 		UniqueField: confirmLink,
	// 	},
	// }

	// mailError := appmail.SendMail(mailData)
	// if mailError != nil {
	// 	appGin.ErrorResponse(http.StatusInternalServerError, mailError)
	// 	return
	// }

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (ac *AuthController) Login(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	v := validator.New()
	var logReq request.LoginRequest

	if bindErr := ctx.ShouldBindJSON(&logReq); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	validErr := v.Struct(logReq)
	if validErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, validErr)
		return
	}

	httpCode, serviceErr := ac.authService.Login(logReq)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	tokens := jsonwebtoken.GenerateTokens(logReq.Username)
	logReq.RefreshToken = tokens.RefreshToken

	//session := sessions.Default(ctx)
	//session.Set("auth_token", tokens.AccessToken)
	//session.Save()

	appGin.SuccessResponse(httpCode, tokens)
}

func (ac *AuthController) RefreshToken(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	authHeader := appGin.Ctx.Request.Header.Get("Authorization")
	if authHeader == "" {
		appGin.ErrorResponse(http.StatusUnauthorized, jwt.ErrTokenNotValidYet)
		return
	}

	refreshToken := strings.Split(authHeader, " ")[1]
	tokens, _ := ac.authService.RefreshToken(refreshToken)

	session := sessions.Default(ctx)
	session.Set("auth_token", tokens.AccessToken)
	session.Save()

	appGin.SuccessResponse(http.StatusOK, tokens)
}

func (ac *AuthController) Logout(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	username := appGin.Ctx.GetString("username")
	httpCode, _ := ac.authService.Logout(username)

	//session := sessions.Default(ctx)
	//session.Delete("auth_token")
	//session.Save()

	appGin.SuccessResponse(httpCode, gin.H{})
}

// func (ac *AuthController) MailConfirm(ctx *gin.Context) {
// 	appGin := app.Gin{Ctx: ctx}
// 	var confirmCode other.ConfirmCode

// 	bindErr := ctx.ShouldBindJSON(&confirmCode)
// 	if bindErr != nil {
// 		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
// 		return
// 	}

// 	httpCode, serviceErr := ac.authService.MailConfirm(confirmCode.Code)
// 	if serviceErr != nil {
// 		appGin.SuccessResponse(httpCode, serviceErr)
// 		return
// 	}

// 	appGin.SuccessResponse(http.StatusOK, gin.H{})
// }

func (ac *AuthController) ResetPassword(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	mail := appGin.Ctx.PostForm("mail")

	httpCode, err := ac.authService.ResetPassword(mail)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (ac *AuthController) RecoveryPassword(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var RecPasswdReq other.RecoveryPassword

	err := ctx.ShouldBindJSON(&RecPasswdReq)
	if err != nil {
		appGin.ErrorResponse(http.StatusBadRequest, err)
		return
	}

	httpCode, err := ac.authService.RecoveryPassword(RecPasswdReq)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}
