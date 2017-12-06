PHONY: build run

CONTAINER_NAME=sensornetz
INSTANCE_NAME=sensornetz-backend

all:
	make build
	make run

build:
	$(info Building the docker container…)
	docker build -t $(CONTAINER_NAME) .

debug:
	make build
	$(info Run the docker container in debug mode...)
	docker run -e MODE=debug -it --rm --net=host -p 5238:5238 -p 5683:5683 --name $(INSTANCE_NAME) $(CONTAINER_NAME)

run:
	$(info Run the docker container…)
	docker run -it --rm --net=host -p 5238:5238 -p 5683:5683 --name $(INSTANCE_NAME) $(CONTAINER_NAME)
