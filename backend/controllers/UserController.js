import {PrismaClient, Role} from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        team: true,
        department: true,
        image: true,
        isNewUser: true, 
        managerId: true,
        createdAt: true
      }
    });

    if (user == null) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(password, user.password);
    console.log("senha criptografa" + senhaValida)

    if(!senhaValida){
      return res.status(401).json({ message: 'Credenciais inválidas '});
    }

    const token = jwt.sign(
      {
        id:user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,{ expiresIn: '1h'}
    );

    console.log('Usuário retornado do banco:');
    console.log(JSON.stringify(user, null, 2));

    res.status(200).json({
      token,
      user:{
        id: user.id,
        name: user.name,
        email: user.email,
        department:  user.department,
        role: user.role,
        team: user.team,
        image: user.image,
        isNewUser: Boolean(user.isNewUser),
        managerId: user.managerId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro no login do usuário: ', error);
    res.status(500).json({ error: 'Erro no login do usuário' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role, department, isNewUser, manager = null , managerId = null, team, image = null } = req.body;

  try{
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if(existingUser){
      return res.status(400).json({ message: 'E-mail já cadastrado'});
    }

    const senhaCriptograda = await bcrypt.hash(password, 10);

    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ message: 'Role inválido' });
    }

    const newUser = await prisma.user.create({
      data:{
        name,
        email,
        password: senhaCriptograda,
        role, 
        department: {
          connect: { name: department }
        },
        image,
        isNewUser,
        createdAt: new Date(),
      },
    });

    if (managerId) {
      newUser.manager = { connect: { id: managerId } };
    }

    const{ password: _, ...userWithoutPassword} = newUser;

    res.status(200).json({user: userWithoutPassword,});

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    res.status(500).json({ error: 'Erro ao criar usuário' })
  }
};

export const changePassworUser = async (req, res) => {
    const {email, currentPassword, newPassword } = req.body;
  try {
    const userUpdate = await prisma.user.findUnique({ where: {email}});

    if(!userUpdate){
      return res.status(404).json({ message: 'Usuário não encontrado'});
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, userUpdate.password);

    if(!isPasswordValid){
      return res.status(401).json({message: 'Senha atual incorreta'});
    }

    const hashNew = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {email},
      data: {password: hashNew},
    });

    res.status(200).json({ message : 'Senha alterada!'});
  } catch (error) {
    console.error('Erro ao atualizar senha do Usuário:', error)
    res.status(500).json({ error: 'Erro ao atualizar o Usuário:' })
  }
};

export const getAllUsers = async (req,res) => {
  try{
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        team: true,
        department: true,
        image: true,
        isNewUser: true,
        managerId: true,
        createdAt: true
      }
    });

    res.status(200).json(users);
  }catch(error){
    res.status(500).json({ error: 'Erro ao retornar os usuarios'});
  }
}


export const deleteUser = async (req, res) => {
    const {email} = req.params;

    try{   
        const user = await prisma.user.findUnique({ where:{email}});

        if(!user){
          return res.status(404).json({message: 'Usuário não encontrado'});
        }

        await prisma.user.deleteMany({
            where: {email}
        });

        return res.status(200).json({ message: 'Usuário deletado'})
    }
    catch(error){
        res.status(500).json({error: 'Erro ao deletar usuário'})
    }
};