FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json nest-cli.json tsconfig.json ./
RUN npm ci
COPY apps ./apps
COPY libs ./libs
ARG APP_NAME
RUN npx nest build ${APP_NAME}

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
COPY --from=builder /app/dist ./dist
USER node
CMD ["sh", "-c", "node dist/apps/${APP_NAME}/apps/${APP_NAME}/src/main.js"]
