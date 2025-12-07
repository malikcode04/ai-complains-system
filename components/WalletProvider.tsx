"use client";
import { useState, useEffect, createContext, useContext } from 'react';

// Mock types
interface WalletContextType {
    address: string | null;
    smartAccountAddress: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // Check localStorage
        const saved = localStorage.getItem('wallet_address');
        if (saved) {
            setAddress(saved);
            setSmartAccountAddress(deriveSmartAccount(saved));
        }
    }, []);

    const deriveSmartAccount = (addr: string) => {
        // Deterministic mock derivation
        // Replaces last 4 chars with 'SAFE' (mock)
        return addr.substring(0, addr.length - 4) + 'SAFE';
    };

    const connect = async () => {
        setIsConnecting(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Sim delay

        // In real app, window.ethereum.request(...)
        // Here we generate random mocks or ask user?
        // Let's just mock a fixed demo wallet or random
        const mockAddr = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
        setAddress(mockAddr);
        setSmartAccountAddress(deriveSmartAccount(mockAddr));
        localStorage.setItem('wallet_address', mockAddr);
        setIsConnecting(false);
    };

    const disconnect = () => {
        setAddress(null);
        setSmartAccountAddress(null);
        localStorage.removeItem('wallet_address');
    };

    return (
        <WalletContext.Provider value={{ address, smartAccountAddress, connect, disconnect, isConnecting }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
