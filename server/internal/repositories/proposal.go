package repositories

import (
	"fmt"
	"net/http"
	"server/internal/database"
	"server/internal/forms/request"
	"server/internal/forms/response"
	"slices"
	"time"

	"gorm.io/gorm"
)

type ProposalRepository interface {
	CreateProposal(createPropForm request.CreateProposalForm) (int, error)
	GetPersonalProposals(getProposalsForm request.GetProposalForm) (int, []response.Proposal, error)
	ApproveProposal(approveProposalForm request.ApproveProposalForm) (int, error)
	CancelProposal(proposalID int64) (int, error)
}

type ProposalRepositoryImpl struct {
	DB *gorm.DB
}

func NewProposalRepositoryImpl(DB *gorm.DB) ProposalRepository {
	return &ProposalRepositoryImpl{DB: DB}
}

func (p *ProposalRepositoryImpl) CancelProposal(proposalID int64) (int, error) {
	p.DB.Where("id = ?", proposalID).Delete(&database.ProposalModel{ID: proposalID})
	return http.StatusOK, nil
}

func (p *ProposalRepositoryImpl) ApproveProposal(approveProposalForm request.ApproveProposalForm) (int, error) {
	var proposal database.ProposalModel
	var newMember database.UserModel
	var newTeam database.TeamModel

	p.DB.Where("id = ?", approveProposalForm.ProposalID).First(&proposal)
	p.DB.Where("id = ?", proposal.TeamID).First(&newTeam)
	p.DB.Where("id = ?", proposal.OwnerID).First(&newMember)

	newMember.TeamID = newTeam.ID

	memberSince, _ := time.Parse(time.RFC3339, time.Now().String())
	newMember.MemberSince = memberSince

	p.DB.Save(&newMember)

	newTeam.MemberIDs = append(newTeam.MemberIDs, proposal.OwnerID)
	p.DB.Save(&newTeam)

	p.DB.Create(&database.NotificationModel{
		OwnerID: newMember.ID,
		Message: fmt.Sprintf(
			`
				%s, поздравляем Вас! \n 
				Вы стали членом команды %s. 
				Желаем успехов и побед в новом коллективе!
			`,
			newMember.Username,
			newTeam.Title,
		),
	})

	p.DB.Delete(&proposal)

	var persAchievement database.PersonalAchievementModel
	p.DB.Where("key = ?", "member").First(&persAchievement)
	if !slices.Contains(persAchievement.OwnerIDs, newMember.ID) {
		persAchievement.OwnerIDs = append(persAchievement.OwnerIDs, newMember.ID)
		p.DB.Save(&persAchievement)
		p.DB.Create(&database.NotificationModel{
			OwnerID: newMember.ID,
			Message: fmt.Sprintf(
				`
					%s, поздравляем! \n
					У вас новое достижение: %s
				`,
				newMember.Username,
				persAchievement.Title,
			),
		})
		p.DB.Create(&database.NotificationModel{
			OwnerID: newTeam.CaptainID,
			Message: fmt.Sprintf(
				`
					Ваше приглашение в команду принято участником %s
				`,
				newMember.Username,
			),
		})
	}

	return http.StatusOK, nil
}

func (p *ProposalRepositoryImpl) GetPersonalProposals(getProposalsForm request.GetProposalForm) (int, []response.Proposal, error) {
	proposals := make([]response.Proposal, 0)

	switch getProposalsForm.Type {
	case "invite":
		userModel := database.UserModel{}
		proposalModels := make([]database.ProposalModel, 0)

		p.DB.Where("username = ?", getProposalsForm.Observer).First(&userModel)
		p.DB.Where("owner_id = ?", userModel.ID).Find(&proposalModels)

		for _, proposal := range proposalModels {
			var team database.TeamModel
			var captain database.UserModel
			p.DB.Where("id = ?", proposal.TeamID).First(&team)
			p.DB.Where("id = ?", team.CaptainID).First(&captain)

			prop := response.Proposal{}
			prop.ID = proposal.ID
			prop.Type = proposal.Type
			prop.Message = proposal.Message
			prop.CreatedAt = proposal.CreatedAt.String()
			prop.OwnerID = team.CaptainID
			prop.OwnerName = captain.Lastname + " " + string(captain.Firstname[0]) + "."
			prop.TeamId = team.ID
			prop.TeamTitle = team.Title

			proposals = append(proposals, prop)
		}

	case "request":
		captain := database.UserModel{}
		proposalModels := make([]database.ProposalModel, 0)
		team := database.TeamModel{}
		owner := database.UserModel{}

		p.DB.Where("username = ?", getProposalsForm.Observer).First(&captain)
		p.DB.Where("captain_id = ?", captain.ID).Find(&team)
		p.DB.Where("team_id = ?", team.ID).Find(&proposalModels)

		for _, proposal := range proposalModels {
			p.DB.Where("id = ?", proposal.OwnerID).First(&owner)

			prop := response.Proposal{}
			prop.ID = proposal.ID
			prop.Type = proposal.Type
			prop.Message = proposal.Message
			prop.CreatedAt = proposal.CreatedAt.String()
			prop.OwnerID = proposal.OwnerID
			prop.OwnerName = owner.Lastname + " " + string(owner.Firstname[0]) + "."
			prop.TeamId = team.ID
			prop.TeamTitle = team.Title
			proposals = append(proposals, prop)
		}
	}

	return http.StatusOK, proposals, nil
}

func (p *ProposalRepositoryImpl) CreateProposal(createPropForm request.CreateProposalForm) (int, error) {
	switch createPropForm.Type {
	case "invite":
		for _, userID := range createPropForm.UserIDs {
			var user database.UserModel
			var captain database.UserModel
			var team database.TeamModel
			newProposal := database.ProposalModel{
				Type:    createPropForm.Type,
				TeamID:  createPropForm.TeamID,
				Message: createPropForm.Message,
				OwnerID: userID,
			}
			p.DB.Create(&newProposal)
			p.DB.Where("id = ?", userID).First(&user)
			p.DB.Where("id = ?", createPropForm.TeamID).First(&team)
			p.DB.Where("id = ?", team.CaptainID).First(&captain)

			invitedNotification := &database.NotificationModel{
				OwnerID: user.ID,
				Message: fmt.Sprintf(
					`
						%s, внимание! \n 
						Вас пригласили в команду %s
					`,
					user.Username,
					team.Title,
				),
			}
			p.DB.Create(&invitedNotification)
		}

	case "request":
		var team database.TeamModel
		var user database.UserModel
		p.DB.Where("id = ", createPropForm.TeamID).Find(&team)
		p.DB.Where("id = ", createPropForm.UserIDs[0]).First(&user)
		createdAt, _ := time.Parse(time.Now().String(), time.RFC3339)
		newProposal := database.ProposalModel{
			Type:      createPropForm.Type,
			TeamID:    createPropForm.TeamID,
			Message:   createPropForm.Message,
			OwnerID:   createPropForm.UserIDs[0],
			CreatedAt: createdAt,
		}
		p.DB.Create(&newProposal)
		p.DB.Create(&database.NotificationModel{
			OwnerID: team.CaptainID,
			Message: fmt.Sprintf(
				`
					В вашу команду желает вступить %s. \n
					Сообщение: %s
				`,
				user.Username, createPropForm.Message,
			),
		})
	}

	return http.StatusOK, nil
}
