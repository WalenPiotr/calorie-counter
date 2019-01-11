package models

import (
	"os"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

type Token struct {
	UserID uint
	jwt.StandardClaims
}

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
	Email    string `json:"email"`
	Password string `json:"password"`
	Token    string `json:"token";sql:"-"`
}

func (account *Account) Create(db *gorm.DB) error {
	if !strings.Contains(account.Email, "@") {
		return errors.New("Invalid email format")
	}
	if len(account.Password) < 8 {
		return errors.New("Password is too short")
	}
	//Email must be unique
	var users []Account
	err := db.Where("email = ?", account.Email).Find(&users).Error
	if err != nil {
		return errors.Wrap(err, "While searching for account")
	}
	if len(users) > 0 {
		return errors.New("Email address already in use")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.Wrap(err, "While hashing password")
	}
	account.Password = string(hashedPassword)
	db.Create(account)
	account.signToken()
	return nil
}

func (account *Account) Login(db *gorm.DB) error {
	password := account.Password
	email := account.Email
	err := db.Where("email = ?", email).First(account).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.Wrap(err, "Email adress not found")
		}
		return err
	}

	err = bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(password))
	if err != nil { //Password does not match!
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return errors.Wrap(err, "Invalid login credentials. Please try again")
		}
		return errors.Wrap(err, "While comparing hash and password")
	}
	account.signToken()
	return nil
}

func (account *Account) signToken() error {
	tokenPassword := os.Getenv("TOKEN_PASS")
	token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"), &Token{UserID: account.ID})
	tokenString, err := token.SignedString([]byte(tokenPassword))
	if err != nil {
		return errors.Wrap(err, "While signing token")
	}
	account.Password = ""
	account.Token = tokenString //Store the token in the response
	return nil
}
