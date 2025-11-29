package config

import (
	"fmt"
	"server/internal/authorizer"
	"server/internal/cloud"
	"server/internal/database"
	"server/internal/onliner"

	"github.com/spf13/viper"
)

type VkaHubConfig struct {
	Database   database.Config           `mapstructure:"database"`
	Migrations database.MigrationsConfig `mapstructure:"migrations"`
	Authorizer authorizer.Config         `mapstructure:"authorizer"`
	Onliner    onliner.Config            `mapstructure:"onliner"`
	Cloud      cloud.Config              `mapstructure:"cloud"`
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
	viperInstance.SetDefault("migrations.dirUrl", "file:///app/migrations")

	viperInstance.SetDefault("authorizer.accessSecretKey", "access-vkahub-secret-vkahub-key")
	viperInstance.SetDefault("authorizer.refreshSecretKey", "refresh-vkahub-secret-vkahub-key")

	viperInstance.SetDefault("redis.address", "redis:6379")
	viperInstance.SetDefault("redis.password", "redis-vkahub-password")
	viperInstance.SetDefault("redis.databaseNum", 0)

	viperInstance.SetDefault("cloud.address", "cloud:9000")
	viperInstance.SetDefault("cloud.username", "minio-root")
	viperInstance.SetDefault("cloud.password", "minio-root")
	viperInstance.SetDefault("cloud.enableSSL", false)
	viperInstance.SetDefault("cloud.mainBucket", "vkahub-bucket")

	if err := viperInstance.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config file %s: %v", filePath, err)
	}

	if err := viperInstance.Unmarshal(vkaHubConfig); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config file %s: %v", filePath, err)
	}

	return vkaHubConfig, nil
}
