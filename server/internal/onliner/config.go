package onliner

type Config struct {
	Address     string `mapstructure:"address"`
	Password    string `mapstructure:"password"`
	DatabaseNum int    `mapstructure:"databaseNum"`
}
