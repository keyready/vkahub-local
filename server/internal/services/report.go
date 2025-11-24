package services

import "server/internal/repositories"

type ReportService interface {
	GenerateReport(eventId int64) (httpCode int, reportName string, err error)
}

type ReportServiceImpl struct {
	reportRepository repositories.ReportRepository
}

func NewReportServiceImpl(reportRepository repositories.ReportRepository) ReportService {
	return &ReportServiceImpl{reportRepository: reportRepository}
}

func (r ReportServiceImpl) GenerateReport(eventId int64) (httpCode int, reportName string, err error) {
	httpCode, reportName, err = r.reportRepository.GenerateReport(eventId)
	return httpCode, reportName, err
}
