package main

import (
	"backend/internal/database"
	"backend/internal/routers"
	"log"
	"net/http"
)

func main() {
	db := database.DatabaseConnect()

	router := routers.InitRouter(db)


	server := &http.Server{
		Handler: router,
		Addr:    ":5000",
	}

	log.Fatal(server.ListenAndServe().Error())
}
