package auth

import jwt "github.com/dgrijalva/jwt-go"

type Token struct {
	UserID      int
	AccessLevel AccessLevel
	jwt.StandardClaims
}

type AccessLevel int

const (
	Banned AccessLevel = iota - 1
	Default
	User
	Moderator
	Admin
)
