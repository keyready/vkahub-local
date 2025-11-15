package main

import (
	"backend/internal/database"
	"backend/internal/routers"
	"log"
	"net/http"

	"github.com/unidoc/unioffice/v2/common/license"
)

func init() {
	err := license.SetMeteredKey("6eb35b7dd3c4f49361b6f0f5805d96f1c69490ef4e36ce9e3f1311ffce09c122")
	if err != nil {
		log.Fatalf(err.Error())
	}
}

func main() {

	db := database.DatabaseConnect()

	router := routers.InitRouter(db)
	
	server := &http.Server{
		Handler: router,
		Addr:    ":5000",
	}

	log.Fatal(server.ListenAndServe().Error())
}
