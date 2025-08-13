import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const createTrail = async (req, res) => {

  const { id, title, description, department, duration, isActive, createdAt, assignedUsers, team} = req.body;

  try{
    const newTrail = await prisma.trail.create({
      data: { 
        title,
        description,
        duration: 0,
        createdAt: new Date(),
        assignedUsers: 0,
        isActive
      }
    });

    //users do mesmo departamento
    const allUsers = await prisma.user.findMany({
        where:{
            department: {
              name: department
            },
            ...(team && {
              team: {
                name: team
              }})
           }
    });

    //registros do relacionamento
    const userOnTrail = allUsers.map(u => ({
        userId: u.id,
        trailId: newTrail.id
    }));

    await prisma.userOnTrail.create({userOnTrail});

    const updateTrail = await prisma.trail.update({
        where:{ id: newTrail.id },
        data: {
            assignedUsers: allUsers.length
        }
    });

    res.status(200).json({ message: 'Trilha criada e usuários associados com sucesso.', trail: updateTrail});
  }
  catch (error) {
    console.error('Erro ao criar a Trilha:', error)
    res.status(500).json({ error: 'Erro ao criar a Trilha:' })
  }
};

export const updateTrail = async (req, res) => {

  const {id,newTitle = null, newDescription = null, newDepartment = null} = req.body;

  try {
    const trailUpdate = await prisma.trail.findUnique({ where: { id } });

    if(!trailUpdate){
      return res.status(404).json({ message: 'Trilha não encontrado'});
    }

    const updateData ={
      ...(newTitle && { title: newTitle}),
      ...(newDescription && {description: newDescription}),
      ...(newDepartment &&{
        department:{connect: {name: newDepartment}}
      })
    };

    await prisma.trail.update({
      where:{ id },
      data: updateData
    });

    res.status(200).json({ message : 'Trilha alterada!'});
  } catch (error) {
    console.error('Erro ao atualizar a Trilha', error)
    res.status(500).json({ error: 'Erro ao atualizar a Trilha' })
  }
};

export const getTrails = async (req, res) => {

  try{
    const trails = await prisma.trail.findMany({
      include:{
        step: {
          include:{
            content: true,
          }
        }
      }
    });

    res.status(200).json(trails);
  }catch(error){
    res.status(500).json({ error: 'Erro ao buscar trilhas'});
  }
}

export const deleteTrail = async (req, res) => {
  const { id } = req.params;

  try{
    await prisma.content.deleteMany({
      where:{
        step:{
          trailId: id,
        }
      }
    });

    await prisma.step.deleteMany({
      where:{ trailId: id},
    });

    await prisma.trail.delete({
      where:{id},
    });
    
    return res.status(200).json({ message: 'Trilha deletada com sucesso'});
  }catch(error){
    return res.status(200).json({ error: 'Erro ao deletar trilha'});
  }
}
