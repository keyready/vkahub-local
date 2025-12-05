package controllers

import (
	"net/http"
	"server/internal/cloud"
	"server/internal/forms/dto"
	"server/internal/forms/request"
	"server/internal/services"
	"server/internal/utils"
	"server/pkg/app"

	"github.com/gin-gonic/gin"
)

type BugController struct {
	bugService services.BugService
	cloud      *cloud.Cloud
}

func NewBugControllers(
	s services.BugService,
	cloud *cloud.Cloud,
) *BugController {
	return &BugController{
		bugService: s,
		cloud:      cloud,
	}
}

func (bc *BugController) RegisterBug(gCtx *gin.Context) {
	appGin := app.Gin{Ctx: gCtx}
	formData := request.RegisterBugForm{}

	formData.Author = gCtx.GetString("username")

	if bindErr := gCtx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	multipartForm, mpfdErr := gCtx.MultipartForm()
	if mpfdErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			mpfdErr,
		)
	}

	ctx := gCtx.Request.Context()
	mediaNames := []string{}
	for _, img := range multipartForm.File["media"] {
		readFileParams := utils.ReadFileParams{
			File:    img,
			SaveDir: dto.BUGS_FOLDER,
		}

		readFileResult, err := utils.ReadFile(readFileParams)
		if err != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				err,
			)
			return
		}

		if saveErr := bc.cloud.Cloud.UploadFile(
			ctx,
			readFileResult.FileKey,
			readFileResult.FileData,
		); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
		}

		mediaNames = append(mediaNames, readFileResult.FullFilePath)
	}

	formData.MediaNames = mediaNames

	httpCode, err := bc.bugService.RegisterBug(formData)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (bc *BugController) GetBugs(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	t := ctx.Query("status")

	httpCode, bugs, err := bc.bugService.GetBugs(t)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, bugs)
}

func (bc *BugController) UpdateBug(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	updateBugReq := request.UpdateBugForm{}

	bindErr := ctx.ShouldBindJSON(&updateBugReq)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	updateBugReq.Author = ctx.GetString("username")

	httpCode, err := bc.bugService.UpdateBug(updateBugReq)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusOK, gin.H{})
}
