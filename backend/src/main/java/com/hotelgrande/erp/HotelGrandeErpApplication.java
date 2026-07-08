package com.hotelgrande.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Hotel Grande ERP – Spring Boot entry point.
 *
 * <p>Starts the embedded Tomcat server on port 8080 (configured in
 * application.properties). On first run, {@link com.hotelgrande.erp.config.DataInitializer}
 * seeds the four default users into the H2 in-memory database.</p>
 */
@SpringBootApplication
public class HotelGrandeErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(HotelGrandeErpApplication.class, args);
    }
}
