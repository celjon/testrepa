run:
	docker compose up -d --force-recreate db_dev redis_dev
	bun start:dev

run-dev:
	docker compose up -d  --force-recreate db_dev redis_dev
	docker compose up --force-recreate --build api_dev