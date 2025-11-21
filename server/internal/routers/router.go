package routers

import (
	"server/internal/controllers"
	"server/internal/gocron"
	"server/internal/repositories"
	v1 "server/internal/routers/api/v1"
	"server/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/robfig/cron"
	_ "github.com/robfig/cron"
	"gorm.io/gorm"
)

func InitRouter(db *gorm.DB) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	c := cron.New()
	// c.AddFunc("@weekly", gocron.Banned(db))
	c.AddFunc("@monthly", gocron.ClearNotifications(db))
	c.Start()

	ar := repositories.NewAuthRepositoryImpl(db)
	as := services.NewAuthServiceImpl(ar)
	ac := controllers.NewAuthController(as)
	v1.NewAuthRouters(r, ac)

	tr := repositories.NewTeamRepositoryImpl(db)
	ts := services.NewTeamServiceImpl(tr)
	tc := controllers.NewTeamController(ts)
	v1.NewTeamRouters(r, tc)

	ur := repositories.NewUserRepositoryImpl(db)
	us := services.NewUserServiceImpl(ur)
	uc := controllers.NewUserControllers(us)
	v1.NewUserRouters(r, uc)

	r.GET("/ws/online", uc.GetOnlineUsers)
	r.GET("/ws/notifications", uc.SendNotifications)
	r.GET("/ws/messenger/:teamId", uc.FetchAllMessages)

	pr := repositories.NewProposalRepositoryImpl(db)
	ps := services.NewProposalServiceImpl(pr)
	pc := controllers.NewProposalControllers(ps)
	v1.NewProposalRouters(r, pc)

	er := repositories.NewEventRepositoryImpl(db)
	es := services.NewEventServiceImpl(er)
	ec := controllers.NewEventController(es)
	v1.NewEventRouters(r, ec)

	trr := repositories.NewTrackRepositoryImpl(db)
	trs := services.NewTrackServiceImpl(trr)
	trc := controllers.NewTrackController(trs)
	v1.NewTrackRouters(r, trc)

	acr := repositories.NewAchievementRepositoryImpl(db)
	acs := services.NewAcServiceImpl(acr)
	acc := controllers.NewAchievementController(acs)
	v1.NewAchievementRoutes(r, acc)

	sr := repositories.NewSkillRepositoryImpl(db)
	ss := services.NewSkillServiceImpl(sr)
	sc := controllers.NewSkillControllers(ss)
	v1.NewSkillRoutes(r, sc)

	pos_r := repositories.NewPositionRepImpl(db)
	pos_s := services.NewPosServiceImpl(pos_r)
	pos_c := controllers.NewPositionController(pos_s)
	v1.NewPositionsRoutes(r, pos_c)

	rep_r := repositories.NewReportRepositoryImpl(db)
	rep_s := services.NewReportServiceImpl(rep_r)
	rep_c := controllers.NewReportControllers(rep_s)
	v1.NewReportRoutes(r, rep_c)

	br := repositories.NewBugRepositoryImpl(db)
	bs := services.NewBugServiceImpl(br)
	bc := controllers.NewBugControllers(bs)
	v1.NewBugRoutes(r, bc)

	fr := repositories.NewFeedbackImpl(db)
	fs := services.NewFeedbackServiceImpl(fr)
	fc := controllers.NewFeedbackController(fs)
	v1.NewFeedbackRoutes(r, fc)

	teamChatRep := repositories.NewTeamChatServiceImpl(db)
	teamCharSer := services.NewTeamChatServiceImpl(teamChatRep)
	teamChatC := controllers.NewTeamChatController(teamCharSer)
	v1.NewTeamChatRoutes(r, teamChatC)

	return r
}
