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
		Error string `json:"error,omitempty"`
		Token string `json:"token,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While creating account")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, token string) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Token: token,
		}
		json.NewEncoder(w).Encode(out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		cred := in.Credentials
		err = cred.Validate()
		if err != nil {
			err = errors.Wrap(err, "While validating acc data")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(cred.Password), bcrypt.DefaultCost)
		if err != nil {
			err = errors.Wrap(err, "While generating hash")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		acc := &models.Account{Email: cred.Email, Password: string(hashedBytes)}
		count, err := models.GetAccountsCount(db)
		if err != nil {
			err := errors.Wrap(err, "While fetching account count")
			sendError(w, http.StatusBadRequest, err)
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
			err = errors.Wrap(err, "While creating user")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		acc, err = models.GetAccountByEmail(db, acc.Email)
		if err != nil {
			err = errors.Wrap(err, "While fetching account by email")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		tokenPassword := os.Getenv("TOKEN_PASS")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel})
		tokenString, err := token.SignedString([]byte(tokenPassword))
		if err != nil {
			err := errors.Wrap(err, "While signing token")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		sendData(w, http.StatusBadRequest, tokenString)
		return
	})
}

func Authenticate(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		Credentials
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
		Token string `json:"token,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While Authenticate")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, token string) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Token: token,
		}
		json.NewEncoder(w).Encode(out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		cred := in.Credentials
		err = cred.Validate()
		if err != nil {
			err = errors.Wrap(err, "Invalid acc data")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		password := cred.Password
		email := cred.Email
		acc, err := models.GetAccountByEmail(db, email)
		if err != nil {
			err = errors.Wrap(err, "While fetching account by email")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		err = bcrypt.CompareHashAndPassword([]byte(acc.Password), []byte(password))
		if err != nil { //Password does not match!
			if err == bcrypt.ErrMismatchedHashAndPassword {
				err = errors.Wrap(err, "Invalid login cred. Please try again")
				sendError(w, http.StatusBadRequest, err)
				return
			}
			err = errors.Wrap(err, "While comparing hash and password")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		tokenPassword := os.Getenv("TOKEN_PASS")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel})
		tokenString, err := token.SignedString([]byte(tokenPassword))
		if err != nil {
			err = errors.Wrap(err, "While signing token")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		sendData(w, http.StatusOK, tokenString)
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
		Error string `json:"error,omitempty"`
		Users []User `json:"users,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While Authenticate")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, users []User) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Users: users,
		}
		json.NewEncoder(w).Encode(out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		accs, err := models.GetAccounts(db)
		if err != nil {
			err = errors.Wrap(err, "While get accounts")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		users := []User{}
		for _, acc := range *accs {
			user := User{ID: acc.ID, Email: acc.Email, AccessLevel: acc.AccessLevel}
			users = append(users, user)
		}
		sendData(w, http.StatusOK, users)
		return
	})
}

func GetUsersCreatedProducts(db *sql.DB, logger *logrus.Logger) http.Handler {
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
		Error string `json:"error,omitempty"`
		Users []User `json:"users,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While Authenticate")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, users []User) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Users: users,
		}
		json.NewEncoder(w).Encode(out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			sendError(w, http.StatusBadRequest, err)
			return
		}

		accs, err := models.GetAccounts(db)
		if err != nil {
			err = errors.Wrap(err, "While get accounts")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		users := []User{}
		for _, acc := range *accs {
			user := User{ID: acc.ID, Email: acc.Email, AccessLevel: acc.AccessLevel}
			users = append(users, user)
		}
		sendData(w, http.StatusBadRequest, users)
		return
	})
}
