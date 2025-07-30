import React, { useActionState, useState} from 'react';
import { useAuth } from '../../context/AuthContext';
import logoVivo from '../../assets/vivo_logo_roxa.png';

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();

    console.log("Entrando no Login")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try{
            await login(email, password);
        }catch(err){
            setError('Email ou senha incorretos');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
            <img src={logoVivo} alt="Logo Vivo" className="mx-auto h-16 w-auto"/>
            <h1 className="text-2xl font-bold text-gray-800">Vivo Starter</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
                </label>
                <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Digite seu email"
                required
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
                </label>
                <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Digite sua senha"
                required
                />
            </div>

            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            </form>
        </div>
        </div>
    );
};
