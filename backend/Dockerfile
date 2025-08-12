FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon
RUN chmod +x entrypoint.sh

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]
