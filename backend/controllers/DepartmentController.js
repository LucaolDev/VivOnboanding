import {PrismaClient, Role} from '@prisma/client';

const prisma = new PrismaClient();

export const getDepartament = async(req, res) => {
    try { 
      const departments = await prisma.department.findMany({
        select: { name: true },
      });

    return res.status(200).json(departments);
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
      res.status(500).json({ error: 'Erro ao buscar departamentos' });
    }
}


export const createDepartment = async (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Campo nome é obrigatório' });
  }

  try{
    const newdepartamento = await prisma.department.create({ data: { name, color}});

    res.status(201).json(newdepartamento);
  }
  catch(error){
    res.status(500).json({error: 'Erro ao criar departamento'})
  }
 
};

export const updateDepartment = async (req, res) => {
 const { id, name, color, managerId } = req.body;

  if(!id){
    return res.status(400).json({ error: 'O ID é obrigatorio'})
  }

  const updateData = {};
  if(name !== undefined) updateData.name = name;
  if(color !== undefined) updateData.color = color;
  if(managerId !== undefined) updateData.managerId = {connect: {id: managerId}};

  try {
    await prisma.department.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Departamento atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar departamento' });
  }
};

export const deleteDepartment = async (req, res) => {
  const { name } = req.params;

  try {
    await prisma.department.delete({
      where: { name }
    });

    return res.status(200).json({ message: 'Departamento deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar departamento' });
  }
}
   