package models

import (
	"database/sql"
	"time"

	"github.com/pkg/errors"
)

// Account struct is used to represent user acc
type Entry struct {
	ID        int       `json:"id"`
	UserID    int       `json:"userID"`
	ProductID int       `json:"productID"`
	PortionID int       `json:"portionID"`
	Quantity  float64   `json:"quantity"`
	Date      time.Time `json:"date"`
}

func (entry *Entry) scanRow(rows *sql.Rows) error {
	err := rows.Scan(
		&entry.ID,
		&entry.UserID,
		&entry.ProductID,
		&entry.PortionID,
		&entry.Quantity,
		&entry.Date,
	)
	if err != nil {
		return errors.Wrap(err, "While scaning row")
	}
	return err
}

func MigrateEntries(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS entries (
			id SERIAL PRIMARY KEY, 
			user_id INTEGER REFERENCES accounts(id),
			product_id INTEGER REFERENCES products(id),
			portion_id INTEGER REFERENCES portions(id),  
			quantity DECIMAL,
			date DATE NOT NULL DEFAULT CURRENT_DATE
		);
	`)
	if err != nil {
		return err
	}
	defer rows.Close()
	return nil
}

func CreateEntry(db *sql.DB, entry *Entry) (*Entry, error) {
	rows, err := db.Query(`
		INSERT INTO entries (user_id, product_id, portion_id, quantity, date)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *;
	`, entry.UserID, entry.ProductID, entry.PortionID, entry.Quantity, entry.Date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	entries := []*Entry{}
	for rows.Next() {
		entry := &Entry{}
		err := entry.scanRow(rows)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}
	if len(entries) > 1 {
		return nil, errors.New("Two entries with the same id")
	}
	return entries[0], err
}

func GetEntry(db *sql.DB, id int) (*Entry, error) {
	rows, err := db.Query(`
		SELECT * FROM entries WHERE id = $1
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	entries := []*Entry{}
	for rows.Next() {
		entry := &Entry{}
		err := entry.scanRow(rows)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}
	if len(entries) > 1 {
		return nil, errors.New("Two entries with the same id")
	}
	return entries[0], err
}

func GetUsersEntries(db *sql.DB, userID int) (*[]Entry, error) {
	rows, err := db.Query(`
		SELECT * FROM entries WHERE user_id=$1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	entries := []Entry{}
	for rows.Next() {
		entry := &Entry{}
		err := entry.scanRow(rows)
		if err != nil {
			return nil, err
		}
		entries = append(entries, *entry)
	}
	return &entries, err

}

func DeleteEntry(db *sql.DB, id int) error {
	rows, err := db.Query(`
		DELETE FROM entries WHERE id=$1 
	`, id)
	if err != nil {
		return errors.Wrap(err, "While deleting entry")
	}
	defer rows.Close()
	return nil
}

func UpdateEntry(db *sql.DB, id int, new *Entry) error {
	rows, err := db.Query(`
		UPDATE products SET user_id=$2, product_id=$3, quantity=$4, date=$5 WHERE id=$1;
	`, id, new.UserID, new.ProductID, new.Quantity, new.Date)
	if err != nil {
		return errors.Wrap(err, "While updating entry")
	}
	defer rows.Close()
	return nil
}
