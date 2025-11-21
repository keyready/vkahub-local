package database

import (
	"backend/internal/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func DatabaseConnect() *gorm.DB {
	dsn := "host=db port=5432 user=postgres password=postgres dbname=vkahub sslmode=disable"
	// dsn := fmt.Sprintf("host = %s port = %s user = %s password = %s dbname = %s sslmode=disable",
	// 	os.Getenv("DB_HOST"),
	// 	os.Getenv("DB_PORT"),
	// 	os.Getenv("DB_USER"),
	// 	os.Getenv("DB_PASSWORD"),
	// 	os.Getenv("DB_NAME"),
	// )

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	db.AutoMigrate(&models.UserModel{})
	db.AutoMigrate(&models.TeamModel{})
	db.AutoMigrate(&models.EventModel{})
	db.AutoMigrate(&models.TrackModel{})
	db.AutoMigrate(&models.ProposalModel{})

	db.AutoMigrate(&models.PositionModel{})
	positions := []string{"Frontend", "Backend", "DevOps", "Аналитик", "UI/UX", "Project Manager", "ML", "Pentest/Security"}
	for _, name := range positions {
		var position models.PositionModel
		err = db.FirstOrCreate(&position, &models.PositionModel{Name: name}).Error
		if err != nil {
			continue
		}
	}

	db.AutoMigrate(&models.SkillModel{})
	skills := []string{"Docker", "Git", "Golang", "Python", "Kubernetes", "React", "Angular", "Vue", "Next",
		"Nuxt", "JQuery", "HTML", "CSS", "SCSS", "Tailwind", "Docker", "Nginx", "Redis", "Vercel", "Kubernetes",
		"Caddy", "CI/CD", "Post	greSQL", "MongoDB", "MySQL", "ElasticSearch", "SQLite", "NodeJs", "NestJs",
		"Golang", "Python", "Django", "Flask", "FastApi", "Ruby (Ruby on Rails)", "Java", "JavaSpring", "Laravel",
		"PHP", "WordPress", "1C", "Figma", "Photoshop", "Illustrator", "TensorFlow", "PyTorch", "HuggingFace"}
	for _, name := range skills {
		var skill models.SkillModel
		err = db.FirstOrCreate(&skill, &models.SkillModel{Name: name}).Error
		if err != nil {
			continue
		}
	}

	db.AutoMigrate(&models.BanModel{})
	db.AutoMigrate(&models.AchievementModel{})

	db.AutoMigrate(&models.FeedbackModel{})
	db.AutoMigrate(&models.BugModel{})

	db.AutoMigrate(&models.PersonalAchievementModel{})

	titles := []string{
		"Известная личность",
		"Основатель",
		"Боевая единица",
		"Популяризатор",
		"Боевое крещение",
		"Торжественный марш",
		"Победное знамя",
		"Контрольный рубеж",
		"За волю к победе",
		"Смена обстановки",
		"Достойный приемник",
		"Взаимовыручка",
		"Охотник",
		"Почетный разработчик",
	}

	descriptions := []string{
		"Пройти верификацию аккаунта и получить доступ ко всем функциям",
		"Основать команду и пригласить друзей",
		"Вступить в команду как участник",
		"Пригласить не менее трех друзей для участия в проекте",
		"Впервые принять участие в событии",
		"Принять участие не менее чем в трех событиях за месяц",
		"Занять первое место не менее чем в трех событиях",
		"Занять не менее 3 призовых мест",
		"Принять участие в 10 событиях, но не занять ни одного призового места",
		"Основать и распустить 5 команд",
		"Создать команду и передать лидерство другому участнику",
		"Написать первый отзыв или оставить предложение по улучшению сервиса",
		"Найти баг, отправить корректный отчет и получить статус бага 'Исправлено'",
		"Выдается за существенный вклад в развитие проекта",
	}
	imageNames := []string{
		"famous.webp",
		"leader.webp",
		"combat_unit.webp",
		"populizer.webp",
		"baptism.webp",
		"march.webp",
		"victory-banner.webp",
		"milestone.webp",
		"will-to-win.webp",
		"change.webp",
		"receiver.webp",
		"feedback.webp",
		"bug.webp",
		"developer.webp",
	}
	keys := []string{
		"confirmed",
		"leader",
		"member",
		"populate",
		"baptism",
		"hikeman",
		"victorybanner",
		"milestone",
		"will2win",
		"change",
		"receiver",
		"feedback",
		"bug",
		"developer",
	}

	for i, title := range titles {
		var personalAchievement models.PersonalAchievementModel
		err = db.FirstOrCreate(&personalAchievement, &models.PersonalAchievementModel{
			Title:       title,
			Description: descriptions[i],
			Image:       imageNames[i],
			Key:         keys[i],
		}).Error
		if err != nil {
			continue
		}
	}

	db.AutoMigrate(&models.NotificationModel{})

	db.AutoMigrate(&models.TeamChatModel{})
	db.AutoMigrate(&models.ChatMessageModel{})

	return db
}
