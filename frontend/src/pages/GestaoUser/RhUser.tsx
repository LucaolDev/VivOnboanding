import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Building,Save,X,UserPlus,Crown, Mail,Phone,ChevronDown,ChevronRight } from 'lucide-react';
import { Team, Department, User } from '../../type/Tabelas';
import { getDepartments, updateDepartments, createDepartments  } from '../../services/departmentService';
import { createTeam, updateTeams } from '../../services/teamService';
import { getAllUsers } from '../../services/userService';


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

    const [selectedDepartment, setSelectDepartment] = useState<Department | null>(null);
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
        try{
            if(users.find(d => d.id === user.id)){
                await updatedUser(user.id, user);
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




}