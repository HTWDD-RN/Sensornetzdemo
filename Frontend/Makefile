.PHONY: build run

CONTAINER_NAME=sensornetz
INSTANCE_NAME=sensornetz-frontend

all:
	make build
	make run

build:
	$(info Building the docker container…)
	docker build -t $(CONTAINER_NAME) .

run:
	$(info Run the docker container…)
	docker run -it --rm -p 5000:5000 --name $(INSTANCE_NAME) $(CONTAINER_NAME)

tempdeploy:
	$(info Deploy to a temporary server (might need access rights to the server ;))
	yarn build
	scp -r ./build/* benchr@bootes.uberspace.de:html/sensornetze
