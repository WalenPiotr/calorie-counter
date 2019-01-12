package controllers

import (
	"app/service/models"
	"encoding/json"
	"net/http"
)

type Data struct {
	Account  *models.Account   `json:"account,omitempty"`
	Accounts *[]models.Account `json:"accounts,omitempty"`
	Product  *models.Product   `json:"product,omitempty"`
	Products *[]models.Product `json:"products,omitempty"`
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
