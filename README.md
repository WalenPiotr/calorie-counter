# Calorie Counter App

## Features

-   User accounts with daily food dairies
-   Global product list
-   Product voting mechanism
-   Admin panel with option to ban user, remove and update products on global list

## Project structure

Whole application deployed with docker-compse on Digital Ocean droplet. Each part of application is designed as separate docker image:

-   database (postgres)
-   backend server (build with golang) (walenpiotr/cc-service)
-   user client (build with react and launched on node server) (walenpiotr/cc-client)
-   admin client (build with react and launched on node server) (walenpiotr/cc-admin)

## Live demo

If you want to test my app please go to:

### http://104.248.17.169/

Use following credentials to login: <br>
Email: kcalccountapp@gmail.com <br>
Password: zxcASDqwe123 <br>
