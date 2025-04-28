FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install client dependencies
RUN mkdir -p /temp/client
COPY client/package.json client/bun.lock /temp/client/
RUN cd /temp/client && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/client/node_modules client/node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
# Copy the entire server/src directory to maintain imports
COPY --from=prerelease /usr/src/app/server/src ./server/src
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/drizzle ./drizzle
COPY --from=prerelease /usr/src/app/drizzle.config.ts .
COPY --from=prerelease /usr/src/app/client/dist ./client/dist
# Copy environment variables file if needed
COPY --from=prerelease /usr/src/app/.env .

# Add healthcheck to monitor app status
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bun --eval "try { fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)) } catch (e) { process.exit(1) }"

# run the app
USER bun
EXPOSE 4000/tcp
# Update the path to match the copied structure
ENTRYPOINT [ "bun", "run", "server/src/index.ts" ]