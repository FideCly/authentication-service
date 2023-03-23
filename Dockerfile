FROM node:latest
WORKDIR /authentication-service
COPY package.json ./
RUN npm install
COPY . ./
CMD npm run start:debug
EXPOSE 5000
