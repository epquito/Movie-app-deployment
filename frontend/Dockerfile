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


