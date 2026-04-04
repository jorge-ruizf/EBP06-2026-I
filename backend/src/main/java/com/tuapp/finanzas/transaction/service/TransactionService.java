package com.tuapp.finanzas.transaction.service;

import com.tuapp.finanzas.transaction.dto.TransactionDto;

import java.util.List;

public interface TransactionService {
    TransactionDto create(TransactionDto dto);
    List<TransactionDto> findAll();
    TransactionDto findById(Long id);
}
