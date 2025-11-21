package jsonwebtoken

type Config struct {
	AccessSecretKey  string `mapstructure:"accessSecretKey"`
	RefreshSecretKey string `mapstructure:"refreshSecretKey"`
}
