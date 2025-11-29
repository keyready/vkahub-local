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

func (ac *AuthController) SignUp(gCtx *gin.Context) {
	formData := request.SignUpRequest{}

	if bindErr := gCtx.ShouldBind(&formData); bindErr != nil {
		gCtx.AbortWithError(
			http.StatusBadRequest,
			bindErr,
		)

		gCtx.JSON(
			http.StatusBadRequest,
			gin.H{"error": bindErr.Error()},
		)

		return
	}

	avatar, err := gCtx.FormFile("avatar")
	if err != nil {
		gCtx.AbortWithError(
			http.StatusBadRequest,
			err,
		)

		gCtx.JSON(
			http.StatusBadRequest,
			gin.H{"error": err.Error()},
		)

		return
	}

	avatarName := fmt.Sprintf(
		"%s_%s_%s",
		formData.Username,
		"avatar",
		strings.ReplaceAll(avatar.Filename, " ", "_"),
	)
	avatar.Filename = avatarName

	httpCode, serviceErr := ac.authService.SignUp(formData, avatarName)
	if serviceErr != nil {
		gCtx.AbortWithError(
			httpCode,
			serviceErr,
		)

		gCtx.JSON(
			httpCode,
			gin.H{"error": serviceErr.Error()},
		)

		return
	}

	savePath := filepath.Join(other.USER_AVATARS_STORAGE, avatarName)
	if saveErr := gCtx.SaveUploadedFile(avatar, savePath); saveErr != nil {
		gCtx.AbortWithError(
			http.StatusInternalServerError,
			saveErr,
		)

		gCtx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": saveErr.Error()},
		)

		return
	}

	gCtx.JSON(http.StatusCreated, gin.H{})
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
		gCtx.AbortWithError(
			http.StatusBadRequest,
			bindErr,
		)

		gCtx.JSON(
			http.StatusBadRequest,
			gin.H{"error": bindErr.Error()},
		)

		return
	}

	httpCode, err, question := ac.authService.GetPersonalQuestion(jsonForm)
	if err != nil || question == "" {
		appGin.ErrorResponse(
			httpCode,
			err,
		)

		return
	}

	gCtx.JSON(httpCode, gin.H{"question": question})
}

func (ac *AuthController) GetRecoveryQuestions(gCtx *gin.Context) {
	httpCode, questions, err := ac.authService.GetRecoveryQuestions()
	if err != nil {
		gCtx.AbortWithError(
			http.StatusInternalServerError,
			err,
		)

		gCtx.JSON(
			httpCode,
			gin.H{"error": err.Error()},
		)

		return
	}

	gCtx.JSON(httpCode, questions)
}
