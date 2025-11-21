package repositories

import (
	"fmt"
	"net/http"
	"server/internal/dto/request"
	"server/internal/dto/response"
	"server/internal/models"
	"slices"
	"time"

	"gorm.io/gorm"
)

type ProposalRepository interface {
	CreateProposal(CreateProp request.CreateProposalRequest) (httpCode int, err error)
	FetchPersonalProposals(FetchProp request.FetchProposalRequest) (httpCode int, err error, data []response.FetchProposalEntityResponse)
	ApproveProposal(aprProp request.ApproveProposalRequest) (httpCode int, err error)
	CancelProposal(proposalId int64) (httpCode int, err error)
}

type ProposalRepositoryImpl struct {
	DB *gorm.DB
}

func NewProposalRepositoryImpl(DB *gorm.DB) ProposalRepository {
	return &ProposalRepositoryImpl{DB: DB}
}

func (p *ProposalRepositoryImpl) CancelProposal(proposalId int64) (httpCode int, err error) {
	p.DB.Where("id = ?", proposalId).Delete(&models.ProposalModel{ID: proposalId})
	return http.StatusOK, nil
}

func (p *ProposalRepositoryImpl) ApproveProposal(aprProp request.ApproveProposalRequest) (httpCode int, err error) {
	var proposal models.ProposalModel
	var newMember models.UserModel
	var newTeam models.TeamModel

	p.DB.Where("id = ?", aprProp.ProposalId).First(&proposal)
	p.DB.Where("id = ?", proposal.TeamID).First(&newTeam)
	p.DB.Where("id = ?", proposal.OwnerId).First(&newMember)

	newMember.TeamId = newTeam.ID

	memberSince, _ := time.Parse(time.RFC3339, time.Now().String())
	newMember.MemberSince = memberSince

	p.DB.Save(&newMember)

	newTeam.MembersId = append(newTeam.MembersId, proposal.OwnerId)
	p.DB.Save(&newTeam)

	p.DB.Create(&models.NotificationModel{
		OwnerId: newMember.ID,
		Message: fmt.Sprintf("%s, поздравляем Вас! \n Вы стали членом команды %s. Желаем успехов и побед в новом коллективе!", newMember.Username, newTeam.Title),
	})

	p.DB.Delete(&proposal)

	var persAchievement models.PersonalAchievementModel
	p.DB.Where("key = ?", "member").First(&persAchievement)
	if !slices.Contains(persAchievement.OwnerIds, newMember.ID) {
		persAchievement.OwnerIds = append(persAchievement.OwnerIds, newMember.ID)
		p.DB.Save(&persAchievement)
		p.DB.Create(&models.NotificationModel{
			OwnerId: newMember.ID,
			Message: fmt.Sprintf("%s,у вас новое достижение: %s", newMember.Username, persAchievement.Title),
		})
		p.DB.Create(&models.NotificationModel{
			OwnerId: newTeam.CaptainId,
			Message: fmt.Sprintf("Ваше приглашение в команду принято участником %s", newMember.Username),
		})
	}

	return http.StatusOK, nil
}

func (p *ProposalRepositoryImpl) FetchPersonalProposals(FetchProp request.FetchProposalRequest) (int, error, []response.FetchProposalEntityResponse) {
	var resp []response.FetchProposalEntityResponse

	switch FetchProp.Type {
	case "invite":
		var user models.UserModel
		var proposals []models.ProposalModel

		p.DB.Where("username = ?", FetchProp.KtoSmotrit).First(&user)
		p.DB.Where("owner_id = ?", user.ID).Find(&proposals)

		for _, proposal := range proposals {
			var team models.TeamModel
			var captain models.UserModel
			p.DB.Where("id = ?", proposal.TeamID).First(&team)
			p.DB.Where("id = ?", team.CaptainId).First(&captain)

			prop := response.FetchProposalEntityResponse{}
			prop.ID = proposal.ID
			prop.Type = proposal.Type
			prop.Message = proposal.Message
			prop.CreatedAt = proposal.CreatedAt.String()
			prop.OwnerId = team.CaptainId
			prop.OwnerName = captain.Lastname + " " + string(captain.Firstname[0]) + "."
			prop.TeamId = team.ID
			prop.TeamTitle = team.Title

			resp = append(resp, prop)
		}

	case "request":
		var captain models.UserModel
		var proposals []models.ProposalModel
		var team models.TeamModel
		var owner models.UserModel

		p.DB.Where("username = ?", FetchProp.KtoSmotrit).First(&captain)
		p.DB.Where("captain_id = ?", captain.ID).Find(&team)
		p.DB.Where("team_id = ?", team.ID).Find(&proposals)

		for _, proposal := range proposals {
			p.DB.Where("id = ?", proposal.OwnerId).First(&owner)

			prop := response.FetchProposalEntityResponse{}
			prop.ID = proposal.ID
			prop.Type = proposal.Type
			prop.Message = proposal.Message
			prop.CreatedAt = proposal.CreatedAt.String()
			prop.OwnerId = proposal.OwnerId
			prop.OwnerName = owner.Lastname + " " + string(owner.Firstname[0]) + "."
			prop.TeamId = team.ID
			prop.TeamTitle = team.Title
			resp = append(resp, prop)
		}
	}

	return http.StatusOK, nil, resp
}

func (p *ProposalRepositoryImpl) CreateProposal(CreateProp request.CreateProposalRequest) (int, error) {
	switch CreateProp.Type {
	case "invite":
		for _, id := range CreateProp.UsersId {
			var user models.UserModel
			var captain models.UserModel
			var team models.TeamModel
			newProposal := models.ProposalModel{
				Type:    CreateProp.Type,
				TeamID:  CreateProp.TeamId,
				Message: CreateProp.Message,
				OwnerId: id,
			}
			p.DB.Create(&newProposal)
			p.DB.Where("id = ?", id).First(&user)
			p.DB.Where("id = ?", CreateProp.TeamId).First(&team)
			p.DB.Where("id = ?", team.CaptainId).First(&captain)

			invitedNotification := &models.NotificationModel{
				OwnerId: user.ID,
				Message: fmt.Sprintf("%s, вас пригласили в команду %s", user.Username, team.Title),
			}
			p.DB.Create(&invitedNotification)

			// msgEntity := other.MailDto{
			// 	MailName: "InvitedTeam",
			// 	Receiver: user.Mail,
			// 	Msg: other.MailBody{
			// 		TypeMsg:     "text/html",
			// 		Name:        user.Username,
			// 		TeamTitle:   team.Title,
			// 		CaptainName: captain.Username,
			// 		Message:     CreateProp.Message,
			// 		ImageLink:   team.Image,
			// 	},
			// }

			// mainErr := appmail.SendMail(msgEntity)
			// if mainErr != nil {
			// 	return http.StatusInternalServerError, mainErr
			// }
		}

	case "request":
		var team models.TeamModel
		var user models.UserModel
		p.DB.Where("id = ", CreateProp.TeamId).Find(&team)
		p.DB.Where("id = ", CreateProp.UsersId[0]).First(&user)
		createdAt, _ := time.Parse(time.Now().String(), time.RFC3339)
		newProposal := models.ProposalModel{
			Type:      CreateProp.Type,
			TeamID:    CreateProp.TeamId,
			Message:   CreateProp.Message,
			OwnerId:   CreateProp.UsersId[0],
			CreatedAt: createdAt,
		}
		p.DB.Create(&newProposal)
		p.DB.Create(&models.NotificationModel{
			OwnerId: team.CaptainId,
			Message: fmt.Sprintf("В вашу команду желает вступить %s: %s", user.Username, CreateProp.Message),
		})
	}

	return http.StatusOK, nil
}
