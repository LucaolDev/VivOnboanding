import React from 'react';
import { Home, BookOpen,  Users, FileText, Settings, Compass,BarChart3,UserCheck,Building,HelpCircle,LogOut} from 'lucide-react';
import logoVivo from '../../assets/vivo_logo_roxa.png';
import { useAuth } from '../../context/AuthContext';

interface SidebarProp{
    currentPage: string;
    onPageChange: (page: string) => void;
}

export const Menu: React.FC<SidebarProp> = ({ currentPage, onPageChange }) => {
    const {user, logout} = useAuth();

    const cargos: string[] = ['Coordenador', 'Gerente', 'Tech_Lead', 'Diretor'] 

    const getMenu = () => {
        const item = [
            {id: `home`, label: `Inicio`, icon: Home},
        ];

        const role = user?.role != undefined ? cargos.includes(user?.role) : false;
        const department = user?.department?.name?.toLowerCase() || "";

        if(user?.isNewUser === true){
            return [
                ...item,
                {id: 'trail', label: 'Trilha', icon: BookOpen},
                {id: 'tools', label: 'Ferramentas', icon: Settings},
                {id: 'team', label: 'Equipes', icon: Users},
                {id: 'docs', label: 'Docs', icon: FileText},
                {id: 'explore', label: 'Explore', icon: Compass},
                {id: 'help', label: 'Vivo Help', icon: HelpCircle},
            ];
        }
        else if(role && department !== "rh")
        {
            return[
             ...item,
                { id: 'team', label: 'Equipe', icon: Users },
                { id: 'progress', label: 'Progresso', icon: BarChart3 },
                { id: 'evaluations', label: 'Avaliações', icon: UserCheck },
                { id: 'docs', label: 'Documentos', icon: FileText },
            ];
        }
        else if(role && department === "rh"){
            return[
             ...item,
                { id: 'trails', label: 'Trilhas', icon: BookOpen },
                { id: 'users', label: 'Usuários', icon: Users },
                { id: 'documents', label: 'Documentos', icon: FileText },
                { id: 'platforms', label: 'Plataformas', icon: Compass },
                { id: 'reports', label: 'Relatórios', icon: BarChart3 },
            ];
        }
        return item;
    };

    const menuItem = getMenu();

    return (
        <div className="w-64 bg-white shadow-lg h-full flex flex-col">
        <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
            <div className="w-8 h-8 ">
                <img src={logoVivo} alt="Logo Vivo" className="h-8 w-auto"/>
            </div>
            <span className="text-xl font-bold text-gray-800">Vivo Starter</span>
            </div>
        </div>

        <nav className="flex-1 p-4">
            {menuItem.map((item) => {
            const Icon = item.icon;
            return (
                <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPage === item.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                </button>
            );
            })}
        </nav>

        <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
            <img
                src={user?.image}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
            />
            <div>
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
            </div>
            </div>
            <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
            <LogOut size={20} />
            <span>Sair</span>
            </button>
        </div>
        </div>
        );
    };


