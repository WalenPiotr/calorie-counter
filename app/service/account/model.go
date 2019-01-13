package account

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
}
