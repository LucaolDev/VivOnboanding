import { Department } from '../type/Tabelas';

const apiUrl = import.meta.env.VITE_API_URL;

export const getDepartments = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/department/getNames`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar departamentos');
  return await response.json();
};

export const updateDepartments = async (deptId: string, dep: Partial<Department>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/department/update/${deptId}`, {
    method: 'PUT',
    headers: {  'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(dep)
  });
  if (!response.ok) throw new Error('Erro ao atualizar departamentos');
  return await response.json();
};

export const createDepartments = async (dep: Partial<Department>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/department/register`, {
    method: 'POST',
    headers: {  'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(dep)
  });
  if (!response.ok) throw new Error('Erro ao criar departamentos');
  return await response.json();
};