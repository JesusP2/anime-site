FROM node:20.17-alpine

WORKDIR /usr/dir/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g corepack@latest && corepack enable && corepack prepare pnpm@latest-9 --activate && pnpm install --frozen-lockfile && pnpm build

USER node

COPY --chown=node:node . .

# EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
