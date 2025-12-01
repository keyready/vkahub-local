package controllers

import (
	"log"
	"net/http"
	"server/internal/cloud"
	"server/internal/dto/other"
	"server/internal/dto/request"
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
	httpCode, err, banned := uc.userService.GetBannedReason(ownerID)
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

	ctx := gCtx.Request.Context()
	certificateNames := make([]string, 0)
	for _, cert := range formData.Certificates {
		readFileParams := utils.ReadFileParams{
			File:    cert,
			SaveDir: other.CERTIFICATES_STORAGE,
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

	httpCode, err := uc.userService.AddPortfolio(formData, certificateNames)
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

	fetchAllMessage := request.FetchAllMessages{
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

		_, _, messages := uc.userService.FetchAllMessages(fetchAllMessage)

		if lastLengthHistory != len(messages) {
			if err = conn.WriteJSON(messages); err != nil {
				break
			}
		}
		lastLengthHistory = len(messages)
	}
}

func (uc *UserController) GetActualInfo(gCtx *gin.Context) {
	_, _, info := uc.userService.GetActualInfo()
	gCtx.JSON(http.StatusOK, info)
}

func (uc *UserController) Online(gCtx *gin.Context) {
	ctx := gCtx.Request.Context()
	username := gCtx.GetString("username")

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
	var filterNtfs request.FetchAllNotifications

	filterNtfs.UserId = ctx.Query("userId")
	filterNtfs.Type = ctx.Query("type")

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

		_, _, notifications := uc.userService.FetchAllPersonalNotifications(filterNtfs)

		if totalNotifications != len(notifications) {
			if err = conn.WriteJSON(notifications); err != nil {
				break
			}
		}
		totalNotifications = len(notifications)
	}
}

func (uc *UserController) UpdateNotification(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var updateNtf other.UpdateNotificationData

	bindErr := ctx.ShouldBindJSON(&updateNtf)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, err := uc.userService.UpdateNotification(updateNtf)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, gin.H{})
}

func (uc *UserController) FetchPersonalAchievements(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}

	username := ctx.Query("username")
	personalUsername := ctx.GetString("username")

	httpCode, err, personalAchievements := uc.userService.FetchPersonalAchievements(username, personalUsername)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, personalAchievements)
}

func (uc *UserController) FetchAllMembersByParams(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var FetchAllMembers request.FetchAllMembersByParamsRequest

	bindErr := ctx.ShouldBindQuery(&FetchAllMembers)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, _, data := uc.userService.FetchAllMembersByParams(FetchAllMembers)

	appGin.SuccessResponse(httpCode, data)
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
			SaveDir: other.USER_AVATARS_STORAGE,
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

	httpCode, serviceErr, data := uc.userService.GetUserData(username)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusOK, data)
}

func (uc *UserController) GetProfile(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	username := ctx.Query("username")

	httpCode, serviceErr, data := uc.userService.GetProfile(username)
	if serviceErr != nil {
		appGin.ErrorResponse(httpCode, serviceErr)
		return
	}

	appGin.SuccessResponse(http.StatusOK, data)
}
