package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"server/internal/authorizer"
	"server/internal/dto/other"
	"server/internal/dto/request"
	"server/internal/services"
	"server/pkg/app"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthController struct {
	authService services.AuthService
	jwtService  *authorizer.Authorizer
}

func NewAuthController(
	service services.AuthService,
	jwtService *authorizer.Authorizer,
) *AuthController {
	return &AuthController{
		jwtService:  jwtService,
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

	multipartForm, err := ctx.MultipartForm()
	if err != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			err,
		)
		return
	}
	avatar := multipartForm.File["avatar"][0]

	avatarName := fmt.Sprintf(
		"%s_%s_%s",
		formData.Username,
		"avatar",
		strings.ReplaceAll(avatar.Filename, " ", "_"),
	)
	avatar.Filename = avatarName

	httpCode, serviceErr := ac.authService.SignUp(formData, avatarName)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	savePath := filepath.Join(other.USER_AVATARS_STORAGE, avatarName)
	if saveErr := appGin.Ctx.SaveUploadedFile(avatar, savePath); saveErr != nil {
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

	payload := authorizer.Payload{
		Username: jsonForm.Username,
	}

	tokens := ac.jwtService.Authorizer.GenerateTokens(payload)

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

func (ac *AuthController) ApproveRecovery(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}

	jsonForm := request.ApproveRecoveryForm{}
	if bindErr := gCtx.ShouldBindJSON(&jsonForm); bindErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			bindErr,
		)

		return
	}

	httpCode, err := ac.authService.ApproveRecovery(jsonForm)
	if err != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			err,
		)

		return
	}

	appGin.SuccessResponse(httpCode, "ok")
}

func (ac *AuthController) ChangePassword(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}

	jsonForm := request.RecoveryPasswordForm{}
	if bindErr := gCtx.ShouldBindJSON(&jsonForm); bindErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			bindErr,
		)
		return
	}

	httpCode, err := ac.authService.ChangePassword(jsonForm)
	if err != nil {
		appGin.ErrorResponse(
			httpCode,
			err,
		)

		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (ac *AuthController) GetPersonalQuestion(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}

	jsonForm := request.GetPersonalQuestionForm{}
	if bindErr := gCtx.ShouldBindJSON(&jsonForm); bindErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			bindErr,
		)
		return
	}

	httpCode, err, question := ac.authService.GetPersonalQuestion(jsonForm)
	if err != nil {
		appGin.ErrorResponse(
			httpCode,
			err,
		)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{"question": question})
}

func (ac *AuthController) GetRecoveryQuestions(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}

	httpCode, questions, err := ac.authService.GetRecoveryQuestions()
	if err != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			err,
		)

		return
	}

	appGin.SuccessResponse(httpCode, questions)
}
