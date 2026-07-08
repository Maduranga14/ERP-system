package com.hotelgrande.erp.enums;

/**
 * Role enum representing the four user roles in the Hotel Grande ERP system.
 *
 * <p>This enum is stored as a String column in the database via
 * {@code @Enumerated(EnumType.STRING)} on the {@code User} entity, making
 * it human-readable in the DB and resilient to reordering.</p>
 *
 * <p>Role → Dashboard path mapping:</p>
 * <ul>
 *   <li>{@link #ADMIN}        → /admin</li>
 *   <li>{@link #MANAGER}      → /manager</li>
 *   <li>{@link #RECEPTIONIST} → /receptionist</li>
 *   <li>{@link #HOUSEKEEPER}  → /housekeeper</li>
 * </ul>
 */
public enum Role {

    /** Full system access: users, rooms, billing, reports, all CRUD. */
    ADMIN,

    /** Read-only access to most modules; cannot add/delete records. */
    MANAGER,

    /** Front-desk operations: reservations, check-in/out, billing. */
    RECEPTIONIST,

    /** Housekeeping tasks, room cleaning status updates. */
    HOUSEKEEPER
}
