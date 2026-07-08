package com.hotelgrande.erp.dto;


public record LoginResponse(

    String token,
    String role,
    String redirectUrl,
    String fullName,
    String email

) {}
