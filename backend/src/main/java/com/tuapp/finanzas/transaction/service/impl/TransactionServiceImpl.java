package com.tuapp.finanzas.transaction.service.impl;

import com.tuapp.finanzas.transaction.dto.TransactionDto;
import com.tuapp.finanzas.transaction.entity.Transaction;
import com.tuapp.finanzas.transaction.repository.TransactionRepository;
import com.tuapp.finanzas.transaction.service.TransactionService;
import com.tuapp.finanzas.category.entity.Category;
import com.tuapp.finanzas.user.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public TransactionDto create(TransactionDto dto) {
        Transaction t = new Transaction();
        t.setAmount(dto.getAmount());
        t.setDescription(dto.getDescription());
        if (dto.getCategoryId() != null) {
            Category c = new Category();
            c.setId(dto.getCategoryId());
            t.setCategory(c);
        }
        if (dto.getUserId() != null) {
            User u = new User();
            u.setId(dto.getUserId());
            t.setUser(u);
        }
        Transaction saved = transactionRepository.save(t);
        return toDto(saved);
    }

    @Override
    public List<TransactionDto> findAll() {
        return transactionRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public TransactionDto findById(Long id) {
        return transactionRepository.findById(id).map(this::toDto).orElse(null);
    }

    private TransactionDto toDto(Transaction t) {
        return TransactionDto.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .description(t.getDescription())
                .categoryId(t.getCategory() != null ? t.getCategory().getId() : null)
                .userId(t.getUser() != null ? t.getUser().getId() : null)
                .build();
    }
}
