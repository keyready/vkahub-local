package config

import (
	"fmt"
	"server/internal/database"

	"github.com/spf13/viper"
)

type VkaHubConfig struct {
	Database   database.Config           `mapstructure:"database"`
	Migrations database.MigrationsConfig `mapstructure:"migrations"`
}

func FromFile(filePath string) (*VkaHubConfig, error) {
	vkaHubConfig := &VkaHubConfig{}

	viperInstance := viper.New()
	viperInstance.AutomaticEnv()
	viperInstance.SetConfigFile(filePath)

	viperInstance.SetDefault("database.username", "postgres")
	viperInstance.SetDefault("database.password", "postgres")
	viperInstance.SetDefault("database.host", "db")
	viperInstance.SetDefault("database.port", 5432)
	viperInstance.SetDefault("database.databaseName", "vkahub")
	viperInstance.SetDefault("database.sslMode", false)

	viperInstance.SetDefault("migrations.connUri", "postgres://postgres:postgres@db:5432/vkahub?sslmode=disable")
	viperInstance.SetDefault("migrations.enable", true)
	viperInstance.SetDefault("migrations.dirUrl", "file://app/migrations")

	if err := viperInstance.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config file %s: %v", filePath, err)
	}

	if err := viperInstance.Unmarshal(vkaHubConfig); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config file %s: %v", filePath, err)
	}

	return vkaHubConfig, nil
}
