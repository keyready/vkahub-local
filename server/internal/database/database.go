package database

import (
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
	mockCfg *MockConfig,
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

	if mockCfg.Enable {
		mockMigration, err := migrate.New(
			migrationsCfg.ConnUri,
			mockCfg.DirUrl,
		)
		if err != nil {
			log.Fatalln("failed to init mock migrations: ", err)
		}

		if err = mockMigration.Up(); err != nil {
			log.Fatalln("failed to run mock migrations: ", err)
		}
	}

	return db
}
