all: up


up:
	@	docker-compose up -d
	
stop:
	@	docker-compose stop

clean:
	@	docker-compose down --remove-orphans -t 1
	@	docker-compose rm -f

status:
	@	docker-compose ps --all

.PHONY: all up clean status stop 
