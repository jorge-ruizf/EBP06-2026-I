package com.tuapp.finanzas.user.dto;

import lombok.*;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    private String fullName;
}
