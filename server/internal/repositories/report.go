package repositories

import (
	"fmt"
	"net/http"
	"path/filepath"
	"server/internal/models"
	"strconv"
	"strings"

	"github.com/unidoc/unioffice/v2/document"
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
	event := models.EventModel{}

	r.DB.First(&event, eventId)

	eventSponsors := strings.Join(event.Sponsors, ", ")

	eventDate := fmt.Sprintf(
		"с %s по %s %s %s г.",
		strconv.Itoa(event.StartDate.Day()),
		strconv.Itoa(event.FinishDate.Day()),
		event.StartDate.Month().String(),
		strconv.Itoa(event.StartDate.Year()),
	)

	replacements := map[string]string{
		"EventTitle":    event.Title,
		"EventSponsors": eventSponsors,
		"EventDate":     eventDate,
	}

	participantsTeams := []models.TeamModel{}
	r.DB.Where("id = 1").Find(&participantsTeams)

	replacements["EventLocation"] = participantsTeams[0].EventLocation

	teamMembers := []models.UserModel{}
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

	tmplRepFilePath := filepath.Join(REPORTS_STORAGE, TEMPLATE_REPORT_FILENAME)
	tmplFile, err := document.Open(tmplRepFilePath)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to open template report: %w", err), ""
	}
	defer tmplFile.Close()

	fmt.Print(replacements)

	err = fillTemplate(tmplFile, replacements)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("error while filling template: %v\n", err.Error()), ""
	}

	reportName = strings.ReplaceAll(fmt.Sprintf("report_%s_%s.docx", event.Title, event.Type), " ", "_")
	err = tmplFile.SaveToFile(filepath.Join(REPORTS_STORAGE, reportName))
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("failed to save new report: %w", err), ""
	}

	return http.StatusOK, nil, reportName
}

func fillTemplate(doc *document.Document, replacements map[string]string) error {
	for _, para := range doc.Paragraphs() {
		runs := para.Runs()
		if len(runs) == 0 {
			continue
		}

		var fullText strings.Builder
		for _, run := range runs {
			fullText.WriteString(run.Text())
		}

		paragraphText := fullText.String()

		placeholders := extractAllPlaceholders(paragraphText)

		for _, placeholder := range placeholders {
			if replacement, exists := replacements[placeholder]; exists {
				replaceInRuns(runs, placeholder, replacement)
			}
		}
	}

	if err := doc.Validate(); err != nil {
		return fmt.Errorf("validate document failed: %w", err)
	}

	return nil
}

func extractAllPlaceholders(text string) []string {
	var placeholders []string
	seen := make(map[string]bool)
	start := 0

	for {
		startIdx := strings.Index(text[start:], "{{")
		if startIdx == -1 {
			break
		}
		startIdx += start

		endIdx := strings.Index(text[startIdx:], "}}")
		if endIdx == -1 {
			break
		}
		endIdx += startIdx

		placeholder := strings.TrimSpace(text[startIdx+2 : endIdx])

		if !seen[placeholder] {
			placeholders = append(placeholders, placeholder)
			seen[placeholder] = true
		}

		start = endIdx + 2
	}

	return placeholders
}

func replaceInRuns(runs []document.Run, placeholder, replacement string) {
	fullPlaceholder := "{{" + placeholder + "}}"

	for i := 0; i < len(runs); i++ {
		run := runs[i]
		originalText := run.Text()

		if strings.Contains(originalText, fullPlaceholder) {
			newText := strings.ReplaceAll(originalText, fullPlaceholder, replacement)
			updateSingleRun(run, newText)
			continue
		}

		if strings.Contains(originalText, "{{") && !strings.Contains(originalText, "}}") {
			processMultiRunPlaceholder(runs, i, placeholder, replacement)
			break
		}
	}
}

func processMultiRunPlaceholder(runs []document.Run, startIndex int, placeholder, replacement string) {
	fullPlaceholder := "{{" + placeholder + "}}"
	var collectedText strings.Builder

	for j := startIndex; j < len(runs); j++ {
		runText := runs[j].Text()
		collectedText.WriteString(runText)

		currentText := collectedText.String()

		if strings.Contains(currentText, "}}") {
			if strings.Contains(currentText, fullPlaceholder) {
				newFirstText := strings.ReplaceAll(runs[startIndex].Text(), "{{", "")
				if strings.Contains(newFirstText, placeholder) {
					newFirstText = strings.ReplaceAll(newFirstText, placeholder, replacement)
					newFirstText = strings.ReplaceAll(newFirstText, "}}", "")
				}
				updateSingleRun(runs[startIndex], newFirstText)

				for k := startIndex + 1; k <= j; k++ {
					cleanText := strings.ReplaceAll(runs[k].Text(), "{{", "")
					cleanText = strings.ReplaceAll(cleanText, "}}", "")
					cleanText = strings.ReplaceAll(cleanText, placeholder, "")
					updateSingleRun(runs[k], cleanText)
				}
			}
			break
		}
	}
}

func updateSingleRun(run document.Run, newText string) {
	for _, egRunInnerContent := range run.X().EG_RunInnerContent {
		if egRunInnerContent == nil || egRunInnerContent.RunInnerContentChoice.T == nil {
			continue
		}
		egRunInnerContent.RunInnerContentChoice.T.Content = newText
	}
}
