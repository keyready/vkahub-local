package main

import (
	"backend/internal/database"
	"backend/internal/routers"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/unidoc/unioffice/v2/common/license"
)

func init() {
	err := license.SetMeteredKey("6eb35b7dd3c4f49361b6f0f5805d96f1c69490ef4e36ce9e3f1311ffce09c122")
	if err != nil {
		log.Fatalf(err.Error())
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())

	db := database.DatabaseConnect()

	router := routers.InitRouter(db)

	go awaitSystemSignals(cancel)

	httpServer := &http.Server{
		Handler: router,
		Addr:    ":5000",
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
