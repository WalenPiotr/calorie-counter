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
	Created     []*Product        `gorm:"foreignkey:Creator"`
	Added       []*Product        `gorm:"many2many:added;"`
	Upvoted     []*Product        `gorm:"many2many:upvoted;"`
	Downvoted   []*Product        `gorm:"many2many:downvoted;"`
}
