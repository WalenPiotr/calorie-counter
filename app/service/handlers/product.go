package handlers

import (
	"app/service/middleware"
	"app/service/models"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func CreateProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		Product  *models.Product   `json:"product"`
		Portions *[]models.Portion `json:"portions"`
	}
	type ResponseObject struct {
		Status   int              `json:"status,omitempty"`
		Error    string           `json:"error,omitempty"`
		Product  models.Product   `json:"product,omitempty"`
		Portions []models.Portion `json:"portions,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While creating product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status: status,
			Error:  err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, product models.Product, portions []models.Portion) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status:   status,
			Product:  product,
			Portions: portions,
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
		if in.Product == nil {
			err = errors.Wrap(err, "No product provided")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		if in.Portions == nil {
			err = errors.Wrap(err, "No portions provided")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		log.Printf("%+v", in)
		product := in.Product
		userID, ok := r.Context().Value(middleware.UserID).(int)
		if !ok {
			err = errors.Wrap(err, "While getting UserID from request context")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		product.Creator = userID
		dbProduct, err := models.CreateProduct(db, *product)
		if err != nil {
			err = errors.Wrap(err, "While creating prodcut")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		dbPortions := []models.Portion{}
		for _, portion := range *in.Portions {
			portion.ProductID = dbProduct.ID
			dbPortion, err := models.CreatePortion(db, portion)
			if err != nil {
				err = errors.Wrap(err, "While creating portion for product")
				sendError(w, http.StatusBadRequest, err)
				return
			}
			dbPortions = append(dbPortions, *dbPortion)
		}
		sendData(w, http.StatusOK, *dbProduct, dbPortions)
		return
	})
}

func GetProducts(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
	}
	type ResponseObject struct {
		Status   int              `json:"status,omitempty"`
		Error    string           `json:"error,omitempty"`
		Products []models.Product `json:"products,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While get products")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status: status,
			Error:  err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, products []models.Product) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status:   status,
			Products: products,
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
		products, err := models.GetProducts(db)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		sendData(w, http.StatusOK, *products)
		return
	})
}

func GetProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID int `json:"id"`
	}
	type ResponseObject struct {
		Status   int               `json:"status,omitempty"`
		Error    string            `json:"error,omitempty"`
		Product  *models.Product   `json:"product,omitempty"`
		Portions []*models.Portion `json:"portions,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While getting product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status: status,
			Error:  err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, product *models.Product, portions []*models.Portion) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status:   status,
			Product:  product,
			Portions: portions,
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
		product, err := models.GetProductById(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		portions, err := models.GetProductsPortions(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While fetching products portions")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		sendData(w, http.StatusOK, product, portions)
		return
	})
}

func UpdateProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID         int            `json:"id"`
		NewProduct models.Product `json:"product"`
	}
	type ResponseObject struct {
		Status  int             `json:"status,omitempty"`
		Error   string          `json:"error,omitempty"`
		Product *models.Product `json:"product"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While updating product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status: status,
			Error:  err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, product *models.Product) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status:  status,
			Product: product,
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
		product, err := models.UpdateProduct(db, in.ID, in.NewProduct)
		if err != nil {
			err = errors.Wrap(err, "While updating products")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		sendData(w, http.StatusOK, product)
		return
	})
}

func DeleteProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID int `json:"id"`
	}
	type ResponseObject struct {
		Status  int             `json:"status,omitempty"`
		Error   string          `json:"error,omitempty"`
		Product *models.Product `json:"product,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While deleting product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status: status,
			Error:  err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, product *models.Product) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status:  status,
			Product: product,
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
		err = models.DeleteProduct(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While updating products")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		sendData(w, http.StatusOK, &models.Product{ID: in.ID})
		return
	})
}

func SearchProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type BundledProduct struct {
		Product  models.Product   `json:"product"`
		Portions []*models.Portion `json:"portions"`
	}

	type RequestObject struct {
		Name string `json:"name"`
	}
	type ResponseObject struct {
		Status   int              `json:"status,omitempty"`
		Error    string           `json:"error,omitempty"`
		Products []BundledProduct `json:"products,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While getting product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status: status,
			Error:  err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, products []BundledProduct) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status:   status,
			Products: products,
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
		products, err := models.GetProductsByName(db, in.Name)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			sendError(w, http.StatusBadRequest, err)
			return
		}
		log.Printf("%+v", products)
		bundledProducts := []BundledProduct{}
		for _, product := range *products {
			portions, err := models.GetProductsPortions(db, product.ID)
			if err != nil {
				err = errors.Wrap(err, "While products portions")
				sendError(w, http.StatusBadRequest, err)
				return
			}
			bundledProduct := BundledProduct{
				Product:  product,
				Portions: portions,
			}
			bundledProducts = append(bundledProducts, bundledProduct)
		}
		log.Printf("%+v", bundledProducts)
		sendData(w, http.StatusOK, bundledProducts)
		return
	})
}

func RateProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	type RequestObject struct {
		ID   int         `json:"id"`
		Vote models.Vote `json:"vote"`
	}
	type ResponseObject struct {
		Status int    `json:"status,omitempty"`
		Error  string `json:"error,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error) {
		err = errors.Wrap(err, "While rating product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status: status,
			Error:  err.Error(),
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Status: status,
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
		if in.Vote == models.UpVote || in.Vote == models.DownVote || in.Vote == models.None {
			userID, ok := r.Context().Value(middleware.UserID).(int)
			if !ok {
				err = errors.Wrap(err, "While getting UserID from request context")
				sendError(w, http.StatusBadRequest, err)
				return
			}
			err = models.RateProduct(db, userID, in.ID, in.Vote)
			if err != nil {
				sendError(w, http.StatusBadRequest, err)
				return
			}
			sendData(w, http.StatusOK)
			return
		}
		err = errors.New("Invalid vote value")
		sendError(w, http.StatusBadRequest, err)
		return
	})
}
