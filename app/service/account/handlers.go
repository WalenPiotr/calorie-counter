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

func (cred *Credentials) Validate() error {
	if !strings.Contains(cred.Email, "@") {
		return errors.New("Invalid email format")
	}
	if len(cred.Password) < 8 {
		return errors.New("Password is too short")
	}
	return nil
}

func Create(db *gorm.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		Credentials Credentials `json:"cred,omitempty"`
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

		hashed, err := bcrypt.GenerateFromPassword([]byte(cred.Password), bcrypt.DefaultCost)

		if err != nil {
			err = errors.Wrap(err, "While generating hash")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
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
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		if len(users) > 0 {
			err := errors.New("Email address already in use")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}

		err = db.Create(acc).Error
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

func Authenticate(db *gorm.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		Credentials Credentials `json:"cred,omitempty"`
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

		acc := &Account{}
		err = db.Where("email = ?", email).First(acc).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				err = errors.Wrap(err, "Email adress not found")
				res := &ResponseObject{Error: err.Error()}
				Send(res, w)
				return
			}
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

func GetUsers(db *gorm.DB, logger *logrus.Logger) http.Handler {
	type User struct {
		ID          uint             `json:"id,omitempty"`
		Email       string           `json:"email,omitempty"`
		AccessLevel auth.AccessLevel `json:"accessLevel,omitempty"`
	}
	type RequestObject struct {
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
		accs := &[]Account{}
		err = db.Find(accs).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				err = errors.Wrap(err, "User with that id not found")
				res := &ResponseObject{Error: err.Error()}
				Send(res, w)
				return
			}
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}

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

func SetAccessLevel(db *gorm.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID          uint             `json:"id,omitempty"`
		AccessLevel auth.AccessLevel `json:"accessLevel,omitempty"`
	}
	type ResponseObject struct {
		Status      int              `json:"status,omitempty"`
		Error       string           `json:"error,omitempty"`
		ID          uint             `json:"id,omitempty"`
		AccessLevel auth.AccessLevel `json:"accessLevel,omitempty"`
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
		acc := &Account{}
		err = db.Where("id = ?", in.ID).First(acc).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				err = errors.Wrap(err, "User with that id not found")
				res := &ResponseObject{Error: err.Error()}
				Send(res, w)
				return
			}
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		acc.AccessLevel = in.AccessLevel
		err = db.Update(acc).Error
		if err != nil {
			err = errors.Wrap(err, "While updating user")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		res := &ResponseObject{Status: http.StatusOK, ID: in.ID, AccessLevel: in.AccessLevel}
		Send(res, w)
		return
	})
}

func Ban(db *gorm.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID uint `json:"id,omitempty"`
	}
	type ResponseObject struct {
		Status int    `json:"status,omitempty"`
		Error  string `json:"error,omitempty"`
		ID     uint   `json:"id,omitempty"`
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
		acc := &Account{}
		err = db.Where("id = ?", in.ID).First(acc).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				err = errors.Wrap(err, "User with that id not found")
				res := &ResponseObject{Error: err.Error()}
				Send(res, w)
				return
			}
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		acc.AccessLevel = auth.Banned
		err = db.Update(acc).Error
		if err != nil {
			err = errors.Wrap(err, "While updating user")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		res := &ResponseObject{Status: http.StatusOK, ID: in.ID}
		Send(res, w)
		return
	})
}

func Unban(db *gorm.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID uint `json:"id,omitempty"`
	}
	type ResponseObject struct {
		Status int    `json:"status,omitempty"`
		Error  string `json:"error,omitempty"`
		ID     uint   `json:"id,omitempty"`
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
		acc := &Account{}
		err = db.Where("id = ?", in.ID).First(acc).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				err = errors.Wrap(err, "User with that id not found")
				res := &ResponseObject{Error: err.Error()}
				Send(res, w)
				return
			}
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		acc.AccessLevel = auth.User
		err = db.Update(acc).Error
		if err != nil {
			err = errors.Wrap(err, "While updating user")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
			return
		}
		res := &ResponseObject{Status: http.StatusOK, ID: in.ID}
		Send(res, w)
		return
	})
}
