package models

import (
	"database/sql"
	"time"

	"github.com/pkg/errors"
)

type Portion struct {
	ID        int
	ProductID int
	Unit      string
	Energy    float64
	Date      time.Time
}

func MigratePortions(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS portions (
			id SERIAL PRIMARY KEY, 
			product_id INTEGER REFERENCES products(id),  
			unit text NOT NULL
			energy decimal NOT NULL
			date DATE NOT NULL DEFAULT CURRENT_DATE		
		);
	`)
	defer rows.Close()
	return err
}

func CreatePortion(db *sql.DB, portion Portion) error {
	rows, err := db.Query(`
		INSERT INTO portions (product_id, unit, energy)
		VALUES ($1, $2, $3);
	`, portion.ProductID, portion.Unit, portion.Energy)
	defer rows.Close()
	return err
}

func GetPortion(db *sql.DB, id int) (*Portion, error) {
	rows, err := db.Query(`
		SELECT * FROM entries WHERE id = $1 
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	entries := []*Portion{}
	for rows.Next() {
		portion := &Portion{}
		rows.Scan(portion.ID, portion.ProductID, portion.Unit, portion.Energy, portion.Date)
		entries = append(entries, portion)
	}
	if len(entries) > 1 {
		return nil, errors.New("Two entries with the same id")
	}
	return entries[0], err
}

func GetProductsPortions(db *sql.DB, userID int, date time.Time) ([]*Portion, error) {
	rows, err := db.Query(`
		SELECT * FROM entries WHERE user_id=$1 
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	entries := []*Portion{}
	for rows.Next() {
		portion := &Portion{}
		rows.Scan(portion.ID, portion.ProductID, portion.Unit, portion.Energy, portion.Date)
		entries = append(entries, portion)
	}
	return entries, err

}

func DeletePortion(db *sql.DB, id int) error {
	rows, err := db.Query(`
		DELETE FROM entries WHERE id=$1 
	`, id)
	defer rows.Close()
	if err != nil {
		return errors.Wrap(err, "While deleting portion")
	}
	return nil
}

func UpdatePortion(db *sql.DB, id int, portion Portion) error {
	rows, err := db.Query(`
		UPDATE products SET user_id=$2, product_id=$3, quantity=$4 WHERE id=$1;
	`, id, portion.ProductID, portion.Unit, portion.Energy, portion.Date)
	defer rows.Close()
	if err != nil {
		return errors.Wrap(err, "While updating portion")
	}
	return nil
}
