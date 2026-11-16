# Cloud Run image: build the Vite site, then serve it with server.mjs.
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json server.mjs ./
COPY api ./api
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "server.mjs"]
