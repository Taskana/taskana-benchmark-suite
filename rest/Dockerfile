FROM node:lts-alpine3.16

WORKDIR /usr/src/app

COPY package*.json ./

RUN curl https://sh.rustup.rs -sSf | sh /dev/stdin -y

ENV PATH="$PATH:/root/.cargo/bin"

RUN npm ci --only=production

COPY . .

RUN npm run build

CMD [ "npm", "start" ]
