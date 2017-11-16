PHONY: build run

CONTAINER_NAME=sensornetz
INSTANCE_NAME=sensornetz-backend

all:
	make build
	make run

build:
	$(info Building the docker container…)
	docker build -t $(CONTAINER_NAME) .

run:
	$(info Run the docker container…)
	docker run -it --rm -p 5238:5238 --name $(INSTANCE_NAME) $(CONTAINER_NAME)