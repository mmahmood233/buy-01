FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn install -N
COPY media-service/pom.xml ./media-service/
COPY media-service/src ./media-service/src
RUN mvn -f media-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN mkdir -p /app/uploads
COPY --from=build /build/media-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
