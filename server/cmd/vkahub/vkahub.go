package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"server/cmd"
	"server/internal/database"
	"server/internal/routers"
	"syscall"
)

// func init() { //TODO - unioffice
// 	err := license.SetMeteredKey("6eb35b7dd3c4f49361b6f0f5805d96f1c69490ef4e36ce9e3f1311ffce09c122")
// 	if err != nil {
// 		log.Fatalf(err.Error())
// 	}
// }

func main() {
	serviceConfig := cmd.Execute()

	ctx, cancel := context.WithCancel(context.Background())

	db := database.DatabaseConnect(&serviceConfig.Database)

	router := routers.InitRouter(db)

	go awaitSystemSignals(cancel)

	httpServer := &http.Server{
		Handler: router,
		Addr:    fmt.Sprintf(":%d", 5000),
	}

	go func() {
		err := httpServer.ListenAndServe()
		if err != nil {
			log.Println(err)
			cancel()
		}
	}()

	<-ctx.Done()
	cancel()
	shutdownServices(ctx, httpServer)
}

func awaitSystemSignals(cancel context.CancelFunc) {
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)
	<-ch
	cancel()
}

func shutdownServices(ctx context.Context, httpServer *http.Server) {
	if err := httpServer.Shutdown(ctx); err != nil {
		log.Fatalln(err)
	}
}
