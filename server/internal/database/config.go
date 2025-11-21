package database

type Config struct {
	DatabaseName string `mapstrucuture:"databaseName"`
	Username     string `mapstrucuture:"username"`
	Password     string `mapstrucuture:"password"`
	Host         string `mapstrucuture:"host"`
	Port         int    `mapstrucuture:"port"`
	SSLMode      bool   `mapstrucuture:"sslMode"`
}
