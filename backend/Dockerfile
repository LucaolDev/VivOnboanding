FROM node:20

WORKDIR /app

COPY package*.json ./

# Instala nodemon globalmente (importante!)
RUN npm install 

# Instala as dependências do projeto
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
