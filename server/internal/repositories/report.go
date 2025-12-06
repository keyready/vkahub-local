package repositories

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"server/internal/cloud"
	"server/internal/database"
	"server/internal/forms/dto"
	"strings"

	"github.com/lukasjarosch/go-docx"
	"gorm.io/gorm"
)

type ReportRepository interface {
	GenerateReport(eventId int64) (int, string, error)
}

type ReportRepositoryImpl struct {
	DB    *gorm.DB
	cloud *cloud.Cloud
}

func NewReportRepositoryImpl(
	DB *gorm.DB,
	cloud *cloud.Cloud,
) ReportRepository {
	return &ReportRepositoryImpl{
		DB:    DB,
		cloud: cloud,
	}
}

func (r ReportRepositoryImpl) GenerateReport(eventID int64) (int, string, error) {
	event := database.EventModel{}
	r.DB.First(&event, eventID)

	eventSponsors := strings.Join(event.Sponsors, ", ")

	eventDate := fmt.Sprintf(
		"с %d по %d %s %d г.",
		event.StartDate.Day(),
		event.FinishDate.Day(),
		event.StartDate.Month().String(),
		event.StartDate.Year(),
	)

	replacements := docx.PlaceholderMap{
		"Tilte":    event.Title,
		"Sponsors": eventSponsors,
		"Date":     eventDate,
	}

	participantsTeamIDs := make([]int64, len(event.ParticipantsTeamIDs))
	for _, teamID := range event.ParticipantsTeamIDs {
		participantsTeamIDs = append(participantsTeamIDs, teamID)
	}

	participantsTeams := make([]database.TeamModel, len(participantsTeamIDs))
	err := r.DB.Where("id IN ?", event.ParticipantsTeamIDs).Find(&participantsTeams).Error
	if err != nil {
		return http.StatusInternalServerError, "", fmt.Errorf("falied to select participants teams: %v", err)
	}

	for num, team := range participantsTeams {
		replacements[fmt.Sprintf("EventLocation%d", num+1)] = team.EventLocation

		memberIDs := make([]int64, len(team.MemberIDs))
		for _, memberID := range team.MemberIDs {
			memberIDs = append(memberIDs, memberID)
		}

		teamMembers := make([]database.UserModel, len(team.MemberIDs))
		err := r.DB.Where("id IN ?", memberIDs).Find(&teamMembers)
		if err != nil {
			return http.StatusInternalServerError, "", fmt.Errorf("failed to select team %s members: %v", team.Title, err)
		}

		for index, member := range teamMembers {
			replacements[fmt.Sprintf("Rank%d_%d", num+1, index+1)] = member.Rank
			replacements[fmt.Sprintf("Lastname%d_%d", num+1, index+1)] = member.Lastname
			replacements[fmt.Sprintf("Firstname%d_%d", num+1, index+1)] = string([]rune(member.Firstname)[0])
			replacements[fmt.Sprintf("Middlename%d_%d", num+1, index+1)] = string([]rune(member.Middlename)[0])
			replacements[fmt.Sprintf("GroupNumber%d_%d", num+1, index+1)] = member.GroupNumber
		}
	}

	tmplReportFilePath := filepath.Join(dto.REPORTS_STORAGE, "template", dto.TEMPLATE_REPORT_FILENAME)
	doc, err := docx.Open(tmplReportFilePath)
	if err != nil {
		return http.StatusInternalServerError, "", fmt.Errorf("failed to open template report: %v", err)
	}
	defer doc.Close()

	err = doc.ReplaceAll(replacements)
	if err != nil {
		log.Println("failed replace: ", err.Error())
	}

	newReportName := strings.ReplaceAll(fmt.Sprintf("report_%s_%s.docx", event.Title, event.Type), " ", "_")

	newReportPath := filepath.Join(dto.REPORTS_STORAGE, newReportName)
	err = doc.WriteToFile(newReportPath)
	if err != nil {
		return http.StatusInternalServerError, "", fmt.Errorf("failed to save new report: %v", err)
	}

	// TODO - перебросить в MiniO новый рапорт

	return http.StatusOK, newReportName, nil
}
