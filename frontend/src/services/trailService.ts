import { Trail } from '../type/Tabelas';

const apiUrl = import.meta.env.VITE_API_URL;

export async function getAllTrails() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/trail/allTrails`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Erro ao buscar trilhas');
  return await response.json();
}

export async function createTrail(trail: Partial<Trail>) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/trail/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(trail),
  });
  if (!response.ok) throw new Error('Erro ao criar trilha');
  return await response.json();
}

export async function updatedTrail(id: string, trail: Trail) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/trail/update/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: trail.id,
      newTitle: trail.title,
      newDescription: trail.description,
      newDepartment: trail.department?.name ?? null
    }),
  });
  if (!response.ok) throw new Error('Erro ao atualizar trilha');
  return await response.json();
}

export async function deleteTrail(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/trail/delete/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Erro ao deletar trilha');
}
