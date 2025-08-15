import { User } from '../type/Tabelas';

const apiUrl = import.meta.env.VITE_API_URL;

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Email ou senha inválidos');
  }

  return await response.json(); 
};

export const createUser = async (userData: any) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${apiUrl}/auth/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar usuário');
  }

  return await response.json();
};

export const changePassword = async (email: string, currentPassword: string, newPassword: string) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${apiUrl}/user/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, currentPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error('Erro ao alterar senha');
  }

  return await response.json();
};

export const getAllUsers = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${apiUrl}/user/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar usuários');
  }

  return await response.json();
};

export const deleteUser = async (id: number) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${apiUrl}/user/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao deletar usuário');
  }

  return await response.json();
};

export const updateUser = async (id: number, userData: Partial<User>) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${apiUrl}/user/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar usuário');
  }

  return await response.json();
};

