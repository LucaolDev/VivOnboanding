import {PrismaClient, Role} from '@prisma/client';

const prisma = new PrismaClient();

export const createTeam = async (req, res) => {
  const { name, departmentId, color } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Campo nome é obrigatório' });
  }
    const newTeam = await prisma.team.create({ data: { name: name, color, department: { connect: { name: departmentId } },}});

    res.status(201).json(newTeam);
 }

export const updateTeam = async (req, res) => {
 const { id, name, color, learderId } = req.body;

  if(!id){
    return res.status(400).json({ error: 'O ID é obrigatorio'})
  }

  const updateData = {};
  if(name !== undefined) updateData.name = name;
  if(color !== undefined) updateData.color = color;
  if(learderId !== undefined) updateData.learderId = {connect: {id: learderId}};

  try {
    await prisma.team.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Time atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar time' });
  }
};

export const deleteTeam = async (req, res) => {
  const { name } = req.params;

  try {
    await prisma.team.delete({
      where: { name }
    });

    return res.status(200).json({ message: 'Time deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar Time' });
  }
}

export const getTeam = async(req, res) => {
    try { 
      const teams = await prisma.team.findMany({
        select: { name: true },
      });

    return res.status(200).json(teams);
    } catch (error) {
      console.error('Erro ao buscar Times:', error);
      res.status(500).json({ error: 'Erro ao buscar times' });
    }
}