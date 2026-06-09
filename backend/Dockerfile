FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# 1. Copiar SOLO el pom.xml primero
COPY pom.xml .

# 2. Descargar las dependencias usando el 'mvn' global de la imagen
RUN mvn dependency:go-offline -B

# 3. Copiar el código fuente y compilar con 'mvn'
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
EXPOSE 8080
COPY --from=builder /app/target/freshbasket-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]