package models

import (
	"app/service/auth"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"strings"

	"database/sql"

	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

// Account struct is used to represent user acc
type Account struct {
	ID             int              `json:"id"`
	Email          string           `json:"email"`
	Password       string           `json:"password"`
	AccessLevel    auth.AccessLevel `json:"accessLevel"`
	Verified       bool             `json:"verified"`
	ChangePassword bool             `json:"changePassword"`
}

func MigrateAccounts(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS accounts (
			id serial primary key, 
			email text unique, 
			password text, 
			access_level integer,
			verified boolean default false,
			change_password boolean default false
		);
	`)
	if err != nil {
		return errors.Wrap(err, "While creating accounts table")
	}
	defer rows.Close()
	f, err := ioutil.ReadFile("/tmp/seeds/accounts.json")
	if err != nil {
		return errors.Wrap(err, "While loading seed file")
	}
	var accs []Account
	err = json.Unmarshal(f, &accs)
	if err != nil {
		return errors.Wrap(err, "While parsing seed file")
	}
	fmt.Printf("%+v\n", accs)
	for _, acc := range accs {
		password := acc.Password
		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			err = errors.Wrap(err, "While generating hash")
		}
		rows, err := db.Query(`
		INSERT INTO accounts (email, password, access_level, verified)
		VALUES($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET 
		email=$1, password=$2, access_level=$3, verified=$4;
	`, strings.ToLower(acc.Email), string(hashedBytes), acc.AccessLevel, acc.Verified)
		if err != nil {
			return err
		}
		defer rows.Close()
	}
	return nil
}

func CreateAccount(db *sql.DB, acc *Account) error {

	rows, err := db.Query(`
		INSERT INTO accounts (email, password, access_level)
		VALUES($1, $2, $3);
	`, strings.ToLower(acc.Email), acc.Password, acc.AccessLevel)

	if err != nil {
		return err
	}
	defer rows.Close()
	return nil
}

func VerifyAccount(db *sql.DB, acc *Account) error {
	rows, err := db.Query(`
		UPDATE accounts 
		SET verified=true 
		WHERE id=$1 AND email=$2 AND access_level=$3 
	`, acc.ID, acc.Email, acc.AccessLevel)
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
		err := rows.Scan(&acc.ID, &acc.Email, &acc.Password, &acc.AccessLevel, &acc.Verified, &acc.ChangePassword)
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
	`, strings.ToLower(email))
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	accs := []Account{}
	for rows.Next() {
		acc := Account{}
		err := rows.Scan(&acc.ID, &acc.Email, &acc.Password, &acc.AccessLevel, &acc.Verified, &acc.ChangePassword)
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
		err := rows.Scan(&acc.ID, &acc.Email, &acc.Password, &acc.AccessLevel, &acc.Verified, &acc.ChangePassword)
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

func SearchAccounts(db *sql.DB, email string, pagination Pagination) (*[]Account, *Pagination, error) {
	rows, err := db.Query(`
		SELECT * FROM accounts WHERE email LIKE $1 ORDER BY email, id ASC LIMIT $2 OFFSET $3;;
	`, "%"+strings.ToLower(email)+"%", pagination.ItemsPerPage, pagination.ItemsPerPage*pagination.Page)
	defer rows.Close()
	if err != nil {
		return nil, nil, err
	}
	accs := []Account{}
	for rows.Next() {
		acc := Account{}
		err := rows.Scan(&acc.ID, &acc.Email, &acc.Password, &acc.AccessLevel, &acc.Verified, &acc.ChangePassword)
		if err != nil {
			return nil, nil, err
		}
		accs = append(accs, acc)
	}
	var count int
	row := db.QueryRow("SELECT COUNT(*) FROM accounts")
	err = row.Scan(&count)
	if err != nil {
		return nil, nil, err
	}
	maxPage := int(math.Ceil(float64(count)/float64(pagination.ItemsPerPage)) - 1)
	newPagination := Pagination{
		ItemsPerPage: pagination.ItemsPerPage,
		Page:         pagination.Page,
		MaxPage:      maxPage,
	}
	return &accs, &newPagination, nil
}

func ChangePasswordRequest(db *sql.DB, email string) error {
	rows, err := db.Query(`
		UPDATE accounts SET change_password=true WHERE email=$1;
	`, email)
	defer rows.Close()
	if err != nil {
		return err
	}
	return nil
}

func ChangePassword(db *sql.DB, email, password string) error {
	rows, err := db.Query(`
		UPDATE accounts SET password=$2, change_password=false WHERE email=$1;
	`, email, password)
	defer rows.Close()
	if err != nil {
		return err
	}
	return nil
}
