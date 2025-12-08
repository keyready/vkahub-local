package services

import "server/internal/repositories"

type ReportService interface {
	GenerateReport(eventID int64) (int, string, error)
}

type ReportServiceImpl struct {
	reportRepository repositories.ReportRepository
}

func NewReportServiceImpl(reportRepository repositories.ReportRepository) ReportService {
	return &ReportServiceImpl{reportRepository: reportRepository}
}

func (r ReportServiceImpl) GenerateReport(eventID int64) (int, string, error) {
	httpCode, reportName, err := r.reportRepository.GenerateReport(eventID)
	return httpCode, reportName, err
}
