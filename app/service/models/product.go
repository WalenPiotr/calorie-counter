package models

import (
	"github.com/jinzhu/gorm"
)

type Product struct {
	gorm.Model
	Name        string  `json:"name"`
	Quantity    float64 `json:"quantity"`
	Unit        string  `json:"unit"`
	Calories    float64 `json:"calories"`
	Creator     uint
	AddedBy     []*Account `gorm:"many2many:added;"`
	UpvotedBy   []*Account `gorm:"many2many:upvoted;"`
	DownvotedBy []*Account `gorm:"many2many:downvoted;"`
}

func (product *Product) Validate() bool {
	if product.Quantity <= 0 || product.Calories <= 0 {
		return false
	}
	return true
}
