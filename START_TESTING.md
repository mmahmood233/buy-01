# Quick Testing Guide - Local Development

## Recommended Approach: Infrastructure in Docker, Services Locally

This approach avoids Docker build issues and makes debugging easier.

---

## Step 1: Start Infrastructure Only (MongoDB + Kafka)

```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01

# Start only MongoDB and Kafka
docker-compose -f docker-compose-infra.yml up -d

# Verify services are running
docker ps

# You should see: ecommerce-mongodb, ecommerce-zookeeper, ecommerce-kafka
```

**Verify MongoDB:**
```bash
docker exec -it ecommerce-mongodb mongosh -u admin -p admin123

# In MongoDB shell:
show dbs
exit
```

**Verify Kafka:**
```bash
docker exec -it ecommerce-kafka kafka-topics --list --bootstrap-server localhost:9092
# Should show empty list initially (topics auto-created when services start)
```

---

## Step 2: Start Backend Services Locally

### Terminal 1 - User Service
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/user-service
mvn spring-boot:run

# Wait for: "Started UserServiceApplication in X seconds"
# Service runs on: http://localhost:8081
```

### Terminal 2 - Product Service
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/product-service
mvn spring-boot:run

# Wait for: "Started ProductServiceApplication in X seconds"
# Service runs on: http://localhost:8082
```

### Terminal 3 - Media Service
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/media-service
mvn spring-boot:run

# Wait for: "Started MediaServiceApplication in X seconds"
# Service runs on: http://localhost:8083
```

---

## Step 3: Start Frontend

### Terminal 4 - Angular Frontend
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01/frontend
npx ng serve --port 4200

# Wait for: "Compiled successfully"
# Frontend runs on: http://localhost:4200
```

---

## Step 4: Test the Application

### Browser Testing

**Open:** http://localhost:4200

**1. Register as Seller:**
- Click "Register"
- Name: Test Seller
- Email: seller@test.com
- Password: password123
- Role: SELLER
- Click "Register"

**2. Access Dashboard:**
- Click "Dashboard" in navbar
- You should see empty state or your products

**3. Create Product:**
- Click "Add New Product"
- Name: Test Laptop
- Description: High-performance laptop for professionals
- Price: 1299.99
- Quantity: 10
- Click "Save Product"

**4. Upload Image:**
- Click "Manage Images" on your product
- Click "Upload Image"
- Select an image file (max 2MB, JPG/PNG/GIF/WebP)
- Image should appear

**5. View Products:**
- Click "Products" in navbar
- See your product listed

---

### API Testing with curl

**Register User:**
```bash
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Seller",
    "email": "api@test.com",
    "password": "test123",
    "role": "SELLER"
  }'

# Copy the token from response
export TOKEN="<your-jwt-token-here>"
```

**Create Product:**
```bash
curl -X POST http://localhost:8082/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Product",
    "description": "Product created via API",
    "price": 99.99,
    "quantity": 5
  }'

# Copy productId from response
export PRODUCT_ID="<product-id-here>"
```

**List All Products:**
```bash
curl http://localhost:8082/api/products
```

**Get Seller's Products:**
```bash
curl http://localhost:8082/api/products/user \
  -H "Authorization: Bearer $TOKEN"
```

**Upload Media:**
```bash
curl -X POST http://localhost:8083/api/media/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "productId=$PRODUCT_ID"
```

**Get Product Media:**
```bash
curl http://localhost:8083/api/media/product/$PRODUCT_ID
```

---

## Step 5: Test Kafka Events

### Monitor Kafka Topics

**Terminal 5 - User Events:**
```bash
docker exec -it ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --from-beginning
```

**Terminal 6 - Product Events:**
```bash
docker exec -it ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic product-events \
  --from-beginning
```

**Terminal 7 - Media Events:**
```bash
docker exec -it ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic media-events \
  --from-beginning
```

### Test Cascade Deletion

**1. Create test data:**
- Register user → Get token
- Create product with that token
- Upload media for that product

**2. Delete product:**
```bash
curl -X DELETE http://localhost:8082/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"
```

**3. Check Kafka consumer logs:**
- Should see PRODUCT_DELETED event
- Media service should consume event and delete associated media

**4. Verify media deleted:**
```bash
curl http://localhost:8083/api/media/product/$PRODUCT_ID
# Should return empty array []
```

---

## Stop Everything

**Stop Backend Services:**
- Press `Ctrl+C` in each terminal running Maven

**Stop Frontend:**
- Press `Ctrl+C` in terminal running Angular

**Stop Infrastructure:**
```bash
cd /Users/mohammed/Desktop/Reboot/Java/buy-01
docker-compose -f docker-compose-infra.yml down

# To remove volumes (clean slate):
docker-compose -f docker-compose-infra.yml down -v
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :8081
lsof -i :8082
lsof -i :8083
lsof -i :4200

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker restart ecommerce-mongodb

# Check logs
docker logs ecommerce-mongodb
```

### Kafka Connection Error
```bash
# Restart Kafka stack
docker restart ecommerce-zookeeper
sleep 5
docker restart ecommerce-kafka

# Check logs
docker logs ecommerce-kafka
```

### Maven Build Errors
```bash
# Clean and rebuild
cd /Users/mohammed/Desktop/Reboot/Java/buy-01
mvn clean install

# Then start services again
```

### Frontend Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npx ng serve
```

---

## What to Test

### ✅ Core Functionality
- [ ] User registration (BUYER and SELLER)
- [ ] User login
- [ ] Product creation (SELLER only)
- [ ] Product listing (public)
- [ ] Product update (owner only)
- [ ] Product deletion (owner only)
- [ ] Media upload (SELLER only)
- [ ] Media deletion (owner only)

### ✅ Security
- [ ] Unauthenticated requests blocked
- [ ] BUYER cannot create products
- [ ] Users cannot modify others' resources
- [ ] JWT tokens validated

### ✅ Kafka Events
- [ ] USER_CREATED event published
- [ ] PRODUCT_CREATED event published
- [ ] MEDIA_UPLOADED event published
- [ ] Product deletion cascades to media
- [ ] User deletion cascades to products

### ✅ Frontend
- [ ] Registration form validation
- [ ] Login redirects correctly
- [ ] Seller dashboard displays products
- [ ] Product CRUD operations work
- [ ] Media upload/delete works
- [ ] Route guards protect pages

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

## Next Steps After Testing

1. Fix any bugs found during testing
2. Add unit tests for services
3. Add integration tests
4. Fix Docker build issues for production deployment
5. Configure HTTPS
6. Add monitoring and logging
7. Performance optimization
8. Security hardening
