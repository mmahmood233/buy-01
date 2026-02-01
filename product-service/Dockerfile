FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn install -N
COPY product-service/pom.xml ./product-service/
COPY product-service/src ./product-service/src
RUN mvn -f product-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/product-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
