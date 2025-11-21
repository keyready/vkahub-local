package controllers

import (
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	BUGS_STORAGE = "/app/bugs"
)

type BugController struct {
	bugService services.BugService
}

func NewBugControllers(s services.BugService) *BugController {
	return &BugController{bugService: s}
}

func (bc *BugController) AddBug(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	formData := request.AddBugReq{}

	formData.Author = ctx.GetString("username")

	if bindErr := ctx.ShouldBind(&formData); bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	multipartForm, mpfdErr := ctx.MultipartForm()
	if mpfdErr != nil {
		appGin.ErrorResponse(
			http.StatusBadRequest,
			mpfdErr,
		)
	}

	mediaNames := []string{}
	for _, img := range multipartForm.File["media"] {
		fileName := fmt.Sprintf("%s%s", uuid.NewString(), filepath.Ext(img.Filename))
		img.Filename = fileName

		if saveErr := appGin.Ctx.SaveUploadedFile(
			img,
			filepath.Join(
				BUGS_STORAGE,
				img.Filename,
			),
		); saveErr != nil {
			appGin.ErrorResponse(
				http.StatusInternalServerError,
				saveErr,
			)
		}

		mediaNames = append(mediaNames, fileName)
	}

	httpCode, err := bc.bugService.AddBug(formData, mediaNames)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(http.StatusCreated, gin.H{})
}

func (bc *BugController) FetchAllBugs(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	t := ctx.Query("status")

	httpCode, err, bugs := bc.bugService.FetchAllBugs(t)
	if err != nil {
		appGin.ErrorResponse(httpCode, err)
		return
	}

	appGin.SuccessResponse(httpCode, bugs)
}

func (bc *BugController) UpdateBug(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var updateBugReq request.UpdateBugReq

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
