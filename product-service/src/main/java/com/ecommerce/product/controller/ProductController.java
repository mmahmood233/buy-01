package com.ecommerce.product.controller;

import com.ecommerce.product.dto.CreateProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.dto.UpdateProductRequest;
import com.ecommerce.product.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("X-User-Id");
        String userRole = (String) httpRequest.getAttribute("X-User-Role");
        ProductResponse response = productService.createProduct(request, userId, userRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String productId) {
        ProductResponse response = productService.getProductById(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProductResponse>> getProductsByUserId(@PathVariable String userId) {
        List<ProductResponse> products = productService.getProductsByUserId(userId);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String productId,
            @Valid @RequestBody UpdateProductRequest request,
            HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("X-User-Id");
        String userRole = (String) httpRequest.getAttribute("X-User-Role");
        ProductResponse response = productService.updateProduct(productId, request, userId, userRole);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable String productId,
            HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("X-User-Id");
        String userRole = (String) httpRequest.getAttribute("X-User-Role");
        productService.deleteProduct(productId, userId, userRole);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{productId}/images/{imageId}")
    public ResponseEntity<Void> addImageToProduct(
            @PathVariable String productId,
            @PathVariable String imageId,
            HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("X-User-Id");
        productService.addImageToProduct(productId, imageId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    public ResponseEntity<Void> removeImageFromProduct(
            @PathVariable String productId,
            @PathVariable String imageId,
            HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("X-User-Id");
        productService.removeImageFromProduct(productId, imageId, userId);
        return ResponseEntity.noContent().build();
    }
}
