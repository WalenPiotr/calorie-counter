package service

import (
	"app/service/auth"
	"app/service/controllers"
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

	router.Handle("/api/user/new", auth.WithAuth(controllers.CreateAccount(db, logger), auth.Default)).Methods("POST")
	router.Handle("/api/user/login", auth.WithAuth(controllers.Authenticate(db, logger), auth.Default)).Methods("POST")
	router.Handle("/api/user/update", auth.WithAuth(controllers.UpdateUser(db, logger), auth.Admin)).Methods("POST")
	router.Handle("/api/user/delete", auth.WithAuth(controllers.DeleteUser(db, logger), auth.Admin)).Methods("POST")

	router.Handle("/api/product/create", auth.WithAuth(controllers.CreateProduct(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/get", auth.WithAuth(controllers.GetProducts(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/delete", auth.WithAuth(controllers.DeleteProduct(db, logger), auth.Moderator)).Methods("POST")
	router.Handle("/api/product/update", auth.WithAuth(controllers.GetProducts(db, logger), auth.Moderator)).Methods("POST")

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
