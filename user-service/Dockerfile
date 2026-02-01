FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn install -N
COPY user-service/pom.xml ./user-service/
COPY user-service/src ./user-service/src
RUN mvn -f user-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/user-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
