package service

import (
	"app/service/auth"
	"app/service/controllers"
	"app/service/models"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func NewService() error {
	logger := logrus.New()
	db, err := models.NewConnection()
	if err != nil {
		return err
	}
	defer db.Close()

	if err != nil {
		return errors.Wrap(err, "While connecting to db")
	}

	router := mux.NewRouter()
	router.HandleFunc("/api/user/new", controllers.CreateAccount(db, logger)).Methods("POST")
	router.HandleFunc("/api/user/login", controllers.Authenticate(db, logger)).Methods("POST")
	router.Use(auth.JwtAuthentication)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	err = http.ListenAndServe(":"+port, router)
	if err != nil {
		return err
	}
	return nil
}
