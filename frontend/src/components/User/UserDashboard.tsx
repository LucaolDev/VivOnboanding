import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, BookOpen, Users, Award } from 'lucide-react';
import ProgressCircle from './ProgressCircle';
import { useAuth } from '../../context/AuthContext';
import { getUserDashboardData } from '../../services/dashboardService';


interface DashboardData {
  modulesCompleted: number;
  totalModules: number;
  studyHours: number;
  colleaguesKnown: number;
  certifications: number;
  progressPercentage: number;
  recentActivities: { id: string; type: string; title: string; time: string; icon: string; }[];
}


const UserDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getUserDashboardData(user.id);
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthLoading) {
      fetchDashboardData();
    }
  }, [user, isAuthLoading]);

  if (isAuthLoading || isLoading) {
    return <div>Carregando dashboard...</div>;
  }

  if (error) {
    return <div>Erro ao carregar dados do dashboard: {error}</div>;
  }

  if (!dashboardData) {
    return <div>Nenhum dado de dashboard disponível.</div>;
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Módulos Concluídos',
      value: `${dashboardData.modulesCompleted}/${dashboardData.totalModules}`,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Clock,
      label: 'Horas de Estudo',
      value: `${dashboardData.studyHours}h`,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Users,
      label: 'Colegas Conhecidos',
      value: `${dashboardData.colleaguesKnown}`,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Award,
      label: 'Certificações',
      value: `${dashboardData.certifications}`,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name}!</h1>
            <p className="text-purple-100">
              Continue sua jornada de integração na Vivo
            </p>
          </div>
          <div className="text-right">
            <ProgressCircle percentage={dashboardData.progressPercentage} size={80} strokeWidth={6} color="#ffffff" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Progresso da Trilha</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Trilha de Integração</span>
              <span className="text-purple-600 font-medium">{dashboardData.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${dashboardData.progressPercentage}%` }}></div>
            </div>
            <p className="text-sm text-gray-500">
              {dashboardData.modulesCompleted} de {dashboardData.totalModules} módulos concluídos
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            {dashboardData.recentActivities.map((activity) => {
              const Icon = activity.icon === 'CheckCircle' ? CheckCircle : BookOpen;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${activity.type === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                    <Icon size={16} className={
                      activity.type === 'completed' ? 'text-green-600' : 'text-blue-600'
                    } />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximos Passos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Continue o Código de Ética</h4>
            <p className="text-sm text-gray-600 mb-3">
              Finalizar o módulo sobre comportamentos esperados
            </p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Continuar
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Conheça sua Equipe</h4>
            <p className="text-sm text-gray-600 mb-3">
              Explore o organograma e conheça seus colegas
            </p>
            <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Explorar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;