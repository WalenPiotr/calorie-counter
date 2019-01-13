package service

import (
	"app/service/handlers"

	"app/service/auth"

	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func NewService() error {
	logger := logrus.New()
	db, err := NewDBConnection()
	if err != nil {
		return err
	}
	defer db.Close()

	if err != nil {
		return errors.Wrap(err, "While connecting to db")
	}

	router := mux.NewRouter()

	router.Handle("/api/user/new", auth.WithAuth(handlers.CreateAccount(db, logger), auth.Default)).Methods("POST")
	router.Handle("/api/user/login", auth.WithAuth(handlers.Authenticate(db, logger), auth.Default)).Methods("POST")
	router.Handle("/api/user/all", auth.WithAuth(handlers.GetUsers(db, logger), auth.Moderator)).Methods("POST")
	router.Handle("/api/user/ban", auth.WithAuth(handlers.Ban(db, logger), auth.Moderator)).Methods("POST")
	router.Handle("/api/user/unban", auth.WithAuth(handlers.Unban(db, logger), auth.Moderator)).Methods("POST")
	router.Handle("/api/user/permissions", auth.WithAuth(handlers.SetAccessLevel(db, logger), auth.Admin)).Methods("POST")

	router.Handle("/api/product/create", auth.WithAuth(handlers.CreateProduct(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/get", auth.WithAuth(handlers.GetProducts(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/delete", auth.WithAuth(handlers.DeleteProduct(db, logger), auth.Moderator)).Methods("POST")
	router.Handle("/api/product/update", auth.WithAuth(handlers.GetProducts(db, logger), auth.Moderator)).Methods("POST")

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
