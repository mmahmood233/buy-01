# Quick Start Guide - E-Commerce Microservices Platform

## 🚀 Fast Setup (5 Minutes)

### Prerequisites Check
```bash
java -version    # Should be 17+
mvn -version     # Should be 3.8+
node -version    # Should be 18+
docker --version # Should be installed
```

---

## Step 1: Start Infrastructure (2 min)

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01

# Start MongoDB and Kafka
docker-compose up -d

# Wait 30 seconds for services to initialize
sleep 30

# Verify
docker ps
```

---

## Step 2: Start Backend Services (2 min)

**Terminal 1 - User Service:**
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/user-service
mvn spring-boot:run
# Wait for: "Started UserServiceApplication" on port 8081
```

**Terminal 2 - Product Service:**
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/product-service
mvn spring-boot:run
# Wait for: "Started ProductServiceApplication" on port 8082
```

**Terminal 3 - Media Service:**
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/media-service
mvn spring-boot:run
# Wait for: "Started MediaServiceApplication" on port 8083
```

---

## Step 3: Start Frontend (1 min)

**Terminal 4 - Angular Frontend:**
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/frontend
npx ng serve --port 4200
# Wait for: "Compiled successfully"
```

---

## Step 4: Test the Application

### Open Browser
Navigate to: **http://localhost:4200**

### Test Flow
1. **Register as Seller:**
   - Go to Register page
   - Name: "Test Seller"
   - Email: "seller@test.com"
   - Password: "password123"
   - Role: SELLER
   - Click Register

2. **Access Dashboard:**
   - Click "Dashboard" in navbar
   - Click "Add New Product"

3. **Create Product:**
   - Name: "Laptop Pro"
   - Description: "High-performance laptop for professionals"
   - Price: 1299.99
   - Quantity: 10
   - Click Save

4. **Upload Image:**
   - Click "Manage Images" on your product
   - Upload a test image (max 2MB)
   - Image appears in grid

5. **View Products:**
   - Click "Products" in navbar
   - See your product listed

---

## Quick API Test

```bash
# Register user
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test",
    "email": "api@test.com",
    "password": "test123",
    "role": "SELLER"
  }'

# Copy the token from response, then:
export TOKEN="<your-jwt-token>"

# Create product
curl -X POST http://localhost:8082/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "API created product",
    "price": 99.99,
    "quantity": 5
  }'

# List all products
curl http://localhost:8082/api/products
```

---

## Service URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:4200 | 4200 |
| User Service | http://localhost:8081 | 8081 |
| Product Service | http://localhost:8082 | 8082 |
| Media Service | http://localhost:8083 | 8083 |
| MongoDB | mongodb://localhost:27017 | 27017 |
| Kafka | localhost:9092 | 9092 |

---

## Stop Everything

```bash
# Stop backend services: Ctrl+C in each terminal

# Stop infrastructure
cd /Users/mohammed/Desktop/Reboot/Java/buy-01
docker-compose down
```

---

## Troubleshooting

**Port already in use:**
```bash
lsof -i :8081  # Find process
kill -9 <PID>  # Kill it
```

**MongoDB not connecting:**
```bash
docker restart <mongodb-container-id>
```

**Frontend not loading:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npx ng serve
```

**JWT token issues:**
- Re-login to get fresh token
- Check JWT_SECRET is set in application.yml

---

## What's Working

✅ User registration and authentication  
✅ JWT-based security  
✅ Product CRUD operations (Seller only)  
✅ Media upload/delete with validation  
✅ Kafka event-driven architecture  
✅ Cascade deletion (User → Products → Media)  
✅ Role-based access control  
✅ Angular frontend with reactive forms  
✅ Seller dashboard with product management  

---

## Architecture Overview

```
┌─────────────┐
│   Angular   │ :4200
│  Frontend   │
└──────┬──────┘
       │ HTTP + JWT
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐
│    User     │ │ Product  │ │   Media     │ │  Kafka   │
│  Service    │ │ Service  │ │  Service    │ │  Events  │
│   :8081     │ │  :8082   │ │   :8083     │ │  :9092   │
└──────┬──────┘ └────┬─────┘ └──────┬──────┘ └────┬─────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
               ┌──────▼──────┐
               │   MongoDB   │
               │    :27017   │
               └─────────────┘
```

---

For detailed testing instructions, see: **TESTING_GUIDE.md**
