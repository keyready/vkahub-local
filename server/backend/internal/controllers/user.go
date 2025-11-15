package controllers

import (
	"backend/internal/dto/other"
	"backend/internal/dto/request"
	"backend/internal/gosocket"
	"backend/internal/services"
	"backend/pkg/app"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

const (
	CERTIFICATES_STORAGE = "/app/certificates"
)

type UserController struct {
	userService services.UserService
}

func NewUserControllers(service services.UserService) *UserController {
	return &UserController{
		userService: service,
	}
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

	certificateNames := make([]string, 0)
	for _, cert := range formData.Certificates {
		certName := fmt.Sprintf("%s_%s", formData.EventName, strings.ReplaceAll(cert.Filename, " ", "_"))
		savePath := filepath.Join(CERTIFICATES_STORAGE, certName)

		if saveErr := appGin.Ctx.SaveUploadedFile(cert, savePath); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
			return
		}

		certificateNames = append(certificateNames, certName)
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

func (uc *UserController) GetOnlineUsers(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	conn, err := gosocket.UpgradeSocket.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		appGin.ErrorResponse(http.StatusInternalServerError, err)
		return
	}

	defer func() {
		conn.Close()
		delete(gosocket.ClientsOnline, conn)
	}()

	gosocket.ClientsOnline[conn] = true

	lastOnline := 0
	for {
		if err = conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			break
		}

		_, _, info := uc.userService.GetActualInfo()
		info.OnlineClients = len(gosocket.ClientsOnline)

		if lastOnline != info.OnlineClients {
			err = conn.WriteJSON(info)
			if err != nil {
				break
			}
		}
		lastOnline = info.OnlineClients
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

func (uc *UserController) EditProfile(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var EditProfReq request.EditProfileRequest

	EditProfReq.Owner = ctx.GetString("username")

	bindErr := ctx.ShouldBindJSON(&EditProfReq)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	httpCode, serviceErr := uc.userService.EditProfile(EditProfReq)
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
