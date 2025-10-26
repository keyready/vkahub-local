package controllers

import (
	"backend/internal/dto/request"
	"backend/internal/services"
	"backend/pkg/app"
	"github.com/gin-gonic/gin"
	"net/http"
)

type BugController struct {
	bugService    services.BugService
}

func NewBugControllers(s services.BugService) *BugController {
	return &BugController{bugService: s}
}

func (bc *BugController) AddBug(ctx *gin.Context) {
	appGin := app.Gin{Ctx: ctx}
	var addBug request.AddBugReq

	addBug.Author = ctx.GetString("username")

	bindErr := ctx.ShouldBind(&addBug)
	if bindErr != nil {
		appGin.ErrorResponse(http.StatusBadRequest, bindErr)
		return
	}

	// for _, img := range addBug.Media {
	// 	img.Filename = "bugs/" + uuid.NewString() + "." + strings.Split(img.Filename, ".")[len(strings.Split(img.Filename, "."))-1]
	// 	addBug.MediaNames = append(addBug.MediaNames, img.Filename)
	// 	bodyFile, _ := img.Open()
	// 	bc.YaCloudClient.PutObject(context.TODO(), &s3.PutObjectInput{
	// 		Bucket: aws.String(os.Getenv("BUCKET_NAME")),
	// 		Key:    aws.String(img.Filename),
	// 		Body:   bodyFile,
	// 	})
	// }

	httpCode, err := bc.bugService.AddBug(addBug)
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
