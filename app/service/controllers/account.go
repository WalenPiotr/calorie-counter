package controllers

import (
	"app/service/auth"
	"app/service/models"
	"encoding/json"
	"log"
	"net/http"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func CreateAccount(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		account := &models.Account{}
		err := json.NewDecoder(r.Body).Decode(account)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		err = account.Validate()
		if err != nil {
			err = errors.Wrap(err, "While validating account data")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		var count int
		db.Model(&models.Account{}).Count(&count)
		if count == 0 {
			log.Println("CREATING ADMIN USER!")
			account.AccessLevel = auth.Admin
		} else {
			account.AccessLevel = auth.User
		}

		//Email must be unique
		var users []models.Account
		err = db.Where("email = ?", account.Email).Find(&users).Error
		if err != nil {
			err := errors.Wrap(err, "While searching for account")
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

		account.HashPassword()
		db.Create(account)
		account.SignToken()
		res := &ResponseObject{Data: Data{Account: account}}
		res.Send(w)
		return
	})
}

func Authenticate(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		account := &models.Account{}
		err := json.NewDecoder(r.Body).Decode(account)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		err = account.Validate()
		if err != nil {
			err = errors.Wrap(err, "Invalid account data")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		password := account.Password
		email := account.Email
		err = db.Where("email = ?", email).First(account).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				err = errors.Wrap(err, "Email adress not found")
				logger.Error(err)
				res := &ResponseObject{Error: err.Error()}
				res.Send(w)
				return
			}
			logger.Error(err)
			res := &ResponseObject{Error: err.Error()}
			res.Send(w)
			return
		}
		err = account.ComparePassword(password)
		if err != nil {
			err = errors.Wrap(err, "While comparing password")
			logger.Error(err)
			res := &ResponseObject{Error: err.Error()}
			res.Send(w)
		}

		account.SignToken()
		res := &ResponseObject{Status: http.StatusOK, Data: Data{Account: account}}
		res.Send(w)
		return
	})
}

func UpdateUser(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		account := &models.Account{}
		err := json.NewDecoder(r.Body).Decode(account)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		err = account.Validate()
		if err != nil {
			err = errors.Wrap(err, "While validating account data")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		err = db.Update(account).Error
		if err != nil {
			err = errors.Wrap(err, "While updating account")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		foundAccounts := &[]models.Account{}
		err = db.Where(account).Find(foundAccounts).Error
		if err != nil {
			err := errors.Wrap(err, "While querying accounts")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		res := &ResponseObject{Status: http.StatusOK, Data: Data{Accounts: foundAccounts}}
		res.Send(w)

	})
}

func DeleteUser(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		account := &models.Account{}
		err := json.NewDecoder(r.Body).Decode(account)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		err = account.Validate()
		if err != nil {
			err = errors.Wrap(err, "While validating account data")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		err = db.Delete(account).Error
		if err != nil {
			err = errors.Wrap(err, "While deleting account")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		foundAccounts := &[]models.Account{}
		err = db.Where(account).Find(foundAccounts).Error
		if err != nil {
			err := errors.Wrap(err, "While querying accounts")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		res := &ResponseObject{Status: http.StatusOK, Data: Data{Accounts: foundAccounts}}
		res.Send(w)

	})
}
