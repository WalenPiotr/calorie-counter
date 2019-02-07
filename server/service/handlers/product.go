package handlers

import (
	"app/service/auth"
	"app/service/middleware"
	"app/service/models"
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/lib/pq"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func CreateProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal error"
	const AlreadyExists = "Product with same name already exists"

	type Product struct {
		*models.Product
		Portions *[]models.Portion `json:"portions"`
	}
	type RequestObject struct {
		Product *Product `json:"product"`
	}
	type ResponseObject struct {
		Error   string  `json:"error,omitempty"`
		Product Product `json:"product,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While creating product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, product Product) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Product: product,
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
		if in.Product == nil {
			err = errors.Wrap(err, "No product provided")
			sendError(w, http.StatusBadRequest, err, InvalidData)
			return
		}
		if in.Product.Portions == nil {
			err = errors.Wrap(err, "No portions provided")
			sendError(w, http.StatusBadRequest, err, InvalidData)
			return
		}
		userID, ok := r.Context().Value(middleware.UserID).(int)
		if !ok {
			err = errors.Wrap(err, "While getting UserID from request context")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		newProduct := models.Product{
			ID:      in.Product.ID,
			Creator: userID,
			Name:    in.Product.Name,
		}
		dbProduct, err := models.CreateProduct(db, newProduct)
		if err != nil {
			if pgerr, ok := err.(*pq.Error); ok {
				if pgerr.Code == "23505" {
					sendError(w, http.StatusBadRequest, err, AlreadyExists)
					return
				}
			}
			err = errors.Wrap(err, "While creating product")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		dbPortions := []models.Portion{}
		for _, portion := range *in.Product.Portions {
			portion.ProductID = dbProduct.ID
			dbPortion, err := models.CreatePortion(db, portion)
			if err != nil {
				err = errors.Wrap(err, "While creating portion for product")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			dbPortions = append(dbPortions, *dbPortion)
		}
		createdProduct := Product{
			Product:  dbProduct,
			Portions: &dbPortions,
		}
		sendData(w, http.StatusOK, createdProduct)
		return
	})
}

func GetProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal error"
	type Product struct {
		*models.Product
		Portions []models.Portion `json:"portions,omitempty"`
	}
	type RequestObject struct {
		ID int `json:"id"`
	}
	type ResponseObject struct {
		Error   string  `json:"error,omitempty"`
		Product Product `json:"product,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While getting product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, product Product) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Product: product,
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
		product, err := models.GetProductById(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		portions, err := models.GetProductsPortions(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While fetching products portions")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK, Product{Product: product, Portions: portions})
		return
	})
}

func UpdateProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal error"
	type RequestObject struct {
		ID         int            `json:"id"`
		NewProduct models.Product `json:"product"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While updating product")
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
		_, err = models.UpdateProduct(db, in.ID, in.NewProduct)
		if err != nil {
			err = errors.Wrap(err, "While updating products")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK)
		return
	})
}

func DeleteProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal error"

	type RequestObject struct {
		ID int `json:"id"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While deleting product")
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
		err = models.DeleteProduct(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While updating products")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK)
		return
	})
}
func SearchProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal error"

	type Product struct {
		models.Product
		Portions []models.Portion `json:"portions"`
		Votes    []*models.Votes  `json:"votes"`
	}
	type RequestObject struct {
		Name string `json:"name"`
	}
	type ResponseObject struct {
		Error    string    `json:"error,omitempty"`
		Products []Product `json:"products,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While getting product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: message,
		}
		json.NewEncoder(w).Encode(out)
	}
	sendData := func(w http.ResponseWriter, status int, products []Product) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Products: products,
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
		products, err := models.GetProductsByName(db, in.Name)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		bundledProducts := []Product{}
		for _, product := range *products {
			portions, err := models.GetProductsPortions(db, product.ID)
			if err != nil {
				err = errors.Wrap(err, "While products portions")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			bundledProduct := Product{
				Product:  product,
				Portions: portions,
			}
			bundledProducts = append(bundledProducts, bundledProduct)
		}
		sendData(w, http.StatusOK, bundledProducts)
		return
	})
}

func GetUsersAddedProducts(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal error"

	type Product struct {
		models.Product
		Portions []models.Portion `json:"portions"`
		Votes    []*models.Votes  `json:"votes"`
	}
	type User struct {
		Email       string           `json:"email"`
		AccessLevel auth.AccessLevel `json:"accessLevel"`
		ID          int              `json:"id"`
	}
	type RequestObject struct {
		ID int `json:"id,omitempty"`
	}
	type ResponseObject struct {
		Error    string    `json:"error,omitempty"`
		User     User      `json:"user,omitempty"`
		Products []Product `json:"products,omitempty"`
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
	sendData := func(w http.ResponseWriter, status int, products []Product, user User) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Products: products,
			User:     user,
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
		products, err := models.GetProductsByCreatorID(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While fetching products")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		bundledProducts := []Product{}
		for _, product := range *products {
			portions, err := models.GetProductsPortions(db, product.ID)
			if err != nil {
				err = errors.Wrap(err, "While products portions")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			bundledProduct := Product{
				Product:  product,
				Portions: portions,
			}
			bundledProducts = append(bundledProducts, bundledProduct)
		}
		acc, err := models.GetAccountById(db, in.ID)
		if err != nil {
			err = errors.Wrap(err, "While get account by id")
			sendError(w, http.StatusBadRequest, err, InternalError)
			return
		}
		sendData(w, http.StatusOK, bundledProducts, User{Email: acc.Email, ID: acc.ID, AccessLevel: acc.AccessLevel})
		return
	})
}

func RateProduct(db *sql.DB, logger *logrus.Logger) http.Handler {
	const InvalidData = "Invalid request body"
	const InternalError = "Internal error"

	type RequestObject struct {
		ID   int         `json:"id"`
		Vote models.Vote `json:"vote"`
	}
	type ResponseObject struct {
		Error string `json:"error,omitempty"`
	}
	sendError := func(w http.ResponseWriter, status int, err error, message string) {
		err = errors.Wrap(err, "While rating product")
		logger.Error(err)
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(status)
		out := ResponseObject{
			Error: err.Error(),
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
		if in.Vote == models.UpVote || in.Vote == models.DownVote || in.Vote == models.None {
			userID, ok := r.Context().Value(middleware.UserID).(int)
			if !ok {
				err = errors.Wrap(err, "While getting UserID from request context")
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			err = models.RateProduct(db, userID, in.ID, in.Vote)
			if err != nil {
				sendError(w, http.StatusBadRequest, err, InternalError)
				return
			}
			sendData(w, http.StatusOK)
			return
		}
		err = errors.New("Invalid vote value")
		sendError(w, http.StatusBadRequest, err, InvalidData)
		return
	})
}
