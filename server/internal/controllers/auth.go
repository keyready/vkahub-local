package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/services"
	"server/pkg/app"
	"server/pkg/utils/jsonwebtoken"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AuthController struct {
	authService services.AuthService
}

func NewAuthController(service services.AuthService) *AuthController {
	return &AuthController{
		authService: service,
	}
}

func (ac *AuthController) SignUp(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	formData := request.SignUpRequest{}

	bindErr := ctx.ShouldBind(&formData)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	confirmLink := uuid.NewString()
	formData.ConfirmLink = confirmLink

	fileName := fmt.Sprintf(
		"%s_%s_%s",
		formData.Username,
		"avatar",
		strings.ReplaceAll(formData.Avatar.Filename, " ", "_"),
	)
	formData.Avatar.Filename = fileName

	httpCode, serviceErr := ac.authService.SignUp(formData)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	savePath := filepath.Join(other.USER_AVATARS_STORAGE, fileName)
	if saveErr := appGin.Ctx.SaveUploadedFile(formData.Avatar, savePath); saveErr != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			saveErr,
		)

		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (ac *AuthController) Login(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	jsonForm := request.LoginRequest{}

	if bindErr := ctx.ShouldBindJSON(&jsonForm); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, serviceErr := ac.authService.Login(jsonForm)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	payload := jsonwebtoken.Payload{
		Username: jsonForm.Username,
		Roles:    []string{},
	}

	tokens := jsonwebtoken.GenerateTokens(payload)

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

	appGin.SuccessResponse(http.StatusOK, tokens)
}

func (ac *AuthController) Logout(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	username := appGin.Ctx.GetString("username")
	httpCode, _ := ac.authService.Logout(username)

	appGin.SuccessResponse(httpCode, gin.H{})
}

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
