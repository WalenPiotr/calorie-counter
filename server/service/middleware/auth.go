package middleware

import (
	"app/service/auth"
	"encoding/json"
	"net/http"

	"context"
	"os"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/pkg/errors"
)

type ResponseObject struct {
	Status int    `json:"status"`
	Error  string `json:"error"`
}

func (res *ResponseObject) Send(w http.ResponseWriter) {
	if res.Status != 0 {
		w.WriteHeader(res.Status)
	}
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(*res)
}

func WithAuth(next http.Handler, accessLevel auth.AccessLevel) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header
		if accessLevel == auth.Default {
			next.ServeHTTP(w, r)
			return
		}
		token, err := authenticateUser(header)
		if err != nil {
			resObj := ResponseObject{
				Status: http.StatusForbidden,
				Error:  err.Error(),
			}
			resObj.Send(w)
			return
		}
		if token.AccessLevel < 0 {
			w.WriteHeader(http.StatusForbidden)
			resObj := ResponseObject{
				Status: http.StatusForbidden,
				Error:  "You accound have been banished",
			}
			resObj.Send(w)
			return
		}
		//Everything went well, proceed with the request and set the caller to the user retrieved from the parsed token
		if token.AccessLevel >= accessLevel {
			ctx := context.WithValue(r.Context(), UserID, token.UserID)
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r) //proceed in the middleware chain!
			return
		}
		w.WriteHeader(http.StatusForbidden)
		resObj := ResponseObject{
			Status: http.StatusForbidden,
			Error:  "Access denied",
		}
		resObj.Send(w)
		return
	})
}

func authenticateUser(header http.Header) (token *auth.Token, err error) {
	tokenPassword := os.Getenv("TOKEN_PASS")
	tokenHeader := header.Get("Authorization") //Grab the token from the header
	if tokenHeader == "" {                     //Token is missing, returns with error code 403 Unauthorized
		err := errors.New("Missing authentication token")
		return nil, err
	}
	splitted := strings.Split(tokenHeader, " ") //The token normally comes in format `Bearer {token-body}`, we check if the retrieved token matched this requirement
	if len(splitted) != 2 {
		err := errors.New("Invalid format of authentication token")
		return nil, err
	}
	tokenPart := splitted[1] //Grab the token part, what we are truly interested in
	token = &auth.Token{}
	jwtToken, err := jwt.ParseWithClaims(tokenPart, token, func(token *jwt.Token) (interface{}, error) {
		return []byte(tokenPassword), nil
	})
	if err != nil { //Malformed token, returns with http code 403 as usual
		err := errors.New("Malformed authentication token")
		return nil, err
	}
	if !jwtToken.Valid { //Token is invalid, maybe not signed on this server
		err := errors.New("Token is invalid")
		return nil, err
	}
	return token, nil
}

type key int

const (
	UserID key = iota
)