package com.group1.proyect.freshbasket.dto.response;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EntryResponseDTO {

    private Long id;
    private LocalDateTime entryDate;
    private Integer quantity;
    private Long productId;
    private Long supplierId;
    private Long userId;
} 
