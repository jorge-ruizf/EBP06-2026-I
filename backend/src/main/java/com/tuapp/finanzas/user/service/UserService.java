package com.tuapp.finanzas.user.service;

import com.tuapp.finanzas.user.dto.CreateUserRequest;
import com.tuapp.finanzas.user.dto.UserDto;

import java.util.List;

public interface UserService {
    UserDto create(CreateUserRequest req);
    List<UserDto> findAll();
    UserDto findById(Long id);
}
