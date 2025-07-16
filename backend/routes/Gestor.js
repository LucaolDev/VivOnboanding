import express from 'express';
import {PrismaClient} from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.urlencoded({extended: true}));
router.use(express.json());

router.post('/', async (req, res) => {
  try {
    const { name, email, Funcionario } = req.body;

    const gestor = await prisma.Gestor.create({
       data: {
        name,
        email,
        funcionarios: {
          create: Funcionario || []
        }
      }
    });

    res.status(200).json(gestor);
  } catch (error) {
    console.error('Erro ao cadastrar o gestor: ', error);
    res.status(500).json({ error: 'Erro ao cadastrar gestor' });
  }
});

router.get('/', async (req, res) => {
  try {
    const gestor = await prisma.Gestor.findMany({})
    res.status(200).json(gestor)
  } catch (error) {
    console.error('Erro ao buscar gestor:', error)
    res.status(500).json({ error: 'Erro ao buscar gestor' })
  }
})

router.put('/:id', async (req, res) => {
    const {id} = req.params;
    const {name, email} = req.body;
  try {
    const gestorAtualizado = await prisma.Gestor.update({
        where: {id: Number(id)},
        data: {name, email},
    });

    res.status(200).json(gestorAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar o gestor:', error)
    res.status(500).json({ error: 'Erro ao atualizar o gestor:' })
  }
})

router.delete('/:id', async (req, res) => {
    const {id} = req.params;

    try{
        const funcionarioAssociados = await prisma.Funcionario.count({
            where: { gestorId: Number(id)}
        });

        if(funcionarioAssociados > 0){
            return res.status(400).json({
                error:'Gestor possui funcionários associados. Atualize os gestores dos funcionários antes de deletar.'
            })
        }

        await prisma.Gestor.delete({
            where: {id: Number(id)}
        });

        res.json({ message: 'Gestor e Funcionarios associados deletados'})
    }
    catch(error){
        res.status(500).json({error: 'Erro ao deletar gestor'})
    }
})



export default router;