# E-Commerce Microservices Platform

## Architecture
- **User Microservice**: Handles user registration, authentication, and profile management
- **Product Microservice**: Manages product CRUD operations (seller-only)
- **Media Microservice**: Handles image uploads with validation (2MB limit)
- **Frontend**: Angular application for user interface

## Technology Stack
- Spring Boot 3.x
- MongoDB
- Apache Kafka
- Spring Security with JWT
- Angular 17+
- Docker & Docker Compose

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Java 17+
- Node.js 18+
- Maven 3.8+

### Running with Docker
```bash
docker-compose up -d
```

### Services
- User Service: http://localhost:8081
- Product Service: http://localhost:8082
- Media Service: http://localhost:8083
- Frontend: http://localhost:4200
- MongoDB: localhost:27017
- Kafka: localhost:9092

## Project Structure
```
buy-01/
├── user-service/
├── product-service/
├── media-service/
├── frontend/
├── docker-compose.yml
└── pom.xml
```

## Security Features
- Password hashing with BCrypt
- JWT-based authentication
- Role-based access control (CLIENT/SELLER)
- HTTPS encryption
- Input validation
- File upload validation

## Testing
Use Postman collection provided in `/postman` directory for API testing.
