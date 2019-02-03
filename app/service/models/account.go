package models

import (
	"app/service/auth"

	"database/sql"

	"github.com/pkg/errors"
)

// Account struct is used to represent user acc
type Account struct {
	ID          int
	Email       string
	Password    string
	AccessLevel auth.AccessLevel
}

func MigrateAccounts(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS accounts (
			id serial primary key, 
			email text unique, 
			password text, 
			access_level integer
		);
	`)
	if err != nil {
		return errors.Wrap(err, "While creating accounts table")
	}
	defer rows.Close()
	return nil
}

func CreateAccount(db *sql.DB, acc *Account) error {
	rows, err := db.Query(`
		INSERT INTO accounts (email, password, access_level)
		VALUES($1, $2, $3);
	`, acc.Email, acc.Password, acc.AccessLevel)
	if err != nil {
		return err
	}
	defer rows.Close()
	return nil
}

func GetAccountById(db *sql.DB, id int) (*Account, error) {
	rows, err := db.Query(`
		SELECT * FROM accounts WHERE id=$1;
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	accs := []Account{}
	for rows.Next() {
		acc := Account{}
		err := rows.Scan(&acc.ID, &acc.Email, &acc.Password, &acc.AccessLevel)
		if err != nil {
			return nil, err
		}
		accs = append(accs, acc)
	}
	if len(accs) == 0 {
		return nil, errors.New("Account not found")
	}
	if len(accs) != 1 {
		return nil, errors.New("Duplicate accounts with same id in db")
	}
	return &accs[0], nil
}

func GetAccountByEmail(db *sql.DB, email string) (*Account, error) {
	rows, err := db.Query(`
		SELECT * FROM accounts WHERE email=$1;
	`, email)
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	accs := []Account{}
	for rows.Next() {
		acc := Account{}
		err := rows.Scan(&acc.ID, &acc.Email, &acc.Password, &acc.AccessLevel)
		if err != nil {
			return nil, err
		}
		accs = append(accs, acc)
	}
	if len(accs) == 0 {
		return nil, errors.New("Account not found")
	}
	if len(accs) != 1 {
		return nil, errors.New("Duplicate account with same emails in db")
	}
	return &accs[0], nil
}

func GetAccounts(db *sql.DB) (*[]Account, error) {
	rows, err := db.Query(`
		SELECT * FROM accounts;
	`)
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	accs := []Account{}
	for rows.Next() {
		acc := Account{}
		err := rows.Scan(&acc.ID, &acc.Email, &acc.Password, &acc.AccessLevel)
		if err != nil {
			return nil, err
		}
		accs = append(accs, acc)
	}
	return &accs, nil
}
func GetAccountsCount(db *sql.DB) (int, error) {
	var count int
	rows, err := db.Query("SELECT COUNT(*) FROM accounts")
	if err != nil {
		return -1, errors.Wrap(err, "While querying for account count")
	}
	if rows.Next() {
		err = rows.Scan(&count)
		if err != nil {
			return -1, errors.Wrap(err, "While scaning account count")
		}
	} else {
		return -1, errors.New("No next row")
	}
	return count, nil
}

func SetAccessLevel(db *sql.DB, id int, accessLevel auth.AccessLevel) error {
	rows, err := db.Query(`
		UPDATE accounts SET access_level=$2 WHERE id=$1;
	`, id, accessLevel)
	defer rows.Close()
	return err
}
