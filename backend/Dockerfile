 FROM maven:3.8.6-eclipse-temurin-17 AS builder
 WORKDIR /app
 COPY pom.xml .
 RUN mvn dependency:go-offline -B
 COPY src ./src
 RUN mvn clean package -Dmaven.test.skip=true

 # Étape 2 : Création de l'image d'exécution
 FROM eclipse-temurin:17-jdk-alpine
 WORKDIR /app
 COPY --from=builder /app/target/*.jar app.jar
 EXPOSE 8080
 ENTRYPOINT ["java", "-jar", "app.jar"]