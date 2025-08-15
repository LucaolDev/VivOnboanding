import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Building, Save, X, UserPlus, Crown, Mail, Phone, ChevronDown, ChevronRight, Monitor } from 'lucide-react';
import { Team, Department, User } from '../../type/Tabelas';
import { getDepartments, updateDepartments, createDepartments, deleteDepartment } from '../../services/departmentService';
import { createTeam, updateTeams, deleteTeam } from '../../services/teamService';
import { getAllUsers, createUser, updateUser } from '../../services/userService';






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
      departmentId, // ✅ agora vem o ID correto
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
    try {
      if (departments.find(d => d.id === dept.id)) {
        await updateDepartments(dept.id, dept);
        setDepartments(departments.map(d => d.id === dept.id ? dept : d));
      } else {
        const newDepartments = await createDepartments(dept);
        setDepartments([...departments, newDepartments]);
      }

      setShowDepartmentModal(false);
      setEditingDepartment(null);
    } catch (error) {
      console.error("Erro ao salvar departamento: ", error);
    }
  }

  const handleSaveTeam = async (team: Team) => {
    try {
      let updateTeam: Team;
      const teamExist = departments
        .find(dept => dept.id === team.departmentId)
        ?.teams?.some(t => t.id === team.id);

      if (teamExist) {
        updateTeam = await updateTeams(team.id, team);
      } else {
        updateTeam = await createTeam(team);
      }

      const updateDepartments = departments.map(dept => {
        if (dept.id === team.departmentId) {
          const existingTeamIndex = dept.teams?.findIndex(t => t.id === updateTeam.id);

          if (existingTeamIndex !== undefined && existingTeamIndex >= 0) {
            dept.teams![existingTeamIndex] = updateTeam;
          } else {
            dept.teams?.push(updateTeam);
          }
        }
        return dept;
      });
      setDepartments(updateDepartments);
      setShowTeamModal(false);
      setEditingTeam(null);
    } catch (error) {
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
                  className={`border rounded-lg transition-colors ${selectedDepartment?.id === dept.id
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
                  <span className="text-gray-600">{selectedDepartment?.id !== undefined ? getDepartmentUsers(selectedDepartment?.id).length : null} funcionários</span>
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
                            onClick={() => handleDeleteTeam(selectedDepartment.id, team.id)}
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
                              <span>Time: {getTeamName(user?.teamId || '')}</span>
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
};


interface DepartmentModalProps {
  department: Department;
  users: User[];
  onSave: (department: Department) => void;
  onClose: () => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ department, users, onSave, onClose }) => {
  const [formData, setFormData] = useState<Department>(department);

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {department.id ? 'Editar Departamento' : 'Novo Departamento'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Departamento
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor do Departamento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full ${color} ${formData.color === color ? 'ring-2 ring-gray-400' : ''
                    }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gerente do Departamento
            </label>
            <select
              value={formData.managerId?.id || ''}
              onChange={(e) => {
                const selectedUserId = e.target.value;
                const selectedUser = selectedUserId
                  ? users.find(u => u.id === selectedUserId)
                  : undefined;
                setFormData({ ...formData, managerId: selectedUser });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione um gerente</option>
              {users.filter(u => u.isManager).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para edição de times
interface TeamModalProps {
  team: Team;
  users: User[];
  onSave: (team: Team) => void;
  onClose: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ team, users, onSave, onClose }) => {
  const [formData, setFormData] = useState<Team>(team);

  const colors = [
    'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-orange-400',
    'bg-red-400', 'bg-yellow-400', 'bg-pink-400', 'bg-indigo-400',
    'bg-cyan-400', 'bg-emerald-400', 'bg-teal-400', 'bg-lime-400'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {team.id ? 'Editar Time' : 'Novo Time'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Time
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor do Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full ${color} ${formData.color === color ? 'ring-2 ring-gray-400' : ''
                    }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Líder do Time
            </label>
            <select
              value={formData.leaderId?.id || ''}
              onChange={(e) => {
                const selectedUserId = e.target.value;
                const selectedUser = users.find(u => u.id === selectedUserId);
                setFormData({ ...formData, leaderId: selectedUser });
              }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione um líder</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para edição de usuários
interface UserModalProps {
  user: User;
  departments: Department[];
  users: User[];
  onSave: (user: User) => void;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, departments, users, onSave, onClose }) => {
  const [formData, setFormData] = useState<User>(user);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(
    departments.find(d => d.id === user.departmentId) || null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDepartmentChange = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    setSelectedDepartment(dept || null);
    setFormData({
      ...formData,
      departmentId: deptId,
      teamId: undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {user.id ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="Jovem_Aprendiz">Jovem Aprendiz</option>
              <option value="Estagio">Estágio</option>
              <option value="Assistente">Assistente</option>
              <option value="Analista_Junior">Analista Júnior</option>
              <option value="Analista_Pleno">Analista Pleno</option>
              <option value="Analista_Senior">Analista Sênior</option>
              <option value="Analista_Dados">Analista de Dados</option>
              <option value="DevOps">DevOps</option>
              <option value="Scrum_Master">Scrum Master</option>
              <option value="Desenvolvedor_Junior">Desenvolvedor Júnior</option>
              <option value="Desenvolvedor_Pleno">Desenvolvedor Pleno</option>
              <option value="Desenvolvedor_Senior">Desenvolvedor Sênior</option>
              <option value="QA_Junior">QA Júnior</option>
              <option value="QA_Pleno">QA Pleno</option>
              <option value="QA_Senior">QA Sênior</option>
              <option value="Especialista">Especialista</option>
              <option value="Coordenador">Coordenador</option>
              <option value="Tech_Lead">Tech Lead</option>
              <option value="Gerente">Gerente</option>
              <option value="Gerente_Senior">Gerente Sênior</option>
              <option value="Executivo">Executivo</option>
              <option value="Diretor">Diretor</option>
              <option value="Vice_Presidente">Vice-Presidente</option>
              <option value="CEO">CEO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Selecione um departamento</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {selectedDepartment && selectedDepartment.teams.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <select
                value={formData.teamId || ''}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione um time</option>
                {selectedDepartment.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          

          

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gerente
            </label>
            <select
              value={formData.managerId || ''}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione um gerente</option>
              {users
                .filter(u => u.isManager && u.id !== formData.id)
                .map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} - {manager.role}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isManager"
              checked={formData.isManager}
              onChange={(e) => setFormData({ ...formData, isManager: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isManager" className="text-sm text-gray-700">
              É gerente/líder
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


