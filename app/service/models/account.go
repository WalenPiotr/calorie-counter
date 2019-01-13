package models

import (
	"app/service/auth"

	"github.com/jinzhu/gorm"
)

// Account struct is used to represent user acc
type Account struct {
	gorm.Model
	Email       string           `json:"email"`
	Password    string           `json:"password"`
	AccessLevel auth.AccessLevel `json:"-"`
	Created     []Product        `gorm:"foreignkey:Creator"`
	Added       []Product        `gorm:"many2many:Added;"`
	Upvoted     []Product        `gorm:"many2many:Upvoted;"`
	Downvoted   []Product        `gorm:"many2many:Downvoted;"`
}
