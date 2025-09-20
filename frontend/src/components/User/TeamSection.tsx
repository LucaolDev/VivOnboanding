import React, { useEffect, useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface TeamMember {
    id: string;
    name: string;
    position: string;
    department: string;
    avatar?: string;
    email: string;
    isManager?: boolean;
}

const TeamSection: React.FC<{ userId: string }> = ({ userId }) => {
    const [manager, setManager] = useState<TeamMember | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/auth/${userId}/team`);
                const data = res.data as {
                    manager?: {
                        id: string;
                        name: string;
                        role: string;
                        image?: string;
                        email: string;
                    };
                    team?: {
                        department?: { name?: string };
                        users?: Array<{
                            id: string;
                            name: string;
                            role: string;
                            image?: string;
                            email: string;
                        }>;
                    };
                };

                if (data.manager) {
                    setManager({
                        id: data.manager.id,
                        name: data.manager.name,
                        position: data.manager.role,
                        department: data.team?.department?.name ?? "Sem departamento",
                        avatar: data.manager.image,
                        email: data.manager.email,
                        isManager: true
                    });
                }

                if (data.team?.users) {
                    setTeamMembers(
                        data.team.users.map((u) => ({
                            id: u.id,
                            name: u.name,
                            position: u.role,
                            department: data.team?.department?.name ?? "Sem departamento",
                            avatar: u.image,
                            email: u.email
                        }))
                    );
                }
            } catch (err) {
                console.error("Erro ao carregar equipe:", err);
            }
        };

        fetchTeam();
    }, [userId]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Equipe e Organograma</h2>
                <p className="text-gray-600 mb-6">
                    Conheça sua Equipe - Aqui está o organograma da sua equipe e estrutura hierárquica.
                </p>
            </div>

            {/* Organograma */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Organograma</h3>

                <div className="flex flex-col items-center space-y-8">
                    {/* Nível 1 - Gerente */}
                    {manager && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                                <img
                                    src={manager.avatar || "https://via.placeholder.com/150"}
                                    alt={manager.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h4 className="font-semibold text-gray-800">{manager.name}</h4>
                            <p className="text-sm text-gray-600">{manager.position}</p>
                        </div>
                    )}

                    {/* Linha conectora */}
                    {teamMembers.length > 0 && <div className="w-px h-8 bg-gray-300"></div>}

                    {/* Nível 2 - Membros */}
                    <div className="flex justify-center space-x-8">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
                                    <img
                                        src={member.avatar || "https://via.placeholder.com/150"}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h4 className="font-medium text-gray-800 text-sm">{member.name}</h4>
                                <p className="text-xs text-gray-600">{member.position}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Card da Gerente */}
            {manager && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sua Gerente</h3>
                    <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden">
                            <img
                                src={manager.avatar || "https://via.placeholder.com/150"}
                                alt={manager.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{manager.name}</h4>
                            <p className="text-gray-600 mb-2">{manager.position}</p>
                            <div className="flex space-x-3">
                                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                    <Mail size={16} />
                                    <span>Enviar e-mail</span>
                                </button>
                                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                    <MessageCircle size={16} />
                                    <span>Agendar conversa</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default TeamSection;
