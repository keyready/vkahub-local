package services

import "backend/internal/repositories"

type ReportService interface {
	GenerateReport(eventId int64) (httpCode int, err error, reportName string)
}

type ReportServiceImpl struct {
	reportRepository repositories.ReportRepository
}

func NewReportServiceImpl(reportRepository repositories.ReportRepository) ReportService {
	return &ReportServiceImpl{reportRepository: reportRepository}
}

func (r ReportServiceImpl) GenerateReport(eventId int64) (httpCode int, err error, reportName string) {
	httpCode, err, reportName = r.reportRepository.GenerateReport(eventId)
	return httpCode, err, reportName
}
