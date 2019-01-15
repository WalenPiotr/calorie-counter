package service

import (
	"app/service/handlers"
	"app/service/middleware"

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
		return errors.Wrap(err, "While connecting to db")
	}
	defer db.Close()
	router := mux.NewRouter()

	router.Handle("/api/user/new", middleware.WithAuth(
		handlers.CreateAccount(db, logger), auth.Default)).Methods("POST")
	router.Handle("/api/user/login", middleware.WithAuth(
		handlers.Authenticate(db, logger), auth.Default)).Methods("POST")
	router.Handle("/api/user/all", middleware.WithAuth(
		handlers.GetUsers(db, logger), auth.Moderator)).Methods("POST")
	router.Handle("/api/user/created-products", middleware.WithAuth(
		handlers.GetUsersCreatedProducts(db, logger), auth.Default)).Methods("POST")

	router.Handle("/api/product/new", middleware.WithAuth(
		handlers.CreateProduct(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/view", middleware.WithAuth(
		handlers.GetProduct(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/all", middleware.WithAuth(
		handlers.GetProducts(db, logger), auth.User)).Methods("POST")
	router.Handle("/api/product/update", middleware.WithAuth(
		handlers.UpdateProduct(db, logger), auth.Moderator)).Methods("POST")
	router.Handle("/api/product/delete", middleware.WithAuth(
		handlers.DeleteProduct(db, logger), auth.Moderator)).Methods("POST")

	router.Use(middleware.WithTracing)

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
