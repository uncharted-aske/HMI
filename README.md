# ASKE Uncharted HMI
![client](https://github.com/uncharted-aske/HMI/workflows/client/badge.svg)

Uncharted's Human Machine Interface for the DARPA ASKE program is designed to support visual exploration, curation, construction and execution of meta-models in a number of scientific domains.

## Setup
```shell script
yarn install
```

A `.env` file containing environment variables necessary for the application's operation must be placed under `./client/`. The repository contains a template `.env` file containing all the keys the application expects with dummy values. The fully populated `.env` file must not be be pushed to the repository. It is recommended that tracking of the `.env` file is halted using the command `git update-index --assume-unchanged client/.env` in order to prevent accidental addition to the commit history.

## Local Docker Swarm Deployment
Build docker images:
```shell script
docker build -t docker.uncharted.software/uncharted-aske/hmi/client -f Dockerfile.client .
```

Start docker swarm and deploy stack:
```shell script
docker swarm init
docker stack deploy -c docker-compose.yml aske-hmi
```
