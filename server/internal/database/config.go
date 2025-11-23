package database

type Config struct {
	DatabaseName string `mapstructure:"databaseName"`
	Username     string `mapstructure:"username"`
	Password     string `mapstructure:"password"`
	Host         string `mapstructure:"host"`
	Port         int    `mapstructure:"port"`
	SSLMode      bool   `mapstructure:"sslMode"`
}

type MigrationsConfig struct {
	ConnUri string `mapstructure:"connUri"`
	Enable  bool   `mapstructure:"enable"`
	DirUrl  string `mapstructure:"dirUrl"`
}
