const apiUrl = import.meta.env.VITE_API_URL;

export const getUserDashboardData = async (userId: string): Promise<UserDashboardData> => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Token de autenticação não encontrado. Por favor, faça login novamente.');
    }

    const response = await fetch(`${apiUrl}/dashboard/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        let errorMessage = 'Erro desconhecido ao buscar dados do dashboard.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (e) {
            errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return await response.json();
};


export const getUserTrailProgress = async (userId: string, trailId: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado.');

    const response = await fetch(`${apiUrl}/dashboard/user/${userId}/trail/${trailId}/progress`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
    }

    return await response.json();
};
