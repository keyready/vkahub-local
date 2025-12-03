package cloud

type Config struct {
	Address    string `mapstructure:"address"`
	Username   string `mapstructure:"username"`
	Password   string `mapstructure:"password"`
	EnableSSL  bool   `mapstructure:"enableSSL"`
	InitBucket string `mapstructure:"initBucket"`
}
