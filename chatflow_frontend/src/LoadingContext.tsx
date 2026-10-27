import { createContext, useContext, useState } from "react";

interface LoadingContextType {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const UseLoading = () => {
    const context = useContext(LoadingContext);

    if (!context) {
        throw new Error("UseLoading must be used inside LoadingProvider");
    }

    return context;
};