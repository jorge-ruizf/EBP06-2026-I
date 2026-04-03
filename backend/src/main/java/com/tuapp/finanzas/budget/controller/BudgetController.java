package com.tuapp.finanzas.budget.controller;

import com.tuapp.finanzas.budget.dto.BudgetDto;
import jakarta.validation.Valid;
import com.tuapp.finanzas.budget.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> list() {
        return ResponseEntity.ok(budgetService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDto> get(@PathVariable Long id) {
        BudgetDto b = budgetService.findById(id);
        return b == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(b);
    }

    @PostMapping
    public ResponseEntity<BudgetDto> create(@Valid @RequestBody BudgetDto dto) {
        return ResponseEntity.ok(budgetService.create(dto));
    }
}
