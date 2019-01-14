package handlers

import (
	"app/service/auth"
	"app/service/models"
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func CreateProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		Product models.Product
	}
	type ResponseObject struct {
		Status  int    `json:"status,omitempty"`
		Error   string `json:"error,omitempty"`
		Product models.Product
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
		}
		product := in.Product

		userID := r.Context().Value(auth.UserID).(int)
		product.Creator = userID
		models.CreateProduct(db, product)

		res := &ResponseObject{Status: http.StatusOK, Product: product}
		Send(res, w)
		return
	})
}

func GetProducts(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
	}
	type ResponseObject struct {
		Status   int    `json:"status,omitempty"`
		Error    string `json:"error,omitempty"`
		Products *[]models.Product
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
		}
		products, err := models.GetProducts(db)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			res := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(res, w)
		}
		res := &ResponseObject{Status: http.StatusOK, Products: products}
		Send(res, w)
		return
	})
}
