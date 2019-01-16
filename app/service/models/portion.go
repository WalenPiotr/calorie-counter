package models

import (
	"database/sql"

	"github.com/pkg/errors"
)

type Portion struct {
	ID        int     `json:"id"`
	ProductID int     `json:"productID"`
	Unit      string  `json:"unit"`
	Energy    float64 `json:"energy"`
}

func (portion *Portion) scanRows(rows *sql.Rows) error {
	return rows.Scan(&portion.ID, &portion.ProductID, &portion.Unit, &portion.Energy)
}

func MigratePortions(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS portions (
			id SERIAL PRIMARY KEY, 
			product_id INTEGER REFERENCES products(id),  
			unit text NOT NULL,
			energy decimal NOT NULL
		);
	`)
	defer rows.Close()
	return err
}

func CreatePortion(db *sql.DB, portion Portion) (*Portion, error) {
	rows, err := db.Query(`
		INSERT INTO portions (product_id, unit, energy)
		VALUES ($1, $2, $3)
		RETURNING *;
	`, portion.ProductID, portion.Unit, portion.Energy)
	if err != nil {
		return nil, errors.Wrap(err, "Invalid insert operation")
	}
	defer rows.Close()
	portions := []Portion{}
	for rows.Next() {
		portion := Portion{}
		portion.scanRows(rows)
		if err != nil {
			return nil, err
		}
		portions = append(portions, portion)
	}
	if len(portions) != 1 {
		return nil, errors.New("Invalid return of insert operation")
	}
	return &portions[0], err
}

func GetPortion(db *sql.DB, id int) (*Portion, error) {
	rows, err := db.Query(`
		SELECT * FROM portions WHERE id = $1 
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	portions := []*Portion{}
	for rows.Next() {
		portion := &Portion{}
		portion.scanRows(rows)
		portions = append(portions, portion)
	}
	if len(portions) > 1 {
		return nil, errors.New("Two portions with the same id")
	}
	return portions[0], err
}

func GetProductsPortions(db *sql.DB, userID int) ([]*Portion, error) {
	rows, err := db.Query(`
		SELECT * FROM portions WHERE user_id=$1 
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	portions := []*Portion{}
	for rows.Next() {
		portion := &Portion{}
		portion.scanRows(rows)
		portions = append(portions, portion)
	}
	return portions, err

}

func DeletePortion(db *sql.DB, id int) error {
	rows, err := db.Query(`
		DELETE FROM portions WHERE id=$1 
	`, id)
	defer rows.Close()
	if err != nil {
		return errors.Wrap(err, "While deleting portion")
	}
	return nil
}

