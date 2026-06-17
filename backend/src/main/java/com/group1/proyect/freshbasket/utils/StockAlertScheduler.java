package com.group1.proyect.freshbasket.utils;

import com.group1.proyect.freshbasket.dto.response.ProductResponseDTO;
import com.group1.proyect.freshbasket.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class StockAlertScheduler {

    private static final Logger log = LoggerFactory.getLogger(StockAlertScheduler.class);
    private final ProductService productService;

    public StockAlertScheduler(ProductService productService) {
        this.productService = productService;
    }

    @Scheduled(fixedRate = 3600000)
    public void checkInventoryStocks() {
        log.info("Iniciando verificación automática de inventario...");
        List<ProductResponseDTO> lowStockProducts = productService.getLowStockAlerts();

        if (!lowStockProducts.isEmpty()) {
            log.warn("⚠️ ¡ALERTA DE INVENTARIO! Se encontraron {} productos con stock bajo:", lowStockProducts.size());
            lowStockProducts.forEach(p ->
                    log.warn("   -> Producto: {} (ID: {}) | Stock Actual: {} | Mínimo requerido: {}",
                            p.getName(), p.getId(), p.getCurrentStock(), p.getMinStock())
            );
        } else {
            log.info("✅ Inventario estable. Todos los productos superan los límites mínimos.");
        }
    }
}