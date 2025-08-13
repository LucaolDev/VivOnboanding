import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Building,Save,X,UserPlus,Crown, Mail,Phone,ChevronDown,ChevronRight, Monitor } from 'lucide-react';
import { Team, Department, User } from '../../type/Tabelas';
import { getDepartments, updateDepartments, createDepartments, deleteDepartment } from '../../services/departmentService';
import { createTeam, updateTeams, deleteTeam} from '../../services/teamService';
import { getAllUsers, createUser, updateUser} from '../../services/userService';




const UserManagement: React.FC = () => {

     const [departments, setDepartments] = useState<Department[]>([]);
     const [users, setUsers] = useState<User[]>([]);
    
      useEffect(() => {
      const fetch = async () => {
        try {
          const departamentos = await getDepartments();
          setDepartments(departamentos);

          const user = await getAllUsers();
          setUsers(user)
        } catch (error) {
          console.error('Erro ao buscar departamentos/users:', error);
        }
      };
    
        fetch();
        }, []);

    const [selectedDepartment, setSelectDepartment] = useState<Department>();
    const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    //criação
    const handleCreateDepartment = () => {
        setEditingDepartment({
        id: Date.now().toString(),
        name: '',
        color: 'bg-blue-500',
        userCount: 0,
        teams: []
        });
        setShowDepartmentModal(true);
    };

    const handleCreateTeam = (departmentId: string) => {
        setEditingTeam({
        id: Date.now().toString(),
        name: '',
        departmentId: '',
        memberCount: 0,
        color: 'bg-blue-400'
        });
        setShowTeamModal(true);
    };

    const handleCreateUser = () => {
        setEditingUser({
        id: Date.now().toString(),
        name: '',
        email: '',
        password: '',
        role: 'Assistente',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr3jhpAFYpzxx39DRuXIYxNPXc0zI5F6IiMQ&s',
        createdAt: new Date().toISOString().split('T')[0],
        isNewUser: false
        });
        setShowUserModal(true);
    };

    //edição
    const handleEditDepartment = (dept: Department) => {
        setEditingDepartment(dept);
        setShowDepartmentModal(true);
    };

    const handleEditTeam = (team: Team) => {
        setEditingTeam(team);
        setShowTeamModal(true);
    };

    //salvamento dos dados e chamada das rotas de edição
    const handleSaveDepartment = async (dept: Department) => {
        try{
            if(departments.find(d => d.id === dept.id)){
                await updateDepartments(dept.id, dept);
                setDepartments(departments.map(d => d.id === dept.id ? dept : d));
            }else {
                const newDepartments = await createDepartments(dept);
                setDepartments([...departments, newDepartments]);
            }

            setShowDepartmentModal(false);
            setEditingDepartment(null);
        }catch(error){
            console.error("Erro ao salvar departamento: ", error);
        }
    }

    const handleSaveTeam = async (team: Team) => {
       try{
        let updateTeam: Team;
        const teamExist = departments
        .find(dept => dept.id === team.departmentId)
        ?.teams?.some(t => t.id === team.id);

        if(teamExist){
            updateTeam = await updateTeams(team.id, team);
        }else{
            updateTeam= await createTeam(team);
        }

        const updateDepartments = departments.map(dept => {
            if(dept.id === team.departmentId){
                const existingTeamIndex = dept.teams?.findIndex(t => t.id === updateTeam.id);

                if(existingTeamIndex !== undefined && existingTeamIndex >= 0){
                    dept.teams![existingTeamIndex] = updateTeam;
                }else{
                    dept.teams?.push(updateTeam);
                }
            }
            return dept;
        });
        setDepartments(updateDepartments);
        setShowTeamModal(false);
        setEditingTeam(null);
       }catch(error){
        console.error("Erro ao salvar o time: ", error);
       }
    }

    const handleSaveUser = async (user: User) => {
   try {
    if (users.find(u => u.id === user.id)) {
      // Atualiza usuário existente
      await updateUser(Number(user.id), user);
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      // Cria novo usuário
      const newUser = await createUser(user);
      setUsers([...users, newUser]);
    }

    setShowUserModal(false);
    setEditingUser(null);
  } catch (error) {
    console.error("Erro ao salvar usuário: ", error);
  }
};

const handleDeleteDepartment = async (departmentId: string) => {
  try {
    await deleteDepartment(departmentId); // Chamada para deletar no backend
    setDepartments(departments.filter(d => d.id !== departmentId)); // Remove localmente
  } catch (error) {
    console.error("Erro ao excluir departamento: ", error);
  }
};

const handleDeleteTeam = async (departmentId: string, teamId: string) => {
  try {
    await deleteTeam(teamId); // Chamada para deletar no backend
    const updatedDepartments = departments.map(dept => {
      if (dept.id === departmentId) {
        return {
          ...dept,
          teams: dept.teams?.filter(t => t.id !== teamId) || []
        };
      }
      return dept;
    });
    setDepartments(updatedDepartments);
  } catch (error) {
    console.error("Erro ao excluir time: ", error);
  }
};

const toggleTeamExpansion = (teamId: string) =>
  setExpandedTeams(prev =>
    prev.includes(teamId)
      ? prev.filter(id => id !== teamId)
      : [...prev, teamId]
  );

  const getDepartmentUsers = (departmentId: string) => {
  return users.filter(user => user.departmentId === departmentId);
};

const getTeamUsers = (teamId: string) => {
  return users.filter(user => user.teamId === teamId);
};

const getTeamName = (teamId: string) => {
  if (!teamId) return 'Sem time';
  for (const dept of departments) {
    const team = dept.teams?.find(t => t.id === teamId);
    if (team) {
      return team.name;
    }
  }
  return 'Time não encontrado';
};

const getManagerName = (managerId: string) => {
  const manager = users.find(user => user.id === managerId);
  return manager ? manager.name : 'Gerente não encontrado';
};

return(
<div></div>
);

return ( 
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Gestão de Usuários</h2>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateDepartment}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Building size={20} />
              <span>Nova Área</span>
            </button>
            <button
              onClick={handleCreateUser}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={20} />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Departamentos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Departamentos</h3>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className={`border rounded-lg transition-colors ${
                    selectedDepartment?.id === dept.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectDepartment(dept)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${dept.color}`}></div>
                        <h4 className="font-medium text-gray-800">{dept.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDepartment(dept);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDepartment(dept.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{getDepartmentUsers(dept.id).length} funcionários</span>
                      <span>{dept.teams?.length} times</span>
                    </div>
                  </div>

                  {/* Times do Departamento */}
                  {dept.teams?.length !== undefined && dept.teams?.length > 0 && (
                    <div className="border-t border-gray-100 px-4 pb-2">
                      <div className="space-y-2 mt-2">
                        {dept.teams.map((team) => (
                          <div key={team.id} className="ml-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleTeamExpansion(team.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  {expandedTeams.includes(team.id) ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronRight size={14} />
                                  )}
                                </button>
                                <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                                <span className="text-sm font-medium text-gray-700">{team.name}</span>
                                <span className="text-xs text-gray-500">({getTeamUsers(team.id).length})</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleEditTeam(team)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(dept.id, team.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Membros do Time */}
                            {expandedTeams.includes(team.id) && (
                              <div className="ml-6 mt-2 space-y-1">
                                {getTeamUsers(team.id).map((user) => (
                                  <div key={user.id} className="flex items-center space-x-2 text-xs text-gray-600">
                                    <img
                                      src={user.image}
                                      alt={user.name}
                                      className="w-4 h-4 rounded-full"
                                    />
                                    <span>{user.name}</span>
                                    {user.manager && <Crown size={10} className="text-yellow-500" />}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detalhes do Departamento */}
        <div className="lg:col-span-2">
          {selectedDepartment ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full ${selectedDepartment?.color}`}></div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedDepartment?.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => selectedDepartment?.id !== undefined ? handleCreateTeam(selectedDepartment?.id) : null}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Novo Time</span>
                  </button>
                  <Users size={20} className="text-gray-400" />
                  <span className="text-gray-600">{ selectedDepartment?.id !== undefined ? getDepartmentUsers(selectedDepartment?.id).length : null} funcionários</span>
                </div>
              </div>

              {/* Times do Departamento */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">Times</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDepartment?.teams?.map((team) => (
                    <div key={team.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full ${team.color}`}></div>
                          <h5 className="font-medium text-gray-800">{team.name}</h5>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditTeam(team)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(dept?.id, team.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{getTeamUsers(team.id).length} membros</p>
                        {team.leaderId && (
                          <p>Líder: {getManagerName(team?.leaderId.id)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funcionários do Departamento */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">Funcionários</h4>
                <div className="space-y-4">
                  {getDepartmentUsers(selectedDepartment?.id).map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-gray-800">{user.name}</h5>
                              {user.manager && (
                                <Crown className="text-yellow-500" size={16} />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{user.role}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{user.email}</span>
                              <span>Time: {getTeamName(user.teamId)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Mail size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <Phone size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-12">
                <Building className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Selecione um departamento</h3>
                <p className="text-gray-600">Escolha um departamento para visualizar seus times e funcionários</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Departamento */}
      {showDepartmentModal && editingDepartment && (
        <DepartmentModal
          department={editingDepartment}
          users={users}
          onSave={handleSaveDepartment}
          onClose={() => {
            setShowDepartmentModal(false);
            setEditingDepartment(null);
          }}
        />
      )}

      {/* Modal de Time */}
      {showTeamModal && editingTeam && (
        <TeamModal
          team={editingTeam}
          users={users.filter(u => u.departmentId === editingTeam?.departmentId)}
          onSave={handleSaveTeam}
          onClose={() => {
            setShowTeamModal(false);
            setEditingTeam(null);
          }}
        />
      )}

      {/* Modal de Usuário */}
      {showUserModal && editingUser && (
        <UserModal
          user={editingUser}
          departments={departments}
          users={users}
          onSave={handleSaveUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );

interface DepartmentModalProps {
  department: Department;
  users: User[];
  onSave: (department: Department) => void;
  onClose: () => void;
}



}