package handlers

import (
	"app/service/auth"
	"app/service/models"
	"encoding/json"
	"net/http"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

type InputObject struct {
	Product models.Product `'json:"product,omitempty"'`
}

type Data struct {
	Product  models.Product   `json:"product,omitempty"`
	Products []models.Product `json:"products,omitempty"`
}
type ResponseObject struct {
	Status int    `json:"status"`
	Error  string `json:"error,omitempty"`
	Data   Data   `json:"data,omitempty"`
}

func (res *ResponseObject) Send(w http.ResponseWriter) {
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(*res)
}

func CreateProduct(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &InputObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}
		product := in.Product

		userID := r.Context().Value(auth.UserID).(uint)

		acc := models.Account{}
		acc.ID = userID

		err = db.Create(&product).Related(&acc).Error
		if err != nil {
			err := errors.Wrap(err, "While creating product")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		res := &ResponseObject{Status: http.StatusOK, Data: Data{Product: product}}
		res.Send(w)
		return
	})
}

func GetProducts(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &InputObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}
		product := in.Product

		foundProducts := &[]models.Product{}
		err = db.Where(product).Find(foundProducts).Error
		if err != nil {
			err := errors.Wrap(err, "While querying products")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
			return
		}
		res := &ResponseObject{Status: http.StatusOK, Data: Data{Products: *foundProducts}}
		res.Send(w)
		return
	})
}

func DeleteProduct(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &InputObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}
		product := in.Product

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
		res := &ResponseObject{Status: http.StatusOK, Data: Data{Products: *foundProducts}}
		res.Send(w)
		return
	})
}

func UpdateProduct(db *gorm.DB, logger *logrus.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &InputObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			logger.Error(err)
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			res.Send(w)
		}
		product := in.Product

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

		res := &ResponseObject{Status: http.StatusOK, Data: Data{Product: *foundProduct}}
		res.Send(w)
		return
	})
}
