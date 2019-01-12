package models

import (
	"app/service/auth"
	"os"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

// Model struct is used to override gorm.Model tags
type Model struct {
	ID        uint `gorm:"primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`
}

// Account struct is used to represent user account
type Account struct {
	Model
	Email       string           `json:"email"`
	Password    string           `json:"password"`
	Token       string           `json:"token" sql:"-"`
	AccessLevel auth.AccessLevel `json:"-"`
}

func (account *Account) Validate() error {
	if !strings.Contains(account.Email, "@") {
		return errors.New("Invalid email format")
	}
	if len(account.Password) < 8 {
		return errors.New("Password is too short")
	}
	return nil
}

func (account *Account) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.Wrap(err, "While hashing password")
	}
	account.Password = string(hashedPassword)
	return nil
}

func (account *Account) ComparePassword(password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(password))
	if err != nil { //Password does not match!
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return errors.Wrap(err, "Invalid login credentials. Please try again")
		}
		return errors.Wrap(err, "While comparing hash and password")
	}
	return nil
}

func (account *Account) SignToken() error {
	tokenPassword := os.Getenv("TOKEN_PASS")
	token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
		&auth.Token{UserID: account.ID, AccessLevel: account.AccessLevel})
	tokenString, err := token.SignedString([]byte(tokenPassword))
	if err != nil {
		return errors.Wrap(err, "While signing token")
	}
	account.Password = ""
	account.Token = tokenString //Store the token in the response
	return nil
}
