package models

import (
	"database/sql"

	"github.com/pkg/errors"
)

type Rating struct {
	UserID    int  `json:"userID"`
	ProductID int  `json:"productID"`
	Vote      Vote `json:"vote"`
}

func MigrateVotes(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS votes (
			user_id integer REFERENCES accounts(id),
			product_id integer REFERENCES products(id),
			vote integer NOT NULL,
			PRIMARY KEY (user_id, product_id)
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
		ON CONFLICT (user_id, product_id) DO UPDATE SET vote=$3
	`, userID, productID, vote)
	if err != nil {
		return errors.Wrap(err, "While creating votes table")
	}
	defer rows.Close()
	return nil
}

func GetProductVotes(db *sql.DB, productID int) ([]Rating, error) {
	rows, err := db.Query(`
		SELECT * FROM votes WHERE product_id=$1
	`, productID)
	if err != nil {
		return nil, errors.Wrap(err, "While creating votes table")
	}
	defer rows.Close()
	rates := []Rating{}
	for rows.Next() {
		rate := Rating{}
		err := rows.Scan(&rate.UserID, &rate.ProductID, &rate.Vote)
		if err != nil {
			return nil, err
		}
		rates = append(rates, rate)
	}
	return rates, nil
}
