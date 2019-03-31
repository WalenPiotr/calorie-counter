package models

import (
	"database/sql"
	"math"
	"strings"

	"github.com/pkg/errors"
)

type Product struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Creator     int    `json:"creator"`
	Description string `json:"description"`
}

func MigrateProducts(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS products (
			id serial PRIMARY KEY,
			creator integer REFERENCES accounts(id),
			name text NOT NULL,
			description text
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
		INSERT INTO products (creator, name, description)
		VALUES ($1, $2, $3)
		RETURNING *;
	`, product.Creator, strings.ToLower(product.Name), product.Description)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Description)
		if err != nil {
			return nil, err
		}
		prods = append(prods, prod)
	}
	return &prods[0], nil
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
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Description)
		if err != nil {
			return nil, err
		}
		prods = append(prods, prod)
	}
	return &prods[0], nil
}

func GetProductsByName(db *sql.DB, name string, pagination Pagination) (*[]Product, *Pagination, error) {
	rows, err := db.Query(`
		SELECT * FROM products WHERE name LIKE $1 ORDER BY name, id ASC LIMIT $2 OFFSET $3;;
	`, "%"+strings.ToLower(name)+"%", pagination.ItemsPerPage, pagination.ItemsPerPage*pagination.Page)
	if err != nil {
		return nil, nil, errors.Wrap(err, "While querying for product by name")
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Description)
		if err != nil {
			return nil, nil, err
		}
		prods = append(prods, prod)
	}
	var count int
	row := db.QueryRow("SELECT COUNT(*) FROM products")
	err = row.Scan(&count)
	if err != nil {
		return nil, nil, err
	}
	maxPage := int(math.Ceil(float64(count)/float64(pagination.ItemsPerPage)) - 1)
	newPagination := Pagination{
		ItemsPerPage: pagination.ItemsPerPage,
		Page:         pagination.Page,
		MaxPage:      maxPage,
	}
	return &prods, &newPagination, nil
}

func GetProductsByCreatorID(db *sql.DB, id int, pagination Pagination) (*[]Product, *Pagination, error) {
	rows, err := db.Query(`
		SELECT * FROM products WHERE creator=$1 ORDER BY name, id ASC LIMIT $2 OFFSET $3;
	`, id, pagination.ItemsPerPage, pagination.ItemsPerPage*pagination.Page)
	if err != nil {
		return nil, nil, errors.Wrap(err, "While querying for product by name")
	}
	defer rows.Close()
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Description)
		if err != nil {
			return nil, nil, err
		}
		prods = append(prods, prod)
	}
	var count int
	row := db.QueryRow("SELECT COUNT(*) FROM products")
	err = row.Scan(&count)
	if err != nil {
		return nil, nil, err
	}
	maxPage := int(math.Ceil(float64(count)/float64(pagination.ItemsPerPage)) - 1)
	newPagination := Pagination{
		ItemsPerPage: pagination.ItemsPerPage,
		Page:         pagination.Page,
		MaxPage:      maxPage,
	}
	return &prods, &newPagination, nil
}

func DeleteProduct(db *sql.DB, id int) error {
	rows, err := db.Query(`
		DELETE FROM entries WHERE product_id=$1;
	`, id)
	if err != nil {
		return errors.Wrap(err, "While deleting product")
	}
	defer rows.Close()
	rows, err = db.Query(`
		DELETE FROM portions WHERE product_id=$1;
	`, id)
	if err != nil {
		return errors.Wrap(err, "While deleting product")
	}
	defer rows.Close()
	rows, err = db.Query(`
		DELETE FROM votes WHERE product_id=$1; 
	`, id)
	if err != nil {
		return errors.Wrap(err, "While deleting product")
	}
	defer rows.Close()
	rows, err = db.Query(`
		DELETE FROM products WHERE id=$1; 
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
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Description)
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
