"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface CustomerContextType {
    customer: Customer | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('lensvik_customer');
        if (stored) {
            try {
                setCustomer(JSON.parse(stored));
            } catch (e) {
                localStorage.removeItem('lensvik_customer');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/customers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) return false;

            const data = await res.json();
            setCustomer(data.customer);
            localStorage.setItem('lensvik_customer', JSON.stringify(data.customer));
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const signup = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/customers/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password }),
            });

            if (!res.ok) return false;

            const data = await res.json();
            setCustomer(data.customer);
            localStorage.setItem('lensvik_customer', JSON.stringify(data.customer));
            return true;
        } catch (error) {
            console.error('Signup failed:', error);
            return false;
        }
    };

    const logout = () => {
        setCustomer(null);
        localStorage.removeItem('lensvik_customer');
    };

    return (
        <CustomerContext.Provider value={{ customer, login, signup, logout, isLoading }}>
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomer() {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomer must be used within a CustomerProvider');
    }
    return context;
}