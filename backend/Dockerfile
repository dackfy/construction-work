FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && node dist/src/server.js"]
