package service

import (
	"app/service/models"
	"fmt"
	"log"
	"os"
	"time"

	"database/sql"

	_ "github.com/lib/pq"
	"github.com/pkg/errors"
)

func NewDBConnection() (*sql.DB, error) {
	host := os.Getenv("PG_HOST")
	port := os.Getenv("PG_PORT")
	user := os.Getenv("PG_USER")
	name := os.Getenv("PG_DB")
	pass := os.Getenv("PG_PASS")

	URI := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable ", host, port, user, name, pass)
	log.Println(URI)

	//STARTUP DELAY FOR DB
	time.Sleep(4 * time.Second)
	
	db, err := sql.Open("postgres", URI)
	if err != nil {
		return nil, errors.Wrap(err, "While opening connection to db")
	}
	err = models.MigrateAccounts(db)
	if err != nil {
		return nil, errors.Wrap(err, "While migrating accounts table")
	}
	err = models.MigrateProducts(db)
	if err != nil {
		return nil, errors.Wrap(err, "While migrating produts table")
	}
	err = models.MigratePortions(db)
	if err != nil {
		return nil, errors.Wrap(err, "While migration portions table")
	}

	return db, nil
}
