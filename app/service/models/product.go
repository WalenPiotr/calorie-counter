package models

import (
	"log"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
)

type Product struct {
	gorm.Model
	Name      string  `json:"name"`
	Quantity  float64 `json:"quantity"`
	Unit      string  `json:"unit"`
	Calories  float64 `json:"calories"`
	Account   Account `json:"-"`
	AccountID uint    `json:"accountID"`
}

func (product *Product) validate() bool {
	if product.Quantity <= 0 || product.Calories <= 0 {
		return false
	}
	return true
}

func (product *Product) Create(db *gorm.DB) error {
	ok := product.validate()
	if !ok {
		return errors.New("Not valid product data")
	}

	db.Create(product)

	log.Println(product)
	var newProducts []Product
	err := db.Model(&product).Related(&product.Account).Find(&newProducts).Error
	if err != nil {
		return errors.Wrap(err, "While fetching related products")
	}
	log.Println(newProducts)
	return nil
}
