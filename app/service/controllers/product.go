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

func CreateProduct(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		product := &models.Product{}
		err := json.NewDecoder(r.Body).Decode(product)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		userID := r.Context().Value(auth.UserID).(uint)
		log.Println(userID)
		product.AccountID = userID

		err = db.Create(product).Error
		if err != nil {
			err := errors.Wrap(err, "While creating product")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		res := &ResponseObject{Data: Data{Product: product}}
		res.Send(w)
		return
	})
}

func GetProducts(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		product := &models.Product{}
		err := json.NewDecoder(r.Body).Decode(product)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}
		foundProducts := &[]models.Product{}
		err = db.Where(product).Find(foundProducts).Error
		if err != nil {
			err := errors.Wrap(err, "While querying products")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		res := &ResponseObject{Data: Data{Products: foundProducts}}
		res.Send(w)
		return
	})
}

func DeleteProduct(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		product := &models.Product{}
		err := json.NewDecoder(r.Body).Decode(product)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}

		db.Delete(product)
		foundProducts := &[]models.Product{}
		err = db.Where(product).Find(foundProducts).Error
		if err != nil {
			err := errors.Wrap(err, "While querying products")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		res := &ResponseObject{Data: Data{Products: foundProducts}}
		res.Send(w)
		return
	})
}

func UpdateProduct(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		product := &models.Product{}
		err := json.NewDecoder(r.Body).Decode(product)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}
		db.Update(product)

		foundProduct := &models.Product{}
		err = db.Where(product).First(foundProduct).Error
		if err != nil {
			err := errors.Wrap(err, "While querying products")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}

		res := &ResponseObject{Data: Data{Product: foundProduct}}
		res.Send(w)
		return
	})
}
