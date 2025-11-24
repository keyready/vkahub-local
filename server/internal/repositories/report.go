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
	GenerateReport(eventId int64) (httpCode int, reportName string, err error)
}

type ReportRepositoryImpl struct {
	DB *gorm.DB
}

func NewReportRepositoryImpl(DB *gorm.DB) ReportRepository {
	return &ReportRepositoryImpl{DB: DB}
}

func (r ReportRepositoryImpl) GenerateReport(eventId int64) (httpCode int, reportName string, err error) {
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
		"Tilte":    event.Title,
		"Sponsors": eventSponsors,
		"Date":     eventDate,
	}

	participantsTeams := []database.TeamModel{}
	var participantsTeamsIds []int64
	for _, teamID := range event.ParticipantsTeamsIds {
		participantsTeamsIds = append(participantsTeamsIds, teamID)
	}
	r.DB.Where("id IN ?", participantsTeamsIds).Find(&participantsTeams)

	for num, team := range participantsTeams {
		replacements[fmt.Sprintf("TeamNumber%d", num+1)] = num + 1
		replacements[fmt.Sprintf("TeamTitle%d", num+1)] = team.Title
		replacements[fmt.Sprintf("EventLocation%d", num+1)] = team.EventLocation

		teamMembers := []database.UserModel{}
		var memberIDs []int64
		for _, memberID := range team.MembersId {
			memberIDs = append(memberIDs, memberID)
		}

		r.DB.Where("id IN ?", memberIDs).Find(&teamMembers)

		for index, member := range teamMembers {
			replacements[fmt.Sprintf("Rank%d_%d", num+1, index+1)] = member.Rank
			replacements[fmt.Sprintf("Lastname%d_%d", num+1, index+1)] = member.Lastname
			replacements[fmt.Sprintf("Firstname%d_%d", num+1, index+1)] = string([]rune(member.Firstname)[0])
			replacements[fmt.Sprintf("Middlename%d_%d", num+1, index+1)] = string([]rune(member.Middlename)[0])
			replacements[fmt.Sprintf("GroupNumber%d_%d", num+1, index+1)] = member.GroupNumber
		}
	}

	tmplReportFilePath := filepath.Join(REPORTS_STORAGE, "template", TEMPLATE_REPORT_FILENAME)
	doc, err := docx.Open(tmplReportFilePath)
	if err != nil {
		return http.StatusInternalServerError, "", fmt.Errorf("failed to open template report: %v", err)
	}
	defer doc.Close()

	_ = doc.ReplaceAll(replacements)
	if err != nil {
		log.Println("failed replace: ", err.Error())
	}

	log.Print(replacements)

	newReportName := strings.ReplaceAll(fmt.Sprintf("report_%s_%s.docx", event.Title, event.Type), " ", "_")

	newReportPath := filepath.Join(REPORTS_STORAGE, newReportName)
	err = doc.WriteToFile(newReportPath)
	if err != nil {
		return http.StatusInternalServerError, "", fmt.Errorf("failed to save new report: %v", err)
	}

	return http.StatusOK, newReportName, nil
}
