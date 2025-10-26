package repositories

import (
	"backend/internal/models"
	"gorm.io/gorm"
	"net/http"
)

type ReportRepository interface {
	GenerateReport(eventId int64) (httpCode int, err error, reportName string)
}

type ReportRepositoryImpl struct {
	DB *gorm.DB
}

func NewReportRepositoryImpl(DB *gorm.DB) ReportRepository {
	return &ReportRepositoryImpl{DB: DB}
}

func (r ReportRepositoryImpl) GenerateReport(eventId int64) (httpCode int, err error, reportName string) {
	var event models.EventModel
	r.DB.First(&event, eventId)
	newReportName := ""
	return http.StatusOK, nil, newReportName
}
