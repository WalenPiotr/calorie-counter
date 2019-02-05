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
	logger.SetLevel(logrus.DebugLevel)
	db, err := NewDBConnection()
	if err != nil {
		return errors.Wrap(err, "While connecting to db")
	}
	defer db.Close()
	router := mux.NewRouter()

	router.Use(middleware.WithCors)
	router.Use(middleware.WithTracing)

	router.Handle("/api/user/new", middleware.WithAuth(
		handlers.CreateAccount(db, logger), db, auth.Default))
	router.Handle("/api/user/login", middleware.WithAuth(
		handlers.Authenticate(db, logger), db, auth.Default))

	router.Handle("/api/user/ban", middleware.WithAuth(
		handlers.BanUser(db, logger), db, auth.Moderator))
	router.Handle("/api/user/unban", middleware.WithAuth(
		handlers.UnbanUser(db, logger), db, auth.Moderator))
	router.Handle("/api/user/search", middleware.WithAuth(
		handlers.SearchUsers(db, logger), db, auth.Moderator))
	router.Handle("/api/user/products", middleware.WithAuth(
		handlers.GetUsersAddedProducts(db, logger), db, auth.Moderator))

	router.Handle("/api/user/priviledges", middleware.WithAuth(
		handlers.SetAccessLevel(db, logger), db, auth.Admin))

	router.Handle("/api/user/entries/create", middleware.WithAuth(
		handlers.CreateEntry(db, logger), db, auth.User))
	router.Handle("/api/user/entries/view", middleware.WithAuth(
		handlers.GetUsersEntries(db, logger), db, auth.User))
	router.Handle("/api/user/entries/delete", middleware.WithAuth(
		handlers.DeleteEntry(db, logger), db, auth.User))
	router.Handle("/api/user/entries/update", middleware.WithAuth(
		handlers.UpdateEntry(db, logger), db, auth.User))
	router.Handle("/api/user/entries/dates", middleware.WithAuth(
		handlers.GetUsersDatesWithEntries(db, logger), db, auth.User))

	router.Handle("/api/product/new", middleware.WithAuth(
		handlers.CreateProduct(db, logger), db, auth.User))
	router.Handle("/api/product/view", middleware.WithAuth(
		handlers.GetProduct(db, logger), db, auth.User))
	router.Handle("/api/product/search", middleware.WithAuth(
		handlers.SearchProduct(db, logger), db, auth.User))
	router.Handle("/api/product/rate", middleware.WithAuth(
		handlers.RateProduct(db, logger), db, auth.User))

	router.Handle("/api/product/delete", middleware.WithAuth(
		handlers.DeleteProduct(db, logger), db, auth.Moderator))
	router.Handle("/api/product/update", middleware.WithAuth(
		handlers.UpdateProduct(db, logger), db, auth.Moderator))

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))

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
