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
	"github.com/lib/pq"
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
	const InvalidDataMsg = "Invalid request body"
	const InvalidCredentials = "Invalid email or password"
	const InternalError = "Internal Error"
	const AlreadyExists = "User with provided email already exists"

	type RequestObject struct {
		Credentials
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
		Token string `json:"token,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While creating account")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
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
			sendError(w, http.StatusBadRequest, err, InvalidDataMsg)
			return
		}
		cred := in.Credentials
		err = cred.Validate()
		if err != nil {
			err = errors.Wrap(err, "While validating acc data")
			sendError(w, http.StatusBadRequest, err, InvalidCredentials)
			return
		}
		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(cred.Password), bcrypt.DefaultCost)
		if err != nil {
			err = errors.Wrap(err, "While generating hash")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		acc := &models.Account{Email: cred.Email, Password: string(hashedBytes)}
		count, err := models.GetAccountsCount(db)
		if err != nil {
			err := errors.Wrap(err, "While fetching account count")
			sendError(w, http.StatusBadRequest, err, InternalError)
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
			if pgerr, ok := err.(*pq.Error); ok {
				if pgerr.Code == "23505" {
					sendError(w, http.StatusBadRequest, err, AlreadyExists)
					return
				}
			}
			err = errors.Wrap(err, "While creating user")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		acc, err = models.GetAccountByEmail(db, acc.Email)
		if err != nil {
			err = errors.Wrap(err, "While fetching account by email")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		tokenPassword := os.Getenv("TOKEN_PASS")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel})
		tokenString, err := token.SignedString([]byte(tokenPassword))
		if err != nil {
			err := errors.Wrap(err, "While signing token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusBadRequest, tokenString)
		return
	})
}

func Authenticate(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InvalidCredentials = "Invalid email or password"
	const NotExists = "User with provided email not exists"
	const InternalError = "Internal Error"

	type RequestObject struct {
		Credentials
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
		Token string `json:"token,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While Authenticate")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
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
			sendError(w, http.StatusBadRequest, err, InvalidData)
			return
		}
		cred := in.Credentials
		err = cred.Validate()
		if err != nil {
			err = errors.Wrap(err, "Invalid acc data")
			sendError(w, http.StatusBadRequest, err, InvalidCredentials)
			return
		}
		password := cred.Password
		email := cred.Email
		acc, err := models.GetAccountByEmail(db, email)
		if err != nil {
			err = errors.Wrap(err, "While fetching account by email")
			sendError(w, http.StatusBadRequest, err, NotExists)
			return
		}
		err = bcrypt.CompareHashAndPassword([]byte(acc.Password), []byte(password))
		if err != nil { //Password does not match!
			if err == bcrypt.ErrMismatchedHashAndPassword {
				err = errors.Wrap(err, "Invalid login credentials")
				sendError(w, http.StatusBadRequest, err, InvalidCredentials)
				return
			}
			err = errors.Wrap(err, "While comparing hash and password")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		tokenPassword := os.Getenv("TOKEN_PASS")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel})
		tokenString, err := token.SignedString([]byte(tokenPassword))
		if err != nil {
			err = errors.Wrap(err, "While signing token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK, tokenString)
		return
	})
}

func BanUser(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InvalidCredentials = "Invalid email or password"
	const NotExists = "User with provided email not exists"
	const InternalError = "Internal Error"

	type RequestObject struct {
		ID int `json:"id,omitempty"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While Authenticate")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{}
		json.NewEncoder(w).Encode(out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			sendError(w, http.StatusBadRequest, err, InvalidData)
			return
		}
		err = models.SetAccessLevel(db, in.ID, auth.Banned)
		if err != nil {
			err = errors.Wrap(err, "While setting access level")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK)
		return
	})
}

func UnbanUser(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal Error"

	type RequestObject struct {
		ID int `json:"id,omitempty"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While Authenticate")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{}
		json.NewEncoder(w).Encode(out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			sendError(w, http.StatusBadRequest, err, InvalidData)
			return
		}
		err = models.SetAccessLevel(db, in.ID, auth.User)
		if err != nil {
			err = errors.Wrap(err, "While setting access level")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK)
		return
	})
}

func SearchUsers(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal Error"
	type User struct {
		Email       string           `json:"email,omitempty"`
		ID          int              `json:"id,omitempty"`
		AccessLevel auth.AccessLevel `json:"accessLevel,omitempty"`
	}
	type RequestObject struct {
		Email string `json:"email,omitempty"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
		Users []User `json:"users,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While Authenticate")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
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
			sendError(w, http.StatusBadRequest, err, InvalidData)
			return
		}
		accounts, err := models.SearchAccounts(db, in.Email)
		if err != nil {
			err = errors.Wrap(err, "While fetching users")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		users := []User{}
		for _, acc := range *accounts {
			accData := User{ID: acc.ID, Email: acc.Email, AccessLevel: acc.AccessLevel}
			users = append(users, accData)
		}
		sendData(w, http.StatusOK, users)
		return
	})
}
