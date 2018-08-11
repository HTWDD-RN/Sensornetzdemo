PHONY: build run

CONTAINER_NAME=sensornetz
INSTANCE_NAME=sensornetz-fhem

all:
	make build
	make run

build:
	$(info Building the docker container…)
	docker build -t $(CONTAINER_NAME) .

run:
	$(info Run the docker container…)
	docker run -it --rm --net=host -p 8083:8083 -p 8088:8088 --name $(INSTANCE_NAME) $(CONTAINER_NAME)

# -it										for interactive processes (like a shell)
# no -d Option => 				container runs in foreground
# --rm										automatically clean up the container and remove the file system when the container exits
# --net=host							use the host's network stack inside the container
# --name									defines a name for instance and container (see below)
# -p											binds port from host to container
# docker exec -i -t sensornetz-fhem /bin/bash
