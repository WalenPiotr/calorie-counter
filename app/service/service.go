package service

import (
	"app/service/account"
	"app/service/product"

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

	router.Handle("/api/user/new", auth.WithAuth(account.CreateAccount(db, logger), auth.Default)).Methods("POST")
	router.Handle("/api/user/login", auth.WithAuth(account.Authenticate(db, logger), auth.Default)).Methods("POST")

	router.Handle("/api/product/create", auth.WithAuth(product.CreateProduct(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/get", auth.WithAuth(product.GetProducts(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/delete", auth.WithAuth(product.DeleteProduct(db, logger), auth.Moderator)).Methods("POST")
	router.Handle("/api/product/update", auth.WithAuth(product.GetProducts(db, logger), auth.Moderator)).Methods("POST")

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
