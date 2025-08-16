import React, { use, useState } from 'react';
import {LoginForm} from './components/Auth/LoginForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Menu } from '../src/components/Layout/Sidebar';
import { Header } from '../src/components/Layout/Header';
import RhTrail from '../src/pages/Trilha/RhTrail';
import UserManagement from '../src/pages/GestaoUser/RhUser.js';

const AppContent: React.FC = () =>{
  const { user } = useAuth();
  const [ currentPage, setCurrentPage ] = useState('home');
  const department = user?.department?.name?.toLowerCase() || "";

  if(!user){
    return <LoginForm/>;
  }

  const getPageTitle = () => {
    switch(currentPage){
      case 'home':
        return 'Home';
      case 'trail':
        return 'Trilha de Integração';
      case 'tools':
        return 'Ferramentas Necessárias';
      case 'team':
        return 'Equipe e Organograma';
      case 'docs':
        return 'Documentação';
      case 'explore':
        return 'Explore as Plataformas Vivo';
      case 'progress':
        return 'Progresso da Equipe';
      case 'evaluations':
        return 'Avaliações';
      case 'trails':
        return 'Gestão de Trilhas';
      case 'users':
        return 'Gestão de Usúarios';
      case 'organization':
        return 'Organograma';
      case 'documents':
        return 'Gestão de Documentos';
      case 'platforms':
        return 'Gestão de Plataformas';
      case 'reports':
        return 'Relatórios';
      default:
        return 'Home';
    }
  };

  const renderContent = () => {
    if(user?.isNewUser === true){
      switch(currentPage){ 
        case 'home':
          return <UserManagement/>
      }
    }
    else if(user.role && department !== "rh"){
      switch(currentPage){ 
        case 'home':
          return <UserManagement/>
      }
    }else if(user.role && department === "rh"){
      switch(currentPage){ 
        case 'home':
          return <UserManagement/>
        default:
          return <UserManagement/>
      }
    }

    return <div>Página não encontrada</div>
  };

   return (
    <div className="flex h-screen bg-gray-50">
      <Menu currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

const App: React.FC = () =>{
  return(
    <AuthProvider>
      <AppContent/>
    </AuthProvider>
  )
}

export default App;