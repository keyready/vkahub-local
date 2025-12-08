package broker

type Config struct {
	Address    string `mapstructure:"address"`
	Exchange   string `mapstructure:"exchange"`
	RoutingKey string `mapstructure:"routingKey"`
	QueueName  string `mapstructure:"queue"`
}
