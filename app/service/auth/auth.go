package auth

import (
	"app/service/models"
	"encoding/json"
	"net/http"

	"context"
	"fmt"
	"os"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/pkg/errors"
)

type Data struct{}
type ResponseObject struct {
	Status int    `json:"email"`
	Error  string `json:"error"`
	Data   Data   `json:"data"`
}

func (res *ResponseObject) Send(w http.ResponseWriter) {
	if res.Status != 0 {
		w.WriteHeader(res.Status)
	}
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(*res)
}

func JwtAuthentication(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenPassword := os.Getenv("TOKEN_PASS")

		notAuth := []string{"/api/user/new", "/api/user/login"} //List of endpoints that doesn't require auth
		requestPath := r.URL.Path                               //current request path

		//check if request does not need authentication, serve the request if it doesn't need it
		for _, value := range notAuth {
			if value == requestPath {
				next.ServeHTTP(w, r)
				return
			}
		}

		tokenHeader := r.Header.Get("Authorization") //Grab the token from the header

		if tokenHeader == "" { //Token is missing, returns with error code 403 Unauthorized
			err := errors.New("Missing authentication token")
			resObj := ResponseObject{
				Status: http.StatusForbidden,
				Error:  err.Error(),
			}
			resObj.Send(w)
			return
		}

		splitted := strings.Split(tokenHeader, " ") //The token normally comes in format `Bearer {token-body}`, we check if the retrieved token matched this requirement
		if len(splitted) != 2 {
			err := errors.New("Invalid format of authentication token")
			resObj := ResponseObject{
				Status: http.StatusForbidden,
				Error:  err.Error(),
			}
			resObj.Send(w)
			return
		}

		tokenPart := splitted[1] //Grab the token part, what we are truly interested in
		tk := &models.Token{}

		token, err := jwt.ParseWithClaims(tokenPart, tk, func(token *jwt.Token) (interface{}, error) {
			return []byte(tokenPassword), nil
		})

		if err != nil { //Malformed token, returns with http code 403 as usual
			err := errors.New("Malformed authentication token")
			resObj := ResponseObject{
				Status: http.StatusForbidden,
				Error:  err.Error(),
			}
			resObj.Send(w)
			return
		}

		if !token.Valid { //Token is invalid, maybe not signed on this server
			err := errors.New("Token is invalid")
			resObj := ResponseObject{
				Status: http.StatusForbidden,
				Error:  err.Error(),
			}
			resObj.Send(w)
			return
		}
		//Everything went well, proceed with the request and set the caller to the user retrieved from the parsed token
		fmt.Println("User %", tk.UserID) //Useful for monitoring

		ctx := context.WithValue(r.Context(), UserID, tk.UserID)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r) //proceed in the middleware chain!
	})
}

type key int

const (
	UserID key = iota
)
