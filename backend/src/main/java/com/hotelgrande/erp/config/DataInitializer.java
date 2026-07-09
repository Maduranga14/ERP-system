package com.hotelgrande.erp.config;

import com.hotelgrande.erp.entity.*;
import com.hotelgrande.erp.enums.Role;
import com.hotelgrande.erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final ReservationRepository reservationRepository;
    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final InvoiceRepository invoiceRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("DataInitializer: Data already present — skipping seed.");
            return;
        }

        log.info("DataInitializer: Seeding Hotel Grande ERP database...");


        User admin = createUser("Alex Johnson", "admin@hotelgrande.com", "admin123", Role.ADMIN);
        User manager = createUser("Maria Garcia", "manager@hotelgrande.com", "manager123", Role.MANAGER);
        User receptionist = createUser("James Williams", "receptionist@hotelgrande.com", "front123", Role.RECEPTIONIST);
        User housekeeper1 = createUser("Emily Chen", "housekeeper@hotelgrande.com", "house123", Role.HOUSEKEEPER);
        User housekeeper2 = createUser("Sarah Jenkins", "sarah@hotelgrande.com", "house123", Role.HOUSEKEEPER);
        User housekeeper3 = createUser("David Miller", "david@hotelgrande.com", "house123", Role.HOUSEKEEPER);

        log.info("DataInitializer: Seeded default users.");


        Room r101 = createRoom("101", "Standard King", 1, 2, 120.0, "King Size", "Available", "Today, 09:15 AM", "City View", "East Wing", "Comfortable standard king room with modern amenities.", List.of("Wi-Fi", "Air Conditioning", "Smart TV", "Room Service"));
        Room r102 = createRoom("102", "Standard King", 1, 2, 120.0, "King Size", "Reserved", "Today, 07:00 AM", "City View", "East Wing", "Standard King room ideal for business travelers.", List.of("Wi-Fi", "Air Conditioning", "Smart TV"));
        Room r201 = createRoom("201", "Deluxe Twin", 2, 2, 180.0, "2 Twin Beds", "Available", "Yesterday", "Garden View", "East Wing", "Spacious deluxe twin room overlooking the courtyard.", List.of("Wi-Fi", "Air Conditioning", "Smart TV", "Mini Bar"));
        Room r205 = createRoom("205", "Deluxe Ocean View", 2, 3, 245.0, "King + Single", "Occupied", "Yesterday", "Ocean Front", "West Wing", "Breathtaking panoramic sea views with balcony.", List.of("Wi-Fi", "Air Conditioning", "Smart TV", "Mini Bar", "Balcony", "Sea View"));
        Room r301 = createRoom("301", "Executive Suite", 3, 3, 350.0, "Super King", "Cleaning", "Today, 11:30 AM", "City Skyline", "North Wing", "Luxury suite with study area and premium lounge access.", List.of("Wi-Fi", "Air Conditioning", "Smart TV", "Mini Bar", "Espresso Machine"));
        Room r401 = createRoom("401", "Presidential Suite", 4, 4, 850.0, "King", "Maintenance", "Not Cleaned", "Ocean Front", "North Wing", "Flagship Presidential Suite with kitchen and butler service.", List.of("Wi-Fi", "Air Conditioning", "Smart TV", "Mini Bar", "Balcony", "Sea View", "Butler Service"));

        log.info("DataInitializer: Seeded default rooms.");


        Customer c1 = createCustomer("Alexander Sterling", "Regular Member", "alex.sterling@example.com", "+1 555-0199", "United States", "US-998822", "1988-05-12", "102 Pine St, New York", "Active", "2024-01-15", List.of("Extra towels", "High floor"));
        Customer c2 = createCustomer("Samantha Vance", "VIP Guest", "samantha.vance@example.com", "+44 20 7946 0958", "United Kingdom", "UK-441122", "1992-10-24", "45 Park Ln, London", "Active", "2024-02-10", List.of("Ocean view", "Feather pillows"));
        Customer c3 = createCustomer("Carlos Mendez", "New Guest", "carlos.mendez@example.com", "+34 91 371 2345", "Spain", "ES-773322", "1985-07-03", "Gran Via 12, Madrid", "New", "2024-07-01", List.of("Late check-in"));

        log.info("DataInitializer: Seeded default customers.");

        log.info("DataInitializer: Reservations intentionally not seeded — admin adds via portal.");


        createHousekeepingTask(r301, housekeeper1, "High", "In Progress", "Today, 03:00 PM", "Today, 01:00 PM", "Suite check-out clean", List.of(
                new HousekeepingTask.ChecklistItem("Strip bedding and towels", true),
                new HousekeepingTask.ChecklistItem("Sanitize surfaces & bathroom", false),
                new HousekeepingTask.ChecklistItem("Vacuum & mop floors", false),
                new HousekeepingTask.ChecklistItem("Replenish mini bar & amenities", false)
        ));
        createHousekeepingTask(r201, housekeeper2, "Medium", "Pending", "Today, 04:00 PM", "", "Routine stay-over clean requested by guest.", List.of(
                new HousekeepingTask.ChecklistItem("Make bed", false),
                new HousekeepingTask.ChecklistItem("Empty trash cans", false),
                new HousekeepingTask.ChecklistItem("Replace used towels", false)
        ));

        log.info("DataInitializer: Seeded default housekeeping tasks.");


        createMaintenanceRequest(r401, "HVAC", "AC Unit not cooling effectively, thermostat screen blank.", "High", "In Progress", "David Miller", "2026-07-08", "14:30 PM", housekeeper3.getFullName(), null, "");
        createMaintenanceRequest(r101, "Plumbing", "Fringe bathroom sink slow drainage.", "Low", "Resolved", "James Williams", "2026-07-05", "10:15 AM", housekeeper1.getFullName(), "2026-07-06", "Cleared soap scum buildup from U-bend.");

        log.info("DataInitializer: Seeded default maintenance requests.");


        createInvoice("Alexander Sterling", "alex.sterling@example.com", "+1 555-0199", null, "2026-07-08", "2026-07-12", 4, "205", "Deluxe Ocean View", "Card", "Paid", "2026-07-08", 980.0, 103.0, 0.0, 1133.0, 1133.0, "Pre-paid check-in invoice.");
        createInvoice("Samantha Vance", "samantha.vance@example.com", "+44 20 7946 0958", null, "2026-07-15", "2026-07-17", 2, "102", "Standard King", "Online", "Pending", "2026-07-08", 240.0, 24.0, 24.0, 240.0, 0.0, "Awaiting online deposit.");

        log.info("DataInitializer: Seeded default invoices.");
        log.info("DataInitializer: Database initialization completed successfully!");
    }

    private User createUser(String fullName, String email, String rawPwd, Role role) {
        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPwd))
                .role(role)
                .enabled(true)
                .build();
        return userRepository.save(user);
    }

    private Room createRoom(String number, String type, Integer floor, Integer capacity, Double price, String bedType, String status, String lastCleaned, String viewType, String wing, String description, List<String> amenities) {
        Room r = Room.builder()
                .number(number)
                .type(type)
                .floor(floor)
                .capacity(capacity)
                .pricePerNight(price)
                .bedType(bedType)
                .status(status)
                .lastCleaned(lastCleaned)
                .viewType(viewType)
                .wing(wing)
                .description(description)
                .amenities(new ArrayList<>(amenities))
                .build();
        return roomRepository.save(r);
    }

    private Customer createCustomer(String name, String tier, String email, String phone, String country, String nationalId, String dob, String address, String status, String joinedDate, List<String> preferences) {
        Customer c = Customer.builder()
                .name(name)
                .memberTier(tier)
                .email(email)
                .phone(phone)
                .country(country)
                .nationalId(nationalId)
                .dob(dob)
                .address(address)
                .status(status)
                .joinedDate(joinedDate)
                .preferences(new ArrayList<>(preferences))
                .build();
        return customerRepository.save(c);
    }


    private HousekeepingTask createHousekeepingTask(Room room, User housekeeper, String priority, String status, String dueTime, String assignedTime, String notes, List<HousekeepingTask.ChecklistItem> checklist) {
        HousekeepingTask task = HousekeepingTask.builder()
                .room(room)
                .housekeeper(housekeeper)
                .priority(priority)
                .status(status)
                .dueTime(dueTime)
                .assignedTime(assignedTime)
                .notes(notes)
                .checklist(new ArrayList<>(checklist))
                .build();
        return housekeepingTaskRepository.save(task);
    }

    private MaintenanceRequest createMaintenanceRequest(Room room, String category, String description, String priority, String status, String reportedBy, String date, String time, String assigned, String resolvedDate, String notes) {
        MaintenanceRequest request = MaintenanceRequest.builder()
                .room(room)
                .category(category)
                .description(description)
                .priority(priority)
                .status(status)
                .reportedBy(reportedBy)
                .reportedDate(date)
                .reportedTime(time)
                .assignedTo(assigned)
                .resolvedDate(resolvedDate)
                .resolutionNotes(notes)
                .build();
        return maintenanceRequestRepository.save(request);
    }

    private Invoice createInvoice(String name, String email, String phone, Reservation reservation, String checkIn, String checkOut, Integer nights, String roomNum, String roomType, String method, String status, String date, Double subtotal, Double tax, Double discount, Double grandTotal, Double paid, String notes) {
        Invoice invoice = Invoice.builder()
                .guestName(name)
                .email(email)
                .phone(phone)
                .reservation(reservation)
                .checkIn(checkIn)
                .checkOut(checkOut)
                .nights(nights)
                .roomNumber(roomNum)
                .roomType(roomType)
                .method(method)
                .status(status)
                .date(date)
                .subtotal(subtotal)
                .tax(tax)
                .discount(discount)
                .grandTotal(grandTotal)
                .amountPaid(paid)
                .notes(notes)
                .build();
        return invoiceRepository.save(invoice);
    }
}
