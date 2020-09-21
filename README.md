# ASKE Uncharted HMI
![client](https://github.com/uncharted-aske/HMI/workflows/client/badge.svg)

Uncharted's Human Machine Interface for the DARPA ASKE program is designed to support visual exploration, curation, construction and execution of meta-models in a number of scientific domains.

## Setup
```shell script
yarn install
```

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
