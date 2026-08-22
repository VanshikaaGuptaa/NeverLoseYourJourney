# ---- Dockerfile for the Spring Boot backend ----
# Build stage – use Maven with JDK 21 to compile the project
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only the pom and resolve dependencies first (caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the jar (skip tests for faster image)
COPY src ./src
RUN mvn -B -DskipTests package

# Runtime stage – slim JRE image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Pull the fat jar from the build stage
COPY --from=build /app/target/journey-0.0.1-SNAPSHOT.jar app.jar

# Expose the port defined in application.yml (8000)
EXPOSE 8000

# Default command
ENTRYPOINT ["java","-jar","app.jar"]
