# Testing Guide - E-Commerce Microservices Platform

## Prerequisites

### Required Software
- Java 17+
- Maven 3.8+
- Node.js 18+ and npm
- Docker and Docker Compose
- MongoDB (via Docker)
- Kafka (via Docker)
- Postman or curl (for API testing)

### Environment Variables
Create `.env` file in project root:
```env
JWT_SECRET=your-secret-key-min-256-bits-long-change-in-production
MONGO_USER_DB=userdb
MONGO_PRODUCT_DB=productdb
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

---

## Phase 1: Infrastructure Setup

### Step 1.1: Start MongoDB and Kafka with Docker Compose

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01

# Start all infrastructure services
docker-compose up -d

# Verify services are running
docker ps

# Expected output: MongoDB, Zookeeper, Kafka containers running
```

### Step 1.2: Verify MongoDB

```bash
# Connect to MongoDB
docker exec -it <mongodb-container-id> mongosh

# In MongoDB shell:
show dbs
use userdb
use productdb

# Exit MongoDB shell
exit
```

### Step 1.3: Verify Kafka

```bash
# List Kafka topics (should be empty initially)
docker exec -it <kafka-container-id> kafka-topics --list --bootstrap-server localhost:9092

# Topics will be auto-created when services start publishing events
```

---

## Phase 2: Backend Services Testing

### Step 2.1: Build All Services

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01

# Build parent POM and all modules
mvn clean install

# Expected output: BUILD SUCCESS for all modules
```

### Step 2.2: Start User Service

```bash
cd user-service
mvn spring-boot:run

# Service should start on port 8081
# Look for: "Started UserServiceApplication"
```

**Test User Service Endpoints:**

```bash
# Health check
curl http://localhost:8081/actuator/health

# Register a BUYER user
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Buyer",
    "email": "buyer@test.com",
    "password": "password123",
    "role": "BUYER"
  }'

# Expected: 200 OK with JWT token and user details

# Register a SELLER user
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Seller",
    "email": "seller@test.com",
    "password": "password123",
    "role": "SELLER"
  }'

# Save the JWT token from response for next steps
export SELLER_TOKEN="<jwt-token-from-response>"

# Login test
curl -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@test.com",
    "password": "password123"
  }'

# Get user profile (requires authentication)
curl http://localhost:8081/api/users/profile \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

### Step 2.3: Start Product Service

**Open new terminal:**

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/product-service
mvn spring-boot:run

# Service should start on port 8082
# Look for: "Started ProductServiceApplication"
```

**Test Product Service Endpoints:**

```bash
# Create a product (SELLER only)
curl -X POST http://localhost:8082/api/products \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro 15",
    "description": "High-performance laptop with 16GB RAM and 512GB SSD",
    "price": 1299.99,
    "quantity": 10
  }'

# Expected: 201 Created with product details
# Save productId from response
export PRODUCT_ID="<product-id-from-response>"

# Get all products (public endpoint)
curl http://localhost:8082/api/products

# Get product by ID
curl http://localhost:8082/api/products/$PRODUCT_ID

# Get products by seller (requires auth)
curl http://localhost:8082/api/products/user \
  -H "Authorization: Bearer $SELLER_TOKEN"

# Update product (SELLER only, must own product)
curl -X PUT http://localhost:8082/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro 15 - Updated",
    "description": "High-performance laptop with 32GB RAM and 1TB SSD",
    "price": 1499.99,
    "quantity": 8
  }'

# Delete product (SELLER only, must own product)
# curl -X DELETE http://localhost:8082/api/products/$PRODUCT_ID \
#   -H "Authorization: Bearer $SELLER_TOKEN"
```

### Step 2.4: Start Media Service

**Open new terminal:**

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/media-service
mvn spring-boot:run

# Service should start on port 8083
# Look for: "Started MediaServiceApplication"
```

**Test Media Service Endpoints:**

```bash
# Upload an image for the product
curl -X POST http://localhost:8083/api/media/upload \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "file=@/path/to/test-image.jpg" \
  -F "productId=$PRODUCT_ID"

# Expected: 200 OK with media details
# Save mediaId from response
export MEDIA_ID="<media-id-from-response>"

# Get media by product ID
curl http://localhost:8083/api/media/product/$PRODUCT_ID

# Get media by ID
curl http://localhost:8083/api/media/$MEDIA_ID

# Delete media (SELLER only, must own product)
# curl -X DELETE http://localhost:8083/api/media/$MEDIA_ID \
#   -H "Authorization: Bearer $SELLER_TOKEN"
```

---

## Phase 3: Kafka Event Testing

### Step 3.1: Monitor Kafka Topics

```bash
# List all topics (should see user-events, product-events, media-events)
docker exec -it <kafka-container-id> kafka-topics --list --bootstrap-server localhost:9092

# Consume user events
docker exec -it <kafka-container-id> kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --from-beginning

# In another terminal, consume product events
docker exec -it <kafka-container-id> kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic product-events \
  --from-beginning

# In another terminal, consume media events
docker exec -it <kafka-container-id> kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic media-events \
  --from-beginning
```

### Step 3.2: Test Cascade Deletion via Kafka

```bash
# 1. Create a user, product, and upload media (as done above)

# 2. Delete the product - should trigger media deletion via Kafka
curl -X DELETE http://localhost:8082/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $SELLER_TOKEN"

# 3. Check Kafka consumer logs - should see:
#    - PRODUCT_DELETED event in product-events topic
#    - Media service consuming the event and deleting associated media

# 4. Verify media is deleted
curl http://localhost:8083/api/media/product/$PRODUCT_ID
# Expected: Empty array []

# 5. Delete the user - should trigger product deletion via Kafka
curl -X DELETE http://localhost:8081/api/users \
  -H "Authorization: Bearer $SELLER_TOKEN"

# 6. Check Kafka consumer logs - should see:
#    - USER_DELETED event in user-events topic
#    - Product service consuming the event and deleting user's products
```

---

## Phase 4: Frontend Testing

### Step 4.1: Start Angular Development Server

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/frontend

# Install dependencies (if not already done)
npm install

# Start dev server
npx ng serve --port 4200

# Frontend should be available at http://localhost:4200
```

### Step 4.2: Manual UI Testing

**Test Registration Flow:**
1. Open browser: `http://localhost:4200/register`
2. Fill form:
   - Name: "Test Seller"
   - Email: "testseller@example.com"
   - Password: "password123"
   - Role: Select "SELLER"
3. Click "Register"
4. Should redirect to `/products` with success message
5. Check navbar - should show "Dashboard" and "Logout" links

**Test Login Flow:**
1. Navigate to: `http://localhost:4200/login`
2. Fill form:
   - Email: "testseller@example.com"
   - Password: "password123"
3. Click "Login"
4. Should redirect to `/products`
5. JWT token should be stored in localStorage

**Test Product Listing (Public):**
1. Navigate to: `http://localhost:4200/products`
2. Should see all products from all sellers
3. No authentication required

**Test Seller Dashboard:**
1. Login as SELLER
2. Navigate to: `http://localhost:4200/seller/dashboard`
3. Should see "Add New Product" button
4. Should see grid of seller's products (or empty state)

**Test Product Creation:**
1. In dashboard, click "Add New Product"
2. Fill form:
   - Name: "Test Product"
   - Description: "This is a test product with detailed description"
   - Price: 99.99
   - Quantity: 5
3. Click "Save Product"
4. Product should appear in grid

**Test Product Editing:**
1. In dashboard, click edit icon (✏️) on a product
2. Modify fields
3. Click "Save Product"
4. Changes should reflect in grid

**Test Media Upload:**
1. In dashboard, click "Manage Images" on a product
2. Click "Upload Image"
3. Select an image file (max 2MB, JPEG/PNG/GIF/WebP)
4. Image should upload and appear in grid
5. Hover over image and click "Delete"
6. Image should be removed

**Test Product Deletion:**
1. In dashboard, click delete icon (🗑️) on a product
2. Confirm deletion
3. Product should be removed from grid
4. Associated images should also be deleted (via Kafka)

**Test Authorization:**
1. Try accessing `/seller/dashboard` without login
   - Should redirect to `/login`
2. Register/login as BUYER
3. Try accessing `/seller/dashboard`
   - Should be blocked by SellerGuard

---

## Phase 5: Integration Testing

### Test Scenario 1: Complete Seller Workflow

```bash
# 1. Register seller via API
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test Seller",
    "email": "integration@test.com",
    "password": "test123",
    "role": "SELLER"
  }'

# Save token
export TOKEN="<token-from-response>"

# 2. Create product
curl -X POST http://localhost:8082/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test Product",
    "description": "Testing full workflow",
    "price": 49.99,
    "quantity": 100
  }'

# Save productId
export PID="<product-id>"

# 3. Upload media
curl -X POST http://localhost:8083/api/media/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-image.jpg" \
  -F "productId=$PID"

# 4. Verify product has media
curl http://localhost:8083/api/media/product/$PID

# 5. Update product
curl -X PUT http://localhost:8082/api/products/$PID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product",
    "description": "Updated description",
    "price": 59.99,
    "quantity": 90
  }'

# 6. Delete product (should cascade delete media)
curl -X DELETE http://localhost:8082/api/products/$PID \
  -H "Authorization: Bearer $TOKEN"

# 7. Verify media deleted
curl http://localhost:8083/api/media/product/$PID
# Expected: []
```

### Test Scenario 2: Security Testing

```bash
# 1. Try creating product without token
curl -X POST http://localhost:8082/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test","price":10,"quantity":1}'
# Expected: 401 Unauthorized

# 2. Try creating product as BUYER
# Register buyer
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buyer User",
    "email": "buyer2@test.com",
    "password": "test123",
    "role": "BUYER"
  }'

export BUYER_TOKEN="<token>"

curl -X POST http://localhost:8082/api/products \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test","price":10,"quantity":1}'
# Expected: 403 Forbidden

# 3. Try updating another seller's product
# (Use BUYER_TOKEN to try updating SELLER's product)
curl -X PUT http://localhost:8082/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacked","description":"Hacked","price":1,"quantity":1}'
# Expected: 403 Forbidden or 404 Not Found
```

---

## Phase 6: Docker Testing

### Step 6.1: Build Docker Images

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01

# Build user-service image
cd user-service
docker build -t buy-01/user-service:latest .

# Build product-service image
cd ../product-service
docker build -t buy-01/product-service:latest .

# Build media-service image
cd ../media-service
docker build -t buy-01/media-service:latest .

# Build frontend image
cd ../frontend
docker build -t buy-01/frontend:latest .

# Verify images
docker images | grep buy-01
```

### Step 6.2: Run Full Stack with Docker Compose

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01

# Update docker-compose.yml to include all services
# Then start everything
docker-compose up -d

# Check all containers
docker-compose ps

# View logs
docker-compose logs -f user-service
docker-compose logs -f product-service
docker-compose logs -f media-service
docker-compose logs -f frontend

# Test services
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
curl http://localhost:4200

# Stop all services
docker-compose down
```

---

## Phase 7: Performance Testing

### Load Testing with Apache Bench

```bash
# Install Apache Bench (if not installed)
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test user registration endpoint
ab -n 100 -c 10 -p register.json -T application/json \
  http://localhost:8081/api/users/register

# Test product listing (public endpoint)
ab -n 1000 -c 50 http://localhost:8082/api/products

# Test authenticated endpoint
ab -n 500 -c 25 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8082/api/products/user
```

---

## Common Issues and Troubleshooting

### Issue 1: Port Already in Use
```bash
# Find process using port
lsof -i :8081
lsof -i :8082
lsof -i :8083
lsof -i :4200

# Kill process
kill -9 <PID>
```

### Issue 2: MongoDB Connection Failed
```bash
# Check MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker restart <mongodb-container-id>

# Check MongoDB logs
docker logs <mongodb-container-id>
```

### Issue 3: Kafka Connection Failed
```bash
# Check Kafka and Zookeeper are running
docker ps | grep kafka
docker ps | grep zookeeper

# Restart Kafka stack
docker-compose restart zookeeper kafka
```

### Issue 4: JWT Token Invalid
```bash
# Ensure JWT_SECRET is set and same across all services
# Check application.yml in each service

# Generate new token by logging in again
curl -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","password":"password123"}'
```

### Issue 5: CORS Errors in Frontend
```bash
# Ensure SecurityConfig in each service allows CORS
# Check browser console for specific CORS error
# Verify backend services are running on correct ports
```

---

## Test Checklist

### Backend Services
- [ ] User registration (BUYER and SELLER)
- [ ] User login
- [ ] User profile retrieval
- [ ] User update
- [ ] User deletion
- [ ] Product creation (SELLER only)
- [ ] Product listing (public)
- [ ] Product retrieval by ID
- [ ] Product update (owner only)
- [ ] Product deletion (owner only)
- [ ] Media upload (SELLER only)
- [ ] Media retrieval
- [ ] Media deletion (owner only)

### Kafka Events
- [ ] USER_CREATED event published
- [ ] USER_DELETED event published
- [ ] PRODUCT_CREATED event published
- [ ] PRODUCT_DELETED event published
- [ ] MEDIA_UPLOADED event published
- [ ] MEDIA_DELETED event published
- [ ] Product deletion triggers media deletion
- [ ] User deletion triggers product deletion

### Frontend
- [ ] Registration page works
- [ ] Login page works
- [ ] Product listing displays all products
- [ ] Seller dashboard accessible (SELLER only)
- [ ] Product creation form works
- [ ] Product editing form works
- [ ] Product deletion works
- [ ] Media upload works
- [ ] Media deletion works
- [ ] Auth guard blocks unauthenticated access
- [ ] Seller guard blocks non-seller access
- [ ] JWT token attached to requests
- [ ] Logout clears token and redirects

### Security
- [ ] Endpoints require authentication
- [ ] Role-based access control works
- [ ] JWT tokens validated correctly
- [ ] Users can only modify their own resources
- [ ] Password hashing works
- [ ] CORS configured correctly

### Integration
- [ ] All services communicate correctly
- [ ] Kafka events flow between services
- [ ] Cascade deletion works via Kafka
- [ ] Frontend integrates with all backend services
- [ ] Docker images build successfully
- [ ] Docker Compose runs full stack

---

## Next Steps

After completing all tests:
1. Document any bugs found
2. Add unit tests for critical business logic
3. Add integration tests with TestContainers
4. Set up CI/CD pipeline
5. Configure HTTPS for production
6. Add monitoring and logging (ELK stack)
7. Implement API rate limiting
8. Add comprehensive error handling
9. Create API documentation (Swagger/OpenAPI)
10. Perform security audit
