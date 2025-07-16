import express from 'express';
import {PrismaClient} from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.urlencoded({extended: true}));
router.use(express.json());

router.post('/', async (req, res) => {
  try {
    console.log(process.env.DATABASE_URL)

    const { name, email, gestorId } = req.body;

    const funcionario = await prisma.Funcionario.create({
      data: {
        name,
        email,
        gestorId
      },
      include: {
        gestor: true
      }
    });

    res.status(200).json(funcionario);
  } catch (error) {
    console.error('Erro ao cadastrar o funcionário: ', error);
    res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
  }
});

router.get('/', async (req, res) => {
  try {
    const funcionarios = await prisma.Funcionario.findMany({
      include: { gestor: true }
    })
    res.status(200).json(funcionarios)
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error)
    res.status(500).json({ error: 'Erro ao buscar funcionários' })
  }
})

router.put('/:id', async (req, res) => {
    const {id} = req.params;
    const {name, email} = req.body;
  try {
    const funcionarioAtualizado = await prisma.Funcionario.update({
        where: {id: Number(id)},
        data: {name, email},
    });

    res.status(200).json(funcionarioAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar o funcionario:', error)
    res.status(500).json({ error: 'Erro ao atualizar o funcionario:' })
  }
})

router.delete('/:id', async (req, res) => {
    const {id} = req.params;

    try{

        await prisma.Funcionario.deleteMany({
            where: {id: Number(id)}
        });

        res.json({ message: 'Funcionarios deletado'})
    }
    catch(error){
        res.status(500).json({error: 'Erro ao deletar funcionario'})
    }
})

export default router;