import { Step } from '../type/Tabelas';

const apiUrl = import.meta.env.VITE_API_URL;

export const saveStep = async(step: Step, trailId: string) => {
    const endpoint = step.id !== undefined ? `${apiUrl}/step/register/${step.id}` : `${apiUrl}/step/register`;
    console.log(endpoint)
    const methood = step.id ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    const response = await fetch(endpoint, {
        method: methood,
        headers: { 'content-Type' : 'application/json', Authorization: `Bearer ${token}`,},
        body: JSON.stringify({...step, trailId }),
      });

      if(!response.ok) throw new Error('Erro ao salvar etapa');
      return response.json();
}

export async function updateStep(stepId: string, stepData: Partial<Step>) {
  console.log("chamando : " + stepId + "stepData " + stepData )

  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/step/updateStep/${stepId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(stepData),
  });

  if (!response.ok) throw new Error('Erro ao atualizar step');
  return await response.json();
}

export async function deleteStep(id: string) {
  const token = localStorage.getItem('token');
  console.log(id)
  const response = await fetch(`${apiUrl}/step/delete/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Erro ao deletar step');
}