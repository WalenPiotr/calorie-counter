package handlers

import (
	"app/service/auth"
	"app/service/models"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

type Credentials struct {
	Password string `json:"password,omitempty"`
	Email    string `json:"email,omitempty"`
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

func CreateAccount(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		Credentials
	}
	type ResponseObject struct {
		Status int    `json:"status,omitempty"`
		Error  string `json:"error,omitempty"`
		Token  string `json:"token,omitempty"`
	}
	Send := func(res *ResponseObject, w http.ResponseWriter) {
		if res.Error != "" {
			logger.Error(res.Error)
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(res.Status)
		json.NewEncoder(w).Encode(*res)
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		cred := in.Credentials

		err = cred.Validate()
		if err != nil {
			err = errors.Wrap(err, "While validating acc data")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}

		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(cred.Password), bcrypt.DefaultCost)

		if err != nil {
			err = errors.Wrap(err, "While generating hash")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		acc := &models.Account{Email: cred.Email, Password: string(hashedBytes)}

		count, err := models.GetAccountsCount(db)
		if err != nil {
			err := errors.Wrap(err, "While fetching account count")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}

		if count == 0 {
			log.Println("CREATING ADMIN USER!")
			acc.AccessLevel = auth.Admin
		} else {
			acc.AccessLevel = auth.User
		}

		err = models.CreateAccount(db, acc)
		if err != nil {
			err := errors.Wrap(err, "While creating user")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}

		tokenPassword := os.Getenv("TOKEN_PASS")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel})
		tokenString, err := token.SignedString([]byte(tokenPassword))
		if err != nil {
			err := errors.Wrap(err, "While signing token")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		res := &ResponseObject{Status: http.StatusOK, Token: tokenString}
		Send(res, w)
		return
	})
}

func Authenticate(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		Credentials
	}
	type ResponseObject struct {
		Status int    `json:"status,omitempty"`
		Error  string `json:"error,omitempty"`
		Token  string `json:"token,omitempty"`
	}
	Send := func(res *ResponseObject, w http.ResponseWriter) {
		if res.Error != "" {
			logger.Error(res.Error)
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(res.Status)
		json.NewEncoder(w).Encode(*res)
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		cred := in.Credentials
		err = cred.Validate()
		if err != nil {
			err = errors.Wrap(err, "Invalid acc data")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}

		password := cred.Password
		email := cred.Email

		acc, err := models.GetAccountByEmail(db, email)
		if err != nil {
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(acc.Password), []byte(password))
		if err != nil { //Password does not match!
			if err == bcrypt.ErrMismatchedHashAndPassword {
				errors.Wrap(err, "Invalid login cred. Please try again")
				res := &ResponseObject{Error: err.Error()}
				Send(res, w)
				return
			}
			err = errors.Wrap(err, "While comparing hash and password")
			res := &ResponseObject{Error: err.Error()}
			Send(res, w)
			return
		}

		tokenPassword := os.Getenv("TOKEN_PASS")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel})
		tokenString, err := token.SignedString([]byte(tokenPassword))
		err = errors.Wrap(err, "While signing token")

		res := &ResponseObject{Status: http.StatusBadRequest, Token: tokenString}
		Send(res, w)
		return
	})
}

func GetUsers(db *sql.DB, logger *logrus.Logger) http.Handler {
	type User struct {
		ID          int              `json:"id,omitempty"`
		Email       string           `json:"email,omitempty"`
		AccessLevel auth.AccessLevel `json:"accessLevel,omitempty"`
	}
	type RequestObject struct {
		ID          uint             `json:"id,omitempty"`
		Email       string           `json:"email,omitempty"`
		AccessLevel auth.AccessLevel `json:"accessLevel,omitempty"`
	}
	type ResponseObject struct {
		Status int    `json:"status,omitempty"`
		Error  string `json:"error,omitempty"`
		Users  []User `json:"users,omitempty"`
	}
	Send := func(res *ResponseObject, w http.ResponseWriter) {
		if res.Error != "" {
			logger.Error(res.Error)
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(res.Status)
		json.NewEncoder(w).Encode(*res)
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}

		accs, err := models.GetAccounts(db)
		users := []User{}
		for _, acc := range *accs {
			user := User{ID: acc.ID, Email: acc.Email, AccessLevel: acc.AccessLevel}
			users = append(users, user)
		}

		res := &ResponseObject{Status: http.StatusOK, Users: users}
		Send(res, w)
		return

	})
}
