package models

import (
	"database/sql"
	"strings"

	"github.com/pkg/errors"
)

type Product struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Creator int    `json:"creator"`
}

func MigrateProducts(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS products (
			id serial PRIMARY KEY,
			creator integer REFERENCES accounts(id),
			name text UNIQUE NOT NULL
		);
	`)
	if err != nil {
		return errors.Wrap(err, "While creating products table")
	}
	defer rows.Close()
	return nil
}

func CreateProduct(db *sql.DB, product Product) (*Product, error) {
	rows, err := db.Query(`
		INSERT INTO products (creator, name)
		VALUES ($1, $2)
		RETURNING *;
	`, product.Creator, strings.ToLower(product.Name))
	if err != nil {
		return nil, errors.Wrap(err, "While inserting to products table")
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name)
		if err != nil {
			return nil, err
		}
		prods = append(prods, prod)
	}
	if len(prods) != 1 {
		return nil, errors.Wrap(err, "Invalid return of insert operation")
	}
	return &prods[0], nil
}

func GetProducts(db *sql.DB) (*[]Product, error) {
	rows, err := db.Query(`
		SELECT * FROM products;
	`)
	if err != nil {
		return nil, errors.Wrap(err, "While querying for product by name")
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name)
		if err != nil {
			return nil, err
		}
		prods = append(prods, prod)
	}
	return &prods, nil
}

func GetProductById(db *sql.DB, id int) (*Product, error) {
	rows, err := db.Query(`
		SELECT * FROM products WHERE id=$1;
	`, id)
	if err != nil {
		return nil, errors.Wrap(err, "While querying for product by name")
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name)
		if err != nil {
			return nil, err
		}
		prods = append(prods, prod)
	}
	if len(prods) != 1 {
		return nil, errors.New("Duplicate products with same id in db")
	}
	return &prods[0], nil
}

func GetProductsByName(db *sql.DB, name string) (*[]Product, error) {
	rows, err := db.Query(`
		SELECT * FROM products WHERE name LIKE $1;
	`, "%"+strings.ToLower(name)+"%")
	if err != nil {
		return nil, errors.Wrap(err, "While querying for product by name")
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name)
		if err != nil {
			return nil, err
		}
		prods = append(prods, prod)
	}
	return &prods, nil
}

func GetProductsByCreatorID(db *sql.DB, id int) (*[]Product, error) {
	rows, err := db.Query(`
		SELECT * FROM products WHERE creator=$1
	`, id)
	if err != nil {
		return nil, errors.Wrap(err, "While querying for product by name")
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name)
		if err != nil {
			return nil, err
		}
		prods = append(prods, prod)
	}
	return &prods, nil
}

func DeleteProduct(db *sql.DB, id int) error {
	rows, err := db.Query(`
		DELETE FROM products WHERE id=$1 
	`, id)
	if err != nil {
		return errors.Wrap(err, "While deleting product")
	}
	defer rows.Close()
	return nil
}

func UpdateProduct(db *sql.DB, id int, new Product) (*Product, error) {
	rows, err := db.Query(`
		UPDATE products SET name=$2 WHERE id=$1 RETURNING *;;
	`, id, new.Name)
	if err != nil {
		return nil, errors.Wrap(err, "While updating product")
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name)
		if err != nil {
			return nil, err
		}
		prods = append(prods, prod)
	}
	if len(prods) != 1 {
		return nil, errors.New("Duplicate products with same name in db")
	}
	return &prods[0], nil
}
