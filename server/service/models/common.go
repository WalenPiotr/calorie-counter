package models

type Pagination struct {
	ItemsPerPage int `json:"itemsPerPage"`
	Page         int `json:"page"`
	MaxPage      int `json:"maxPage"`
}
