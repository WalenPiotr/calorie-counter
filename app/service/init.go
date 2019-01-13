package service

import (
	"app/service/models"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/pkg/errors"
)

func NewDBConnection() (*gorm.DB, error) {
	host := os.Getenv("PG_HOST")
	port := os.Getenv("PG_PORT")
	user := os.Getenv("PG_USER")
	name := os.Getenv("PG_DB")
	pass := os.Getenv("PG_PASS")

	URI := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable ", host, port, user, name, pass)
	log.Println(URI)
	time.Sleep(4 * time.Second)
	db, err := gorm.Open("postgres", URI)
	if err != nil {
		return nil, errors.Wrap(err, "While opening connection to db")
	}
	db.Debug().AutoMigrate(&models.Account{}, &models.Product{})
	return db, nil
}
