package broker

import "context"

type Broker struct {
	Broker IBroker
}

type IBroker interface {
	IPublisher
	IConsumer
	IExchange
	IQueue
}

type IPublisher interface {
	Publish(_ context.Context, msg Message) error
}

type IConsumer interface {
	Consume(_ context.Context) error
	StopConsuming(_ context.Context) error
	GetConsumerChannel() chan Message
}

type IExchange interface {
	CreateExchange(name string) error
}

type IQueue interface {
	CreateQueue(exchange, queue, routingKey string) error
}
