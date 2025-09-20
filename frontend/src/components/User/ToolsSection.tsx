import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, Check } from 'lucide-react';
import axios from 'axios';

interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    url: string;
    icon: string;
    isInstalled: boolean;
    isRequired: boolean;
}

const ToolsSection: React.FC = () => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    useEffect(() => {
        const fetchTools = async () => {
            try {
                const res = await axios.get<Tool[]>("http://localhost:3000/tools");
                setTools(res.data);
            } catch (err) {
                console.error("Erro ao buscar ferramentas:", err);
            }
        };
        fetchTools();
    }, []);

    const categories = Array.from(new Set(tools.map(tool => tool.category)));

    const filteredTools = tools.filter(tool =>
        (tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase())) &&
        (filterCategory ? tool.category === filterCategory : true)
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Ferramentas Necessárias</h2>
                <p className="text-gray-600 mb-6">
                    Aqui estão todas as ferramentas que você precisará instalar e configurar para começar a trabalhar.
                    Para ferramentas que exigem licença, você pode solicitar diretamente por aqui.
                </p>

                {/* Filtros */}
                <div className="flex items-center justify-between mb-6">
                    <input
                        type="text"
                        placeholder="Buscar Ferramentas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Todas Categorias</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Lista de ferramentas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map((tool) => (
                        <div key={tool.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{tool.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{tool.name}</h3>
                                        <span className="text-sm text-gray-500">{tool.category}</span>
                                    </div>
                                </div>
                                {tool.isInstalled && <Check className="text-green-500" size={20} />}
                            </div>

                            <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {tool.isRequired && (
                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                            Obrigatório
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500">{tool.category}</span>
                                </div>

                                <div className="flex space-x-2">
                                    {tool.isInstalled ? (
                                        <button className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                                            Instalado
                                        </button>
                                    ) : (
                                        <>
                                            <a
                                                href={tool.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1"
                                            >
                                                <Download size={14} />
                                                <span>Download</span>
                                            </a>
                                            <a
                                                href={tool.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
                                            >
                                                <ExternalLink size={14} />
                                                <span>Acessar</span>
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            {tool.isRequired && !tool.isInstalled && (
                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-yellow-800 text-xs">
                                        Esta ferramenta é obrigatória para suas atividades.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ToolsSection;
