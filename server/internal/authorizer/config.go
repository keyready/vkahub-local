package authorizer

type Config struct {
	AccessSecretKey  string `mapstructure:"accessSecretKey"`
	RefreshSecretKey string `mapstructure:"refreshSecretKey"`
}
