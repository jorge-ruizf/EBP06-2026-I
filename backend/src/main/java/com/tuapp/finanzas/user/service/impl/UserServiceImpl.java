package com.tuapp.finanzas.user.service.impl;

import com.tuapp.finanzas.user.dto.CreateUserRequest;
import com.tuapp.finanzas.user.dto.UserDto;
import com.tuapp.finanzas.user.entity.User;
import com.tuapp.finanzas.user.repository.UserRepository;
import com.tuapp.finanzas.user.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDto create(CreateUserRequest req) {
        User u = User.builder()
                .username(req.getUsername())
                .password(req.getPassword())
                .fullName(req.getFullName())
                .build();
        User saved = userRepository.save(u);
        return toDto(saved);
    }

    @Override
    public List<UserDto> findAll() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public UserDto findById(Long id) {
        return userRepository.findById(id).map(this::toDto).orElse(null);
    }

    private UserDto toDto(User u) {
        return UserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .build();
    }
}
