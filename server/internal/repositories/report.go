package repositories

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"server/internal/database"
	"strconv"
	"strings"

	"github.com/lukasjarosch/go-docx"
	"gorm.io/gorm"
)

const (
	REPORTS_STORAGE          = "/app/static/reports"
	TEMPLATE_REPORT_FILENAME = "report_template.docx"
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
	event := database.EventModel{}

	r.DB.First(&event, eventId)

	eventSponsors := strings.Join(event.Sponsors, ", ")

	eventDate := fmt.Sprintf(
		"с %s по %s %s %s г.",
		strconv.Itoa(event.StartDate.Day()),
		strconv.Itoa(event.FinishDate.Day()),
		event.StartDate.Month().String(),
		strconv.Itoa(event.StartDate.Year()),
	)

	replacements := docx.PlaceholderMap{
		"EventTitle":    event.Title,
		"EventSponsors": eventSponsors,
		"EventDate":     eventDate,
	}

	participantsTeams := []database.TeamModel{}
	r.DB.Where("id IN ?",event.ParticipantsTeamsIds).Find(&participantsTeams)

	replacements["EventLocation"] = participantsTeams[0].EventLocation

	teamMembers := []database.UserModel{}
	var memberIDs []int64
	for _, memberID := range participantsTeams[0].MembersId {
		memberIDs = append(memberIDs, memberID)
	}

	r.DB.Where("id IN ?", memberIDs).Find(&teamMembers)

	for index, member := range teamMembers {
		replacements[fmt.Sprintf("Rank%s", strconv.Itoa((index+1)))] = member.Rank
		replacements[fmt.Sprintf("Lastname%s", strconv.Itoa((index+1)))] = member.Lastname
		replacements[fmt.Sprintf("Firstname%s", strconv.Itoa((index+1)))] = string([]rune(member.Firstname)[0])
		replacements[fmt.Sprintf("Middlename%s", strconv.Itoa((index+1)))] = string([]rune(member.Middlename)[0])
		replacements[fmt.Sprintf("GroupNumber%s", strconv.Itoa((index+1)))] = member.GroupNumber
	}

	tmplReportFilePath := filepath.Join(REPORTS_STORAGE, "template",TEMPLATE_REPORT_FILENAME)
	doc, err := docx.Open(tmplReportFilePath)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to open template report: %v", err), ""
	}

	_ = doc.ReplaceAll(replacements)
	// if err != nil  {
		// return http.StatusInternalServerError, fmt.Errorf("failed to replace template report: %v", err), ""
	// }

	log.Print(replacements)

	newReportName := strings.ReplaceAll(fmt.Sprintf("report_%s_%s.docx", event.Title, event.Type), " ", "_")

	newReportPath := filepath.Join(REPORTS_STORAGE, newReportName)
	err = doc.WriteToFile(newReportPath)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to save new report: %v", err), ""
	}

	return http.StatusOK, nil, newReportName
}
