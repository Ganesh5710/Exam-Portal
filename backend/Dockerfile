FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN node -e "const fs=require('fs'),path=require('path');function c(s,d){if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});fs.readdirSync(s).forEach(i=>{const sp=path.join(s,i),dp=path.join(d,i);if(fs.statSync(sp).isDirectory())c(sp,dp);else fs.copyFileSync(sp,dp);})}c('./src','./dist');"

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src ./src

# Create uploads folder
RUN mkdir -p uploads

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "src/index.js"]
