import { Role } from "@prisma/client";
import bcrypt from 'bcrypt';
import prisma from "../lib/prisma";
import { CreateUserInput } from "../types/user";

export async function createUser(input: CreateUserInput) {
    const { username, password, role } = input;

    // Validate input
    if (!username || !password || !role) {
        throw new Error('Username, password, and role are required');
    }

    let name: string, last_name: string, phone_number: string;

    // Set name, last_name, and phone_number for KITCHEN and CASHIER roles
    if (role === Role.KITCHEN || role === Role.CASHIER) {
        name = last_name = phone_number = role.toLowerCase();
    } else {
        if (role !== Role.WAITER) {
            throw new Error('Invalid role');
        }
        // For other roles, validate that all fields are provided
        if (!('name' in input) || !('last_name' in input) || !('phone_number' in input)) {
            throw new Error('Name, last name, and phone number are required for this role');
        }
        ({ name, last_name, phone_number } = input);

        // Validate phone number format (simple regex for demonstration)
        const phoneRegex = /^0\d{9}$/;

        if (!phoneRegex.test(phone_number)) {
            throw new Error('Invalid phone number format');
        }
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            last_name,
            phone_number,
            username,
            password: hashedPassword,
            role,
        },
    });

    return user;
}