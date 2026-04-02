package com.tuapp.finanzas.user.controller;

import com.tuapp.finanzas.user.dto.CreateUserRequest;
import com.tuapp.finanzas.user.dto.UserDto;
import com.tuapp.finanzas.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> list() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> get(@PathVariable Long id) {
        UserDto u = userService.findById(id);
        return u == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(u);
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUserRequest req) {
        UserDto created = userService.create(req);
        return ResponseEntity.ok(created);
    }
}
