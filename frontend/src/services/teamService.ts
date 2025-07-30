import { Team } from '../type/Tabelas';

const apiUrl = import.meta.env.VITE_API_URL;

export const getTeams = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/team/getNames`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar times');
  return await response.json();
};

export const updateTeams = async (teamId: string, team: Partial<Team>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/team/update/${teamId}`, {
    method: 'PUT',
    headers: {  'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(team)
  });
  if (!response.ok) throw new Error('Erro ao atualizar time');
  return await response.json();
};

export const createTeam = async (dep: Partial<Team>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/team/register`, {
    method: 'POST',
    headers: {  'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(dep)
  });
  if (!response.ok) throw new Error('Erro ao criar time');
  return await response.json();
};