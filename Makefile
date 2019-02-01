compose-devel:
	docker-compose -f dc-devel.yml up --build
compose-prod:
	docker-compose -f dc-prod.yml up