package handlers

import (
	"app/service/auth"
	"app/service/middleware"
	"app/service/models"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

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
		password := cred.Password
		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
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
		expireToken := time.Now().Add(time.Hour * 6).Unix()
		verifySecret := os.Getenv("VERIFY_SECRET")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.VerifyToken{UserID: acc.ID, Email: acc.Email, AccessLevel: acc.AccessLevel, StandardClaims: jwt.StandardClaims{
				ExpiresAt: expireToken,
				Issuer:    "cc-admin",
			}})
		tokenString, err := token.SignedString([]byte(verifySecret))
		if err != nil {
			err := errors.Wrap(err, "While signing token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		subject := "You have regisitered to CC-APP"
		verifyURL := "http://" + os.Getenv("CLIENT_URL") + "/verify/" + tokenString
		text := "This is your verification link: " + verifyURL
		auth.SendMail(acc.Email, subject, text)
		sendData(w, http.StatusOK)
		return
	})
}

func MailChangePasswordLink(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidDataMsg = "Invalid request body"
	const NotExists = "User with that mail do not exists"
	const AlreadySent = "Password change email was already sent"
	const InternalError = "Internal Error"

	type RequestObject struct {
		Email string `json:"email,omitempty"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
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
			sendError(w, http.StatusBadRequest, err, InvalidDataMsg)
			return
		}

		acc, err := models.GetAccountByEmail(db, in.Email)
		if err != nil {
			err = errors.Wrap(err, "While fetching account by email")
			sendError(w, http.StatusBadRequest, err, NotExists)
			return
		}
		if acc.ChangePassword {
			err = errors.Wrap(err, "Password change email was already sent")
			sendError(w, http.StatusBadRequest, err, AlreadySent)
			return
		}
		err = models.ChangePasswordRequest(db, in.Email)
		if err != nil {
			err = errors.Wrap(err, "While change password flag set")
			sendError(w, http.StatusBadRequest, err, NotExists)
			return
		}
		expireToken := time.Now().Add(time.Hour * 6).Unix()
		secret := os.Getenv("PASS_SECRET")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.PassToken{UserID: acc.ID, Email: acc.Email, StandardClaims: jwt.StandardClaims{
				ExpiresAt: expireToken,
				Issuer:    "cc-admin",
			}})

		tokenString, err := token.SignedString([]byte(secret))
		if err != nil {
			err = errors.Wrap(err, "While signing token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		subject := "Change password request in CC-APP"
		verifyURL := "http://" + os.Getenv("CLIENT_URL") + "/change-password/" + tokenString
		text := "To change your password, please click following link: " + verifyURL
		auth.SendMail(in.Email, subject, text)
		sendData(w, http.StatusOK)
		return
	})
}

func ChangePassword(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidDataMsg = "Invalid request body"
	const InvalidCredentials = "Invalid email or password"
	const InternalError = "Internal Error"
	type RequestObject struct {
		Token    string `json:"token,omitempty"`
		Password string `json:"password,omitempty"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
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
			sendError(w, http.StatusBadRequest, err, InvalidDataMsg)
			return
		}
		token := &auth.PassToken{}
		passSecret := os.Getenv("PASS_SECRET")
		jwtToken, err := jwt.ParseWithClaims(in.Token, token, func(token *jwt.Token) (interface{}, error) {
			return []byte(passSecret), nil
		})
		if err != nil { //Malformed token, returns with http code 403 as usual
			err := errors.New("Malformed authentication token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		if !jwtToken.Valid { //Token is invalid, maybe not signed on this server
			err := errors.New("Token is invalid")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		cred := Credentials{Email: token.Email, Password: in.Password}
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
		err = models.ChangePassword(db, cred.Email, string(hashedBytes))
		if err != nil {
			err = errors.Wrap(err, "While changing password")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK)
		return
	})
}

func Verify(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InternalError = "Internal Error"
	const InvalidToken = "Invalid verification token"
	type RequestObject struct {
		Token string `json:"token,omitempty"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
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
	sendData := func(w http.ResponseWriter, status int) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{}
		json.NewEncoder(w).Encode(out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		const InvalidDataMsg = "Invalid request body"

		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			sendError(w, http.StatusBadRequest, err, InvalidDataMsg)
			return
		}
		token := in.Token
		verifySecret := os.Getenv("VERIFY_SECRET")
		tokenObj := &auth.VerifyToken{}
		jwtToken, err := jwt.ParseWithClaims(token, tokenObj, func(token *jwt.Token) (interface{}, error) {
			return []byte(verifySecret), nil
		})
		if err != nil {
			err = errors.Wrap(err, "While parsing token - malformed verify token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		if !jwtToken.Valid {
			err = errors.Wrap(err, "While parsing token - not valid verify token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		acc := models.Account{ID: tokenObj.UserID, Email: tokenObj.Email, AccessLevel: tokenObj.AccessLevel}
		err = models.VerifyAccount(db, &acc)
		if err != nil {
			err = errors.Wrap(err, "While parsing token - not valid verify token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK)
		return
	})
}

func Authenticate(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InvalidCredentials = "Invalid email or password"
	const NotExists = "User with provided email not exists"
	const NotVerified = "User is not verified, please check your email"
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
		if !acc.Verified {
			err = errors.Wrap(err, "While verifying account")
			sendError(w, http.StatusBadRequest, err, NotVerified)
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
		expireToken := time.Now().Add(time.Hour * 6).Unix()
		authSecret := os.Getenv("AUTH_SECRET")
		token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"),
			&auth.Token{UserID: acc.ID, AccessLevel: acc.AccessLevel, StandardClaims: jwt.StandardClaims{
				ExpiresAt: expireToken,
				Issuer:    "cc-admin",
			}})
		tokenString, err := token.SignedString([]byte(authSecret))
		if err != nil {
			err = errors.Wrap(err, "While signing token")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK, tokenString)
		return
	})
}

func CheckIfAuthenticated(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const NotAuthenticated = "You are not authenticated"
	const InternalError = "Internal Error"

	type RequestObject struct {
		Token string
	}
	type ResponseObject struct {
		Error         string `json:"error,omitempty"`
		Authenticated bool   `json:"authenticated,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While checking if authenticated")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, authenticated bool) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Authenticated: authenticated,
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
		token := &auth.Token{}
		authSecret := os.Getenv("AUTH_SECRET")
		jwtToken, err := jwt.ParseWithClaims(in.Token, token, func(token *jwt.Token) (interface{}, error) {
			return []byte(authSecret), nil
		})
		if err != nil { //Malformed token, returns with http code 403 as usual
			err := errors.New("Malformed authentication token")
			sendError(w, http.StatusBadRequest, err, NotAuthenticated)
			return
		}
		if !jwtToken.Valid { //Token is invalid, maybe not signed on this server
			err := errors.New("Token is invalid")
			sendError(w, http.StatusBadRequest, err, NotAuthenticated)
			return
		}
		sendData(w, http.StatusOK, true)
		return
	})
}

func BanUser(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal Error"
	const CannotBanYourself = "Cannot ban yourself"
	const HaveNoRight = "Cannot ban this user, because he has the same or greater priviledges as you"
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
		userID, ok := r.Context().Value(middleware.UserID).(int)
		if !ok {
			err = errors.New("While fetching id from context")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		if in.ID != userID {
			user, err := models.GetAccountById(db, in.ID)
			if err != nil {
				err = errors.Wrap(err, "While fetching user")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			admin, err := models.GetAccountById(db, userID)
			if err != nil {
				err = errors.Wrap(err, "While fetching user")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			if user.AccessLevel >= admin.AccessLevel {
				err = errors.Wrap(err, "While checking if has right to ban")
				sendError(w, http.StatusBadRequest, err, HaveNoRight)
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
		}
		err = errors.Wrap(err, "While checking user id")
		sendError(w, http.StatusBadRequest, err, CannotBanYourself)
		return
	})
}

func UnbanUser(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal Error"
	const CannotBanYourself = "Cannot ban yourself"
	const HaveNoRight = "Cannot ban this user, because he has the same or greater priviledges as you"
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
		userID, ok := r.Context().Value(middleware.UserID).(int)
		if !ok {
			err = errors.New("While fetching id from context")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		if in.ID != userID {
			user, err := models.GetAccountById(db, in.ID)
			if err != nil {
				err = errors.Wrap(err, "While fetching user")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			admin, err := models.GetAccountById(db, userID)
			if err != nil {
				err = errors.Wrap(err, "While fetching user")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			if user.AccessLevel >= admin.AccessLevel {
				err = errors.Wrap(err, "While checking if has right to ban")
				sendError(w, http.StatusBadRequest, err, HaveNoRight)
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
		}
		err = errors.Wrap(err, "While checking user id")
		sendError(w, http.StatusBadRequest, err, CannotBanYourself)
		return
	})
}

func SetAccessLevel(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal Error"
	const CannotSetPriveledgesYourself = "Cannot set access level for yourself"
	const HaveNoRight = "Cannot set access level this user, because you have the same priveledges"
	const CannotSetAdminRights = "Cannot set admin priveledges"
	type RequestObject struct {
		ID          int              `json:"id,omitempty"`
		AccessLevel auth.AccessLevel `json:"accessLevel,omitempty"`
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
		if in.AccessLevel >= auth.Admin {
			err = errors.Wrap(err, "While checking if has right to ban")
			sendError(w, http.StatusBadRequest, err, CannotSetAdminRights)
			return
		}
		userID, ok := r.Context().Value(middleware.UserID).(int)
		if !ok {
			err = errors.New("While fetching id from context")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		if in.ID != userID {
			user, err := models.GetAccountById(db, in.ID)
			if err != nil {
				err = errors.Wrap(err, "While fetching user")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			admin, err := models.GetAccountById(db, userID)
			if err != nil {
				err = errors.Wrap(err, "While fetching user")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			if user.AccessLevel >= admin.AccessLevel {
				err = errors.Wrap(err, "While checking if has right to ban")
				sendError(w, http.StatusBadRequest, err, HaveNoRight)
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
		}
		err = errors.Wrap(err, "While checking user id")
		sendError(w, http.StatusBadRequest, err, CannotSetPriveledgesYourself)
		return
	})
}

func SearchUsers(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal Error"
	type User struct {
		Email       string            `json:"email,omitempty"`
		ID          int               `json:"id,omitempty"`
		AccessLevel auth.AccessLevel  `json:"accessLevel,omitempty"`
		Pagination  models.Pagination `json:"pagination,omitempty"`
	}
	type RequestObject struct {
		Email      string            `json:"email,omitempty"`
		Pagination models.Pagination `json:"pagination,omitempty"`
	}
	type ResponseObject struct {
		Error      string            `json:"error,omitempty"`
		Users      []User            `json:"users,omitempty"`
		Pagination models.Pagination `json:"pagination,omitempty"`
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
	sendData := func(w http.ResponseWriter, status int, users []User, pagination models.Pagination) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Users:      users,
			Pagination: pagination,
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
		accounts, pagination, err := models.SearchAccounts(db, in.Email, in.Pagination)
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
		sendData(w, http.StatusOK, users, *pagination)
		return
	})
}
