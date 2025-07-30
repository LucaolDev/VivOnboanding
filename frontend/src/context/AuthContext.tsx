import React, {createContext, useContext, useState, useEffect} from 'react';
import { User } from '../type/Tabelas';

interface AuthType{
    user: User | null;
    login: (email: string, password : string ) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthType | undefined>(undefined);

const apiUrl = import.meta.env.VITE_API_URL;

export const useAuth = () => {
    const context = useContext(AuthContext);

    if(!context){
        throw new Error('useAuth deve ser utilizado no AuthProvider');
    }

    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if(storedUser && token){
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async(email: string, password: string) => {
        setIsLoading(true);

        try{
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({email, password}),
            });
           
            if(!response.ok){
                throw new Error('Email ou senha inválidos');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        }catch(error){
            console.error(error);
            throw new Error('Erro ao autenticar o user')
        }finally{
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return(
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

