package models

import (
	"database/sql"

	"github.com/pkg/errors"
)

type Votes struct {
	ID        int `json:"id"`
	UserID    int `json:"user_id"`
	ProductID int `json:"product_id"`
	Value     int `json:"value"`
}

func MigrateVotes(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS products (
			id serial PRIMARY KEY,
			user_id integer REFERENCES accounts(id),
			product_id integer REFERENCES products(id),
			vote integer NOT NULL,
		);
	`)
	if err != nil {
		return errors.Wrap(err, "While creating votes table")
	}
	defer rows.Close()
	return nil
}

type Vote int

const (
	UpVote   Vote = -1
	DownVote Vote = 1
	None     Vote = 0
)

func RateProduct(db *sql.DB, userID, productID int, vote Vote) error {
	rows, err := db.Query(`
		INSERT INTO votes (user_id, product_id, vote)
		VALUES ($1, $2, $3)
		ON CONFLICT (a) DO UPDATE SET vote=$3
		RETURNING *;
	`, userID, productID, vote)
	if err != nil {
		return errors.Wrap(err, "While creating votes table")
	}
	defer rows.Close()
	return nil
}
