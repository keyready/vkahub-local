package database

import (
	"log"
	"server/internal/models"

	"github.com/golang-migrate/migrate/v4"
	"gorm.io/driver/postgres"

	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"gorm.io/gorm"
)

func DatabaseConnect(
	dbCfg *Config,
	migrationsCfg *MigrationsConfig,
) *gorm.DB {
	dsn := BuildConnectDSN(
		dbCfg.Host,
		dbCfg.Username,
		dbCfg.Password,
		dbCfg.DatabaseName,
		dbCfg.Port,
		dbCfg.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	db.AutoMigrate(
		&models.UserModel{},
		&models.TeamModel{},
		&models.EventModel{},
		&models.TrackModel{},
		&models.ProposalModel{},
		&models.PositionModel{},
		&models.SkillModel{},
		&models.BanModel{},
		&models.AchievementModel{},
		&models.FeedbackModel{},
		&models.BugModel{},
		&models.PersonalAchievementModel{},
		&models.NotificationModel{},
		&models.TeamChatModel{},
		&models.ChatMessageModel{},
	)

	m, err := migrate.New(
		migrationsCfg.DirUrl,
		migrationsCfg.ConnUri,
	)
	if err != nil {
		log.Fatalln("failed to init migrations: ", err.Error())
	}

	if migrationsCfg.Enable {
		if err := m.Up(); err != nil {
			log.Fatalln("failed to down migrations: ", err.Error())
		}
	} else {
		if err := m.Down(); err != nil {
			log.Fatalln("failed to down migrations: ", err.Error())
		}
	}

	return db
}
