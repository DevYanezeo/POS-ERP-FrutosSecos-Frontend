FROM node:18-alpine AS build
WORKDIR /app

# build-time arg so we can bake the public API base into the client bundle
ARG NEXT_PUBLIC_API_BASE
# expose it as an env var during build so Next.js can read it when building
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}

COPY package*.json ./
RUN npm install

COPY . .
# Build Next.js (produces .next) — this will pick up NEXT_PUBLIC_API_BASE from env
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only what's needed to run the app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
# Start Next.js in production mode
CMD ["node","node_modules/next/dist/bin/next","start"]