build-client: 
	cd client && npm run build 
copy-static:
	rm -rf app/static && cp -r client/dist app/static
compose-up:
	docker-compose up --build
run: build-client copy-static compose-up