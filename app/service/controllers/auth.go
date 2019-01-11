package controllers

import (
	"app/service/models"
	"encoding/json"
	"net/http"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func CreateAccount(db *gorm.DB, logger *logrus.Logger) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		account := &models.Account{}
		err := json.NewDecoder(r.Body).Decode(account)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}
		err = account.Create(db)
		if err != nil {
			err := errors.Wrap(err, "While creating account")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		res := &ResponseObject{Data: Data{Account: account}}
		res.Send(w)
		return
	}
}

func Authenticate(db *gorm.DB, logger *logrus.Logger) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		account := &models.Account{}
		err := json.NewDecoder(r.Body).Decode(account)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		err = account.Login(db)
		if err != nil {
			err = errors.Wrap(err, "While authenticating")
			logger.Error(err)
			res := &ResponseObject{Error: err.Error()}
			res.Send(w)
			return
		}
		res := &ResponseObject{Status: http.StatusOK, Data: Data{Account: account}}
		res.Send(w)
		return
	}

}
