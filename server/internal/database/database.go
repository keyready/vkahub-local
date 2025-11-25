package database

import (
	"errors"
	"log"

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
		&UserModel{},
		&TeamModel{},
		&EventModel{},
		&TrackModel{},
		&ProposalModel{},
		&PositionModel{},
		&SkillModel{},
		&BanModel{},
		&AchievementModel{},
		&FeedbackModel{},
		&BugModel{},
		&PersonalAchievementModel{},
		&NotificationModel{},
		&TeamChatModel{},
		&ChatMessageModel{},
		&RecoveryQuestionModel{},
	)

	m, err := migrate.New(
		migrationsCfg.DirUrl,
		migrationsCfg.ConnUri,
	)
	if err != nil {
		log.Fatalln("failed to init migrations: ", err.Error())
	}

	if migrationsCfg.Enable {
		if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
			log.Fatalln("failed to up migrations: ", err.Error())
		}
	} else {
		if err := m.Down(); err != nil {
			log.Fatalln("failed to down migrations: ", err.Error())
		}
	}

	return db
}
