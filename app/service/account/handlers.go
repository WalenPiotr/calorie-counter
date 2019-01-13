package account

import (
	"app/service/auth"
	"encoding/json"
	"log"
	"net/http"

	"os"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

type Credentials struct {
	Password string `json:"password,omitempty"`
	Email    string `json:"email,omitempty"`
}

type User struct {
	ID          uint             `json:"id,omitempty"`
	AccessLevel auth.AccessLevel `json:"accessLevel,omitempty"`
}

func (cred *Credentials) Validate() error {
	if !strings.Contains(cred.Email, "@") {
		return errors.New("Invalid email format")
	}
	if len(cred.Password) < 8 {
		return errors.New("Password is too short")
	}
	return nil
}

type InputObject struct {
	Credentials Credentials `json:"cred,omitempty"`
	User        User        `json:"user,omitempty"`
}

type ResponseObject struct {
	Status int    `json:"status,omitempty"`
	Error  string `json:"error,omitempty"`
	Token  string `json:"token,omitempty"`
}

func (res *ResponseObject) Send(w http.ResponseWriter) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(res.Status)
	json.NewEncoder(w).Encode(*res)
}

func CreateAccount(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &InputObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}
		cred := in.Credentials

		err = cred.Validate()
		if err != nil {
			err = errors.Wrap(err, "While validating acc data")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		hashed, err := bcrypt.GenerateFromPassword([]byte(cred.Password), bcrypt.DefaultCost)

		if err != nil {
			err = errors.Wrap(err, "While generating hash")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		acc := &Account{Email: cred.Email, Password: string(hashed)}

		var count int
		db.Model(&Account{}).Count(&count)
		if count == 0 {
			log.Println("CREATING ADMIN USER!")
			acc.AccessLevel = auth.Admin
		} else {
			acc.AccessLevel = auth.User
		}

		//Email must be unique
		var users []Account
		err = db.Where("email = ?", acc.Email).Find(&users).Error
		if err != nil {
			err := errors.Wrap(err, "While searching for acc")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		if len(users) > 0 {
			err := errors.New("Email address already in use")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		err = db.Create(acc).Error
		if err != nil {
			err := errors.Wrap(err, "While creating user")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		tokenPassword := os.Getenv("TOKEN_PASS")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel})
		tokenString, err := token.SignedString([]byte(tokenPassword))
		if err != nil {
			err := errors.Wrap(err, "While signing token")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		res := &ResponseObject{Status: http.StatusOK, Token: tokenString}
		res.Send(w)
		return
	})
}

func Authenticate(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &InputObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		cred := in.Credentials
		err = cred.Validate()
		if err != nil {
			err = errors.Wrap(err, "Invalid acc data")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		password := cred.Password
		email := cred.Email

		acc := &Account{}
		err = db.Where("email = ?", email).First(acc).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				err = errors.Wrap(err, "Email adress not found")
				logger.Error(err)
				res := &ResponseObject{Error: err.Error()}
				res.Send(w)
				return
			}
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(acc.Password), []byte(password))
		if err != nil { //Password does not match!
			if err == bcrypt.ErrMismatchedHashAndPassword {
				err = errors.Wrap(err, "Email adress not found")
				logger.Error(err)
				res := &ResponseObject{Error: err.Error()}
				res.Send(w)
				errors.Wrap(err, "Invalid login cred. Please try again")
			}
			err = errors.Wrap(err, "While comparing hash and password")
			logger.Error(err)
			res := &ResponseObject{Error: err.Error()}
			res.Send(w)
		}

		tokenPassword := os.Getenv("TOKEN_PASS")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel})
		tokenString, err := token.SignedString([]byte(tokenPassword))
		err = errors.Wrap(err, "While signing token")

		res := &ResponseObject{Status: http.StatusBadRequest, Token: tokenString}
		res.Send(w)
		return
	})
}
