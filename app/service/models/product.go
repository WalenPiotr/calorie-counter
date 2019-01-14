package models

import (
	"database/sql"

	"github.com/pkg/errors"
)

type Product struct {
	ID       int
	Name     string  `json:"name"`
	Quantity float64 `json:"quantity"`
	Unit     string  `json:"unit"`
	Energy   float64 `json:"calories"`
	Creator  int
}

func (product *Product) Validate() bool {
	if product.Quantity <= 0 || product.Energy <= 0 {
		return false
	}
	return true
}

func MigrateProducts(db *sql.DB) error {
	rows, err := db.Query(`
		CREATE TABLE IF NOT EXISTS products (
			id serial primary key,
			creator integer references accounts(id),
			name text unique, 
			quantity decimal, 
			unit text, 
			energy decimal
		);
	`)
	defer rows.Close()
	if err != nil {
		return errors.Wrap(err, "While creating products table")
	}
	return nil
}

func CreateProduct(db *sql.DB, product Product) error {
	rows, err := db.Query(`
		INSERT INTO products (creator, name, quantity, unit, energy)
		VALUES ($1, $2, $3, $4, $5);
	`, product.Creator, product.Name, product.Quantity, product.Unit, product.Energy)
	defer rows.Close()
	if err != nil {
		return errors.Wrap(err, "While inserting to products table")
	}
	return nil
}

func GetProducts(db *sql.DB) (*[]Product, error) {
	rows, err := db.Query(`
		SELECT * FROM products WHERE id=$1;
	`)
	defer rows.Close()
	if err != nil {
		return nil, errors.Wrap(err, "While querying for product by name")
	}
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Quantity, &prod.Unit, &prod.Energy)
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
	defer rows.Close()
	if err != nil {
		return nil, errors.Wrap(err, "While querying for product by name")
	}

	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Quantity, &prod.Unit, &prod.Energy)
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

func GetProductByName(db *sql.DB, name string) (*Product, error) {
	rows, err := db.Query(`
		SELECT * FROM products WHERE name LIKE $1;
	`, "%"+name+"%")
	defer rows.Close()
	if err != nil {
		return nil, errors.Wrap(err, "While querying for product by name")
	}

	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Quantity, &prod.Unit, &prod.Energy)
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

func GetProductsByCreatorID(db *sql.DB, id int) (*[]Product, error) {
	rows, err := db.Query(`
		SELECT * FROM products WHERE creator=$1
	`, id)
	defer rows.Close()
	if err != nil {
		return nil, errors.Wrap(err, "While querying for product by name")
	}
	prods := []Product{}
	for rows.Next() {
		prod := Product{}
		err := rows.Scan(&prod.ID, &prod.Creator, &prod.Name, &prod.Quantity, &prod.Unit, &prod.Energy)
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
	defer rows.Close()
	if err != nil {
		return errors.Wrap(err, "While deleting product")
	}
	return nil
}

func UpdateProduct(db *sql.DB, id int, new Product) error {
	rows, err := db.Query(`
		UPDATE products SET name=$2, quantity=$3, unit=$4, energy=$5 WHERE id=$1;
	`, id, new.Name, new.Quantity, new.Unit, new.Energy)
	defer rows.Close()
	if err != nil {
		return errors.Wrap(err, "While deleting product")
	}
	return nil
}
