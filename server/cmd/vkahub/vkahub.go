package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"server/cmd"
	"server/internal/authorizer"
	"server/internal/database"
	"server/internal/routers"
	"syscall"
)

func main() {
	serviceConfig := cmd.Execute()

	ctx, cancel := context.WithCancel(context.Background())

	db := database.DatabaseConnect(
		&serviceConfig.Database,
		&serviceConfig.Migrations,
	)

	jwtService := authorizer.New(&serviceConfig.Authorizer)

	router := routers.InitRouter(db, jwtService)

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
