package broker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const ConsumerName = "consumer-name" //TODO Имя консумера

type RabbitMQ struct {
	conn     *amqp.Connection
	channel  *amqp.Channel
	config   *Config
	redirect chan Message
	done     chan error
}

func New(cfg *Config) (*Broker, error) {
	rmqConfig := amqp.Config{
		Properties: amqp.NewConnectionProperties(),
		Heartbeat:  10 * time.Second,
	}
	rmqConfig.Properties.SetClientConnectionName(ConsumerName)

	conn, err := amqp.DialConfig(cfg.Address, rmqConfig)
	if err != nil {
		return nil, fmt.Errorf("failed while connection to rmq: %w", err)
	}

	rmqCh, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to create rmq channel: %w", err)
	}

	client := &RabbitMQ{
		conn:     conn,
		channel:  rmqCh,
		config:   cfg,
		redirect: make(chan Message),
		done:     make(chan error),
	}

	return &Broker{
		Broker: client,
	}, nil
}

func (r *RabbitMQ) GetConsumerChannel() chan Message {
	return r.redirect
}

func (r *RabbitMQ) Publish(_ context.Context, msg Message) error {
	body, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed while marshalling rmq body: %w", err)
	}

	err = r.channel.Publish(
		r.config.Exchange,
		r.config.RoutingKey,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)

	if err != nil {
		return fmt.Errorf("failed while publishing rmq message: %w", err)
	}

	return nil
}

func (r *RabbitMQ) Consume(_ context.Context) error {
	go r.handleReconnect()

	deliveries, err := r.channel.Consume(
		r.config.QueueName, // name
		ConsumerName,       // consumerTag,
		true,               // autoAck
		false,              // exclusive
		false,              // noLocal
		false,              // noWait
		nil,                // arguments
	)

	if err != nil {
		return fmt.Errorf("failed to init rmq consumer: %w", err)
	}

	go r.handle(deliveries, r.done)

	return nil
}

func (r *RabbitMQ) StopConsuming(_ context.Context) error {
	if err := r.channel.Cancel(ConsumerName, true); err != nil {
		return fmt.Errorf("consumer cancel failed: %w", err)
	}

	if err := r.conn.Close(); err != nil {
		return fmt.Errorf("amqp connection close error: %w", err)
	}

	// wait for handle() to exit
	return <-r.done
}

func (r *RabbitMQ) CreateExchange(name string) error {
	err := r.channel.ExchangeDeclare(name, "direct", true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed while declaring exchange: %w", err)
	}

	return nil
}

func (r *RabbitMQ) CreateQueue(exchange, queue, routingKey string) error {
	_, err := r.channel.QueueDeclare(queue, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("failed while declaring queue: %w", err)
	}

	err = r.channel.QueueBind(queue, routingKey, exchange, false, nil)
	if err != nil {
		return fmt.Errorf("failed while binding queue: %w", err)
	}

	return nil
}

func (r *RabbitMQ) handle(deliveries <-chan amqp.Delivery, done chan error) {
	cleanup := func() {
		log.Printf("handle: deliveries channel closed")
		done <- nil
	}

	defer cleanup()

	for delMsg := range deliveries {
		msg := &Message{}
		_ = json.Unmarshal(delMsg.Body, msg)
		r.redirect <- *msg
	}
}

func (r *RabbitMQ) handleReconnect() {
	for {
		select {
		case <-r.done:
			return

		case <-r.conn.NotifyClose(make(chan *amqp.Error)):
			log.Println("Attempting to reconnect...")

			rmqConfig := amqp.Config{
				Properties: amqp.NewConnectionProperties(),
				Heartbeat:  10 * time.Second,
			}

			rmqConfig.Properties.SetClientConnectionName("ConsumerName") //T

			var err error
			for reconnCounter := 0; reconnCounter < 5; reconnCounter++ {
				r.conn, err = amqp.DialConfig(r.config.Address, rmqConfig)
				if err != nil {
					log.Printf("failed while re-connecting to rmq: %v", err)
					return
				}

				r.channel, err = r.conn.Channel()
				if err == nil {
					log.Printf("connection to rmq has been returned!")
					break
				}

				log.Printf("failed to create rmq channel: %v", err)
				time.Sleep(time.Duration(reconnCounter*reconnCounter) * time.Second)
			}

			if err != nil {
				log.Println("Failed to reconnect to RabbitMQ")
				return
			}
		}
	}
}
