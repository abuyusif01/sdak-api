#image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Port
EXPOSE 8081

# Run
CMD [ "npm", "start" ]

