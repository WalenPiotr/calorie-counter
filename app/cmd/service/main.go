package main

import (
	"app/service"
)

func main() {
	err := service.NewService()
	if err != nil {
		panic(err)
	}
}
