package handlers

import (
	"app/service/middleware"
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
	Send := func(out *ResponseObject, w http.ResponseWriter) {
		if out.Error != "" {
			logger.Error(out.Error)
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(out.Status)
		json.NewEncoder(w).Encode(*out)
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		product := in.Product

		userID, ok := r.Context().Value(middleware.UserID).(int)
		if !ok {
			logger.Errorf("Invalid UserID %v", userID)
			err = errors.Wrap(err, "While getting UserID from request context")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
			return
		}

		product.Creator = userID
		models.CreateProduct(db, product)

		out := &ResponseObject{Status: http.StatusOK, Product: product}
		Send(out, w)
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
	Send := func(out *ResponseObject, w http.ResponseWriter) {
		if out.Error != "" {
			logger.Error(out.Error)
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(out.Status)
		json.NewEncoder(w).Encode(*out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		products, err := models.GetProducts(db)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		out := &ResponseObject{Status: http.StatusOK, Products: products}
		Send(out, w)
		return
	})
}

func GetProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID int `json:"id"`
	}
	type ResponseObject struct {
		Status  int    `json:"status,omitempty"`
		Error   string `json:"error,omitempty"`
		Product *models.Product
	}
	Send := func(out *ResponseObject, w http.ResponseWriter) {
		if out.Error != "" {
			logger.Error(out.Error)
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(out.Status)
		json.NewEncoder(w).Encode(*out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		product, err := models.GetProductById(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		out := &ResponseObject{Status: http.StatusOK, Product: product}
		Send(out, w)
		return
	})
}

func UpdateProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID         int            `json:"id"`
		NewProduct models.Product `json:"newProduct"`
	}
	type ResponseObject struct {
		Status  int    `json:"status,omitempty"`
		Error   string `json:"error,omitempty"`
		Product *models.Product
	}
	Send := func(out *ResponseObject, w http.ResponseWriter) {
		if out.Error != "" {
			logger.Error(out.Error)
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(out.Status)
		json.NewEncoder(w).Encode(*out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		err = models.UpdateProduct(db, in.ID, in.NewProduct)
		if err != nil {
			err = errors.Wrap(err, "While updating products")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		out := &ResponseObject{Status: http.StatusOK}
		Send(out, w)
		return
	})
}

func DeleteProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID int `json:"id"`
	}
	type ResponseObject struct {
		Status  int    `json:"status,omitempty"`
		Error   string `json:"error,omitempty"`
		Product *models.Product
	}
	Send := func(out *ResponseObject, w http.ResponseWriter) {
		if out.Error != "" {
			logger.Error(out.Error)
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(out.Status)
		json.NewEncoder(w).Encode(*out)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in := &RequestObject{}
		err := json.NewDecoder(r.Body).Decode(in)
		if err != nil {
			err = errors.Wrap(err, "While decoding request body")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		err = models.DeleteProduct(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While updating products")
			out := &ResponseObject{Status: http.StatusBadRequest, Error: err.Error()}
			Send(out, w)
		}
		out := &ResponseObject{Status: http.StatusOK}
		Send(out, w)
		return
	})
}
