# Build stage
FROM node:22-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage with Java and Node
FROM node:22-bookworm
WORKDIR /app

# Install Java runtime
RUN apt-get update \ 
  && apt-get install -y --no-install-recommends openjdk-17-jre-headless curl \ 
  && rm -rf /var/lib/apt/lists/*

# Fetch JSLT and runtime dependencies
RUN mkdir -p /opt/jslt && \
  curl -L -o /opt/jslt/jslt-0.1.14.jar https://repo1.maven.org/maven2/com/schibsted/spt/data/jslt/0.1.14/jslt-0.1.14.jar && \
  curl -L -o /opt/jslt/jackson-databind-2.13.4.2.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.13.4.2/jackson-databind-2.13.4.2.jar && \
  curl -L -o /opt/jslt/jackson-annotations-2.13.4.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.13.4/jackson-annotations-2.13.4.jar && \
  curl -L -o /opt/jslt/jackson-core-2.13.4.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.13.4/jackson-core-2.13.4.jar

ENV JSLT_JAR_DIR=/opt/jslt
ENV JSLT_CLASSPATH=/opt/jslt/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server

EXPOSE 8080
CMD ["npm", "run", "start"]
