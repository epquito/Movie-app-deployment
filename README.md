# Docker deployment of Node.js 3 Tier website
## Final product on how directory tree should look 
```bash
.
├── README.md
├── backend
│   ├── Dockerfile
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
└── init_sql_scripts
    └── init.sql
```
## Create two dockerfiles for Backend and Frontend directories
- backend/Dockerfile:
```bash
# choose base image 
FROM node:10-alpine
# select working directory first so the following commands can my executed in the right directory
WORKDIR /app
# copies specific files from local machine and adds it to the container
COPY package*.json .
# installs all dependecies
RUN npm install 
# copies all files from local machine within the directory of the dockerfile and places it within container
COPY . .
# exposing port 3001
EXPOSE 3001
# actiavtes application 
CMD [ "node","index.js" ] 
```
- frontend/Dockerfile:
```bash
# choose base image 
FROM node:10-alpine
# select working directory first so the following commands can my executed in the right directory
WORKDIR /app
# copies specific files from local machine and adds it to the container
COPY package*.json .
# installs all dependecies
RUN npm install
# copies all files from local machine within the directory of the dockerfile and places it within container
COPY . .
# exposing port 3001
EXPOSE 3000
# activates application 
CMD [ "node", "index.js" ]

```
## Create a ".env" file in the root directory to store sensitve information that will allow you to change using docker compose file
```bash
touch .env
```
- Inside the .env file you need 4 variables
```bash
DB_NAME=
URL=
FRONT_END_PORT=
BACKEND_PORT=
```

## Create docker-compose.yml file inside root directory
```bash
version: "3"
services:
  frontend:
    container_name: "frontend"
    # executes dockerfile within directory 
    build:
      context: frontend
    # opens up port 
    ports:
      - "3000:3000"
    # changes env values
    environment:
      - URL=
      - FRONT_END_PORT=
    # select specific network bridge
    networks:
      - movie-networks
    # won't start until db and backend are created
    depends_on:
      - db
      - backend
  backend:
    container_name: "backend"
    # executes docker file within directory
    build:
      context: backend
    # open ports
    ports:
      - "3001:3001"
    # changes env values
    environment:
      - DB_NAME=
      - BACKEND_PORT=
    # selects specific network bridge
    networks:
      - movie-networks
    # waits unitil db is healthy
    depends_on:
      db:
        condition: service_healthy
  db:
    # select base image for db
    image: "postgres:11.2-alpine"
    container_name: "database"
    # open ports
    ports:
      - "5432:5432"
    # select cutom network
    networks:
      - movie-networks
    # creates db with the env stated below
    environment:
      - POSTGRES_USER=
      - POSTGRES_PASSWORD=
      - POSTGRES_DB=
    # runs a health check to make ure postgresql is running and the database is created and user
    healthcheck:
      test: ["CMD","pg_isready","-q","-d","","-U",""]
      timeout: 20s
      retries: 10
    volumes:
        # bind mounts from local machine directory stated to the container and executes the script 
      - ./init_sql_scripts:/docker-entrypoint-initdb.d 
        # uses th volume name and mounts the postgresql data /config to ensure data persistancy
      - movies-postgres:/var/lib/postgresql/data
      - movies-postgres-config:/etc/postgresql

# volumes created do be mounted for db 
volumes:
  movies-postgres:
  movies-postgres-config:

networks:
# created custom bridge network 
  movie-networks:
    name: movie-networks
    driver: bridge
```
- Removed environment information so it's easier to copy and paste 

##  Execute the docker compose file you need the following comamnd
```bash
docker compose up --build
```
## Getting rid of container with their volumes
```bash
docker compose down --volumes
```
## Once all dockerfiles are done and provisioned you can start on the CI portion with github actions 

- Create a new directory within the root directory and name it ".github"

- Within the knewly created directory create a new directory "workflows" that will stored your github actions yml file

- Inside workflows create a file "name_of_file.yml"
- name_of_file.yml:
```bash
name: Build and Push Docker Image

on:
# the action will execute when you push from local to remote repo on main branch
  push:
    branches:
      - main
# taking github secrets that been declared and using the within build in method "env"
env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
# creating a job to execute
jobs:
# naming of job
  build_and_push:
# runs on a specific op
    runs-on: ubuntu-latest
# steps within jobs to execute 
    steps:
# naming the steps that will execute
      - name: Checkout repository
# using a specific github action within marketplace
        uses: actions/checkout@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1
# login in to docker hub using credentials already stated in the "env" method
      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ env.DOCKER_USERNAME }}
          password: ${{ env.DOCKER_PASSWORD }}
# build and pushes images from dockerfile within specific directory stated and populates inside docker hub account
      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          file: backend/Dockerfile
          push: true
          tags: ${{ env.DOCKER_USERNAME }}/movie:backend

      - name: Build and push Docker image for frontend
        uses: docker/build-push-action@v2
        with:
          context: .
          file: frontend/Dockerfile
          push: true
          tags: ${{ env.DOCKER_USERNAME }}/movie:frontend
```
## To execute this github actions you need to push to your remote repo
```bash
git add .
git commit -m "test1"
git push origin master/main # or whatever name you gived the current branch
```
