package models

import (
	"os"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

type Token struct {
	UserId uint
	jwt.StandardClaims
}

//a struct to rep user account
type Account struct {
	gorm.Model
	Email    string `json:"email"`
	Password string `json:"password"`
	Token    string `json:"token";sql:"-"`
}

func (account *Account) Create(db *gorm.DB) error {
	if !strings.Contains(account.Email, "@") {
		return errors.New("Invalid email format")
	}
	if len(account.Password) < 6 {
		return errors.New("Password is too short")
	}
	//Email must be unique
	temp := &Account{}

	//check for errors and duplicate emails
	err := db.Table("accounts").Where("email = ?", account.Email).First(temp).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return errors.Wrap(err, "While searching for account")
	}
	if temp.Email != "" {
		return errors.New("Email address already in use")
	}
	return nil
}

func (account *Account) Login(db *gorm.DB) error {
	tokenPassword := os.Getenv("TOKEN_PASS")
	dbAccount := &Account{}
	err := db.Table("accounts").Where("email = ?", account.Email).First(dbAccount).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.Wrap(err, "Email adress not found")
		}
		return err
	}
	err = bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(account.Password))
	if err != nil { //Password does not match!
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return errors.Wrap(err, "Invalid login credentials. Please try again")
		}
		return errors.Wrap(err, "While comparing hash and password")
	}
	account.Password = ""
	token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"), &Token{UserId: account.ID})
	tokenString, err := token.SignedString([]byte(tokenPassword))
	if err != nil {
		return errors.Wrap(err, "While signing token")
	}
	account.Token = tokenString //Store the token in the response
	return nil
}
