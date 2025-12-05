package controllers

import (
	"log"
	"net/http"
	"server/internal/cloud"
	"server/internal/forms/dto"
	"server/internal/forms/request"
	"server/internal/gosocket"
	"server/internal/onliner"
	"server/internal/services"
	"server/internal/utils"
	"server/pkg/app"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type UserController struct {
	userService services.UserService
	cloud       *cloud.Cloud
	onliner     *onliner.Onliner
}

func NewUserControllers(
	service services.UserService,
	cloud *cloud.Cloud,
	onliner *onliner.Onliner,
) *UserController {
	return &UserController{
		userService: service,
		cloud:       cloud,
		onliner:     onliner,
	}
}

func (uc *UserController) GetSettings(gCtx *gin.Context) {
	ctx := gCtx.Request.Context()
	username := gCtx.GetString("username")

	settings, err := uc.userService.GetSettings(ctx, username)
	if err != nil {
		gCtx.AbortWithError(
			http.StatusInternalServerError,
			err,
		)

		gCtx.JSON(
			http.StatusInternalServerError,
			err,
		)

		return
	}

	gCtx.JSON(http.StatusOK, gin.H{"settings": settings})
}

func (uc *UserController) SetSettings(gCtx *gin.Context) {
	jsonForm := request.SetSettingsForm{}
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

	ctx := gCtx.Request.Context()
	jsonForm.Username = gCtx.GetString("username")

	err := uc.userService.SetSettings(ctx, jsonForm)
	if err != nil {
		gCtx.AbortWithError(
			http.StatusInternalServerError,
			err,
		)

		gCtx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": err.Error()},
		)

		return
	}

	gCtx.JSON(
		http.StatusOK,
		gin.H{},
	)
}

func (uc *UserController) GetBannedReason(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}

	ownerID := int64(1)
	httpCode, banned, err := uc.userService.GetBannedReason(ownerID)
	if err != nil {
		appGin.ErrorResponse(
			httpCode,
			err,
		)
		return
	}

	appGin.SuccessResponse(httpCode, banned)
}

func (uc *UserController) DeletePortfolio(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}
	jsonForm := request.DeletePortfolioForm{}

	if bindErr := appGin.Ctx.ShouldBindJSON(&jsonForm); bindErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			bindErr,
		)
		return
	}

	ownerName := appGin.Ctx.GetString("username")

	httpCode, err := uc.userService.DeletePortfolio(jsonForm.CertificateName, ownerName)
	if err != nil {
		appGin.ErrorResponse(
			httpCode,
			err,
		)
		return
	}

	appGin.SuccessResponse(
		httpCode,
		gin.H{},
	)
}

func (uc *UserController) AddPortfolio(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}
	formData := request.AddPortfolioForm{}

	if bindErr := gCtx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			bindErr,
		)
		return
	}

	multipartForm, err := gCtx.MultipartForm()
	if err != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			err,
		)
		return
	}

	ctx := gCtx.Request.Context()
	certificateNames := make([]string, 0)
	for _, cert := range multipartForm.File["certificates"] {
		readFileParams := utils.ReadFileParams{
			File:    cert,
			SaveDir: dto.CERTIFICATES_FOLDER,
		}

		readFileResult, err := utils.ReadFile(readFileParams)
		if err != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				err,
			)
			return
		}

		if saveErr := uc.cloud.Cloud.UploadFile(ctx, readFileResult.FileKey, readFileResult.FileData); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
			return
		}

		certificateNames = append(certificateNames, readFileResult.FullFilePath)
	}

	formData.Owner = appGin.Ctx.GetString("username")
	formData.Certificates = certificateNames

	httpCode, err := uc.userService.AddPortfolio(formData)
	if err != nil {
		appGin.ErrorResponse(
			http.StatusInternalServerError,
			err,
		)
		return
	}

	appGin.SuccessResponse(
		httpCode,
		gin.H{},
	)
}

func (uc *UserController) FetchAllMessages(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	teamId, _ := strconv.ParseInt(ctx.Param("teamId"), 10, 64)

	form := request.GetMessagesForm{
		TeamId: teamId,
		Member: ctx.GetString("username"),
	}

	conn, err := gosocket.UpgradeSocket.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		appGin.ErrorResponse(http.StatusBadRequest, err)
		return
	}

	defer func() {
		conn.Close()
		delete(gosocket.ChatOnline, conn)
	}()

	gosocket.ChatOnline[conn] = true

	lastLengthHistory := 0
	for {
		if err = conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			break
		}

		_, messages, _ := uc.userService.GetMessages(form)

		if lastLengthHistory != len(messages) {
			if err = conn.WriteJSON(messages); err != nil {
				break
			}
		}
		lastLengthHistory = len(messages)
	}
}

func (uc *UserController) GetActualInfo(gCtx *gin.Context) {
	info := uc.userService.GetActualInfo()
	gCtx.JSON(http.StatusOK, info)
}

func (uc *UserController) Online(gCtx *gin.Context) {
	ctx := gCtx.Request.Context()
	username := gCtx.Query("username")

	conn, err := gosocket.UpgradeSocket.Upgrade(gCtx.Writer, gCtx.Request, nil)
	if err != nil {
		gCtx.AbortWithError(
			http.StatusInternalServerError,
			err,
		)

		gCtx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": err.Error()},
		)

		return
	}
	defer conn.Close()

	if err := uc.onliner.Onliner.MarkOnline(ctx, username); err != nil {
		log.Printf("markOnline err: %v", err)
	}

	stopHeartbeat := make(chan struct{})
	go uc.onliner.Onliner.Heartbeat(ctx, username, stopHeartbeat)

	for {
		if _, _, err := conn.NextReader(); err != nil {
			close(stopHeartbeat)
			if err := uc.onliner.Onliner.MarkOffline(ctx, username); err != nil {
				gCtx.AbortWithError(
					http.StatusInternalServerError,
					err,
				)

				gCtx.JSON(
					http.StatusInternalServerError,
					gin.H{"error": err.Error()},
				)

				return
			}
		}
	}
}

func (uc *UserController) SendNotifications(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	queryForm := request.GetNotificationsForm{}

	if bindErr := ctx.ShouldBindQuery(&queryForm); bindErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			bindErr,
		)
		return
	}

	conn, err := gosocket.UpgradeSocket.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		appGin.ErrorResponse(http.StatusInternalServerError, err)
		return
	}

	defer func() {
		conn.Close()
		delete(gosocket.NotifyMembers, conn)
	}()

	gosocket.NotifyMembers[conn] = true

	totalNotifications := 0
	for {
		if err = conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			break
		}

		httpCode, notifications := uc.userService.GetPersonalNotifications(queryForm)

		switch httpCode {
		case http.StatusNotFound:
			if err = conn.WriteJSON(notifications); err != nil {
				return
			}
		case http.StatusOK:
			if totalNotifications != len(notifications) {
				if err = conn.WriteJSON(notifications); err != nil {
					return
				}
			}
			totalNotifications = len(notifications)
		}
	}
}

func (uc *UserController) UpdateNotification(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	updNotificationDTO := request.UpdateNotificationForm{}

	bindErr := ctx.ShouldBindJSON(&updNotificationDTO)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := uc.userService.UpdateNotificationStatus(updNotificationDTO)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, gin.H{})
}

func (uc *UserController) GetPersonalAchievements(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	username := ctx.Query("username")
	personalUsername := ctx.GetString("username")

	httpCode, personalAchievements, err := uc.userService.GetPersonalAchievements(username, personalUsername)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, personalAchievements)
}

func (uc *UserController) GetMembersByParams(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	queryForm := request.GetMembersByParamsForm{}

	bindErr := ctx.ShouldBindQuery(&queryForm)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, members, _ := uc.userService.GetMembersByParams(queryForm)

	appGin.SuccessResponse(httpCode, members)
}

func (uc *UserController) EditProfile(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}
	formData := request.EditProfileInfoForm{}

	if bindErr := gCtx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	ctx := gCtx.Request.Context()

	formData.Owner = appGin.Ctx.GetString("username")

	avatar, err := appGin.Ctx.FormFile("avatar")
	if err != http.ErrMissingFile {
		readFileParams := utils.ReadFileParams{
			File:    avatar,
			SaveDir: dto.USER_AVATARS_FOLDER,
		}

		readFileResult, err := utils.ReadFile(readFileParams)
		if err != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				err,
			)
			return
		}

		if saveErr := uc.cloud.Cloud.UploadFile(ctx, readFileResult.FileKey, readFileResult.FileData); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
			return
		}

		formData.Avatar = readFileResult.FullFilePath
	} else {
		formData.Avatar = ""
	}

	httpCode, serviceErr := uc.userService.EditProfile(formData)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(httpCode, gin.H{})
}

func (uc *UserController) GetUserData(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	username := ctx.GetString("username")

	httpCode, userData, err := uc.userService.GetUserData(username)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, userData)
}

func (uc *UserController) GetProfile(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	username := ctx.Query("username")

	httpCode, profileData, err := uc.userService.GetProfile(username)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, profileData)
}
