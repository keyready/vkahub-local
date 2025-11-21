package config

import (
	"fmt"
	"server/internal/database"
	"server/pkg/utils/jsonwebtoken"

	"github.com/spf13/viper"
)

type VkaHubConfig struct {
	Database   database.Config     `mapstructure:"database"`
	Authorizer jsonwebtoken.Config `mapstructure:"authorizer"`
}

func FromFile(filePath string) (*VkaHubConfig, error) {
	vkaHubConfig := &VkaHubConfig{}

	viperInstance := viper.New()
	viperInstance.AutomaticEnv()
	viperInstance.SetConfigFile(filePath)

	if err := viperInstance.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config file %s: %v", filePath, err)
	}

	if err := viperInstance.Unmarshal(vkaHubConfig); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config file %s: %v", filePath, err)
	}

	return vkaHubConfig, nil
}
