package com.tuapp.finanzas.user.mapper;

import com.tuapp.finanzas.user.dto.UserDto;
import com.tuapp.finanzas.user.entity.User;

public final class UserMapper {
    private UserMapper() {}

    public static UserDto toDto(User u) {
        if (u == null) return null;
        return UserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .build();
    }
}
