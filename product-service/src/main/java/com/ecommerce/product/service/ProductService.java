package com.ecommerce.product.service;

import com.ecommerce.product.dto.CreateProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.dto.UpdateProductRequest;
import com.ecommerce.product.event.ProductEventProducer;
import com.ecommerce.product.exception.InvalidRoleException;
import com.ecommerce.product.exception.ProductNotFoundException;
import com.ecommerce.product.exception.UnauthorizedAccessException;
import com.ecommerce.product.mapper.ProductMapper;
import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductEventProducer productEventProducer;

    public ProductResponse createProduct(CreateProductRequest request, String userId, String userRole) {
        log.info("Creating product for user: {}", userId);

        validateSellerRole(userRole);

        Product product = buildProductFromRequest(request, userId);
        Product savedProduct = productRepository.save(product);

        log.info("Product created successfully with ID: {}", savedProduct.getId());

        productEventProducer.publishProductCreatedEvent(
                savedProduct.getId(),
                savedProduct.getUserId(),
                savedProduct.getName()
        );

        return productMapper.toProductResponse(savedProduct);
    }

    public ProductResponse getProductById(String productId) {
        log.info("Fetching product with ID: {}", productId);

        Product product = findProductById(productId);
        return productMapper.toProductResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        log.info("Fetching all products");

        return productRepository.findAll().stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByUserId(String userId) {
        log.info("Fetching products for user: {}", userId);

        return productRepository.findByUserId(userId).stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse updateProduct(String productId, UpdateProductRequest request, String userId, String userRole) {
        log.info("Updating product: {} by user: {}", productId, userId);

        validateSellerRole(userRole);
        Product product = findProductById(productId);
        validateProductOwnership(product, userId);

        updateProductFields(product, request);
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        log.info("Product updated successfully: {}", updatedProduct.getId());

        return productMapper.toProductResponse(updatedProduct);
    }

    public void deleteProduct(String productId, String userId, String userRole) {
        log.info("Deleting product: {} by user: {}", productId, userId);

        validateSellerRole(userRole);
        Product product = findProductById(productId);
        validateProductOwnership(product, userId);

        productRepository.delete(product);

        productEventProducer.publishProductDeletedEvent(productId, userId);

        log.info("Product deleted successfully: {}", productId);
    }

    public void addImageToProduct(String productId, String imageId, String userId) {
        log.info("Adding image {} to product: {}", imageId, productId);

        Product product = findProductById(productId);
        validateProductOwnership(product, userId);

        product.getImageIds().add(imageId);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        log.info("Image added to product successfully");
    }

    public void removeImageFromProduct(String productId, String imageId, String userId) {
        log.info("Removing image {} from product: {}", imageId, productId);

        Product product = findProductById(productId);
        validateProductOwnership(product, userId);

        product.getImageIds().remove(imageId);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        log.info("Image removed from product successfully");
    }

    private Product buildProductFromRequest(CreateProductRequest request, String userId) {
        return Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private void updateProductFields(Product product, UpdateProductRequest request) {
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getQuantity() != null) {
            product.setQuantity(request.getQuantity());
        }
    }

    private Product findProductById(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
    }

    private void validateSellerRole(String userRole) {
        if (!"SELLER".equals(userRole)) {
            throw new InvalidRoleException("Only sellers can manage products");
        }
    }

    private void validateProductOwnership(Product product, String userId) {
        if (!product.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You can only modify your own products");
        }
    }
}
