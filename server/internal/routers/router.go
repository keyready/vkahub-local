package routers

import (
	"server/internal/authorizer"
	"server/internal/controllers"
	"server/internal/gocron"
	"server/internal/repositories"
	v1 "server/internal/routers/api/v1"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/robfig/cron"
	"gorm.io/gorm"
)

func InitRouter(
	db *gorm.DB,
	jwtService *authorizer.Authorizer,
) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	c := cron.New()
	// c.AddFunc("@weekly", gocron.Banned(db))
	c.AddFunc("@monthly", gocron.ClearNotifications(db))
	c.Start()

	authRepo := repositories.NewAuthRepositoryImpl(db, jwtService)
	authService := services.NewAuthServiceImpl(authRepo)
	authCtrl := controllers.NewAuthController(authService, jwtService)
	v1.NewAuthRouters(r, jwtService, authCtrl)

	teamRepo := repositories.NewTeamRepositoryImpl(db)
	teamService := services.NewTeamServiceImpl(teamRepo)
	teamCtrl := controllers.NewTeamController(teamService)
	v1.NewTeamRouters(r, jwtService, teamCtrl)

	userRepo := repositories.NewUserRepositoryImpl(db)
	userService := services.NewUserServiceImpl(userRepo)
	userCtrl := controllers.NewUserControllers(userService)
	v1.NewUserRouters(r, jwtService, userCtrl)

	r.GET("/ws/online", userCtrl.GetOnlineUsers)
	r.GET("/ws/notifications", userCtrl.SendNotifications)
	r.GET("/ws/messenger/:teamId", userCtrl.FetchAllMessages)

	proposalRepo := repositories.NewProposalRepositoryImpl(db)
	proposalService := services.NewProposalServiceImpl(proposalRepo)
	proposalCtrl := controllers.NewProposalControllers(proposalService)
	v1.NewProposalRouters(r, jwtService, proposalCtrl)

	eventRepo := repositories.NewEventRepositoryImpl(db)
	eventService := services.NewEventServiceImpl(eventRepo)
	eventCtrl := controllers.NewEventController(eventService)
	v1.NewEventRouters(r, jwtService, eventCtrl)

	trackRepo := repositories.NewTrackRepositoryImpl(db)
	trackService := services.NewTrackServiceImpl(trackRepo)
	trackCtrl := controllers.NewTrackController(trackService)
	v1.NewTrackRouters(r, jwtService, trackCtrl)

	achievementRepo := repositories.NewAchievementRepositoryImpl(db)
	achievementService := services.NewAcServiceImpl(achievementRepo)
	achievementCtrl := controllers.NewAchievementController(achievementService)
	v1.NewAchievementRoutes(r, jwtService, achievementCtrl)

	skillRepo := repositories.NewSkillRepositoryImpl(db)
	skillService := services.NewSkillServiceImpl(skillRepo)
	skillCtrl := controllers.NewSkillControllers(skillService)
	v1.NewSkillRoutes(r, jwtService, skillCtrl)

	positionRepo := repositories.NewPositionRepImpl(db)
	positionService := services.NewPosServiceImpl(positionRepo)
	positionCtrl := controllers.NewPositionController(positionService)
	v1.NewPositionsRoutes(r, jwtService, positionCtrl)

	reportRepo := repositories.NewReportRepositoryImpl(db)
	reportService := services.NewReportServiceImpl(reportRepo)
	reportCtrl := controllers.NewReportControllers(reportService)
	v1.NewReportRoutes(r, jwtService, reportCtrl)

	bugRepo := repositories.NewBugRepositoryImpl(db)
	bugService := services.NewBugServiceImpl(bugRepo)
	bugCtrl := controllers.NewBugControllers(bugService)
	v1.NewBugRoutes(r, jwtService, bugCtrl)

	feedbackRepo := repositories.NewFeedbackImpl(db)
	feedbackService := services.NewFeedbackServiceImpl(feedbackRepo)
	feedbackCtrl := controllers.NewFeedbackController(feedbackService)
	v1.NewFeedbackRoutes(r, jwtService, feedbackCtrl)

	teamChatRep := repositories.NewTeamChatServiceImpl(db)
	teamCharSer := services.NewTeamChatServiceImpl(teamChatRep)
	teamChatC := controllers.NewTeamChatController(teamCharSer)
	v1.NewTeamChatRoutes(r, jwtService, teamChatC)

	return r
}
