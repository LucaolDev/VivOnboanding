import { PrismaClient, Role } from '@prisma/client';
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

    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const senhaValida = await bcrypt.compare(password, user.password);
    if (!senhaValida) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Erro no login do usuário:', error);
    res.status(500).json({ error: 'Erro no login do usuário' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role, department, managerId = null, team, image = null, isNewUser } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'E-mail já cadastrado' });

    if (!Object.values(Role).includes(role)) return res.status(400).json({ message: 'Role inválido' });

    const senhaCriptografada = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: senhaCriptografada,
        role,
        department: department ? { connect: { name: department } } : undefined,
        team: team ? { connect: { name: team } } : undefined,
        manager: managerId ? { connect: { id: managerId } } : undefined,
        image,
        isNewUser,
        createdAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        team: true,
        managerId: true,
        image: true,
        isNewUser: true,
        createdAt: true
      }
    });

    res.status(200).json({ user: newUser });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

export const changePasswordUser = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  try {
    const userUpdate = await prisma.user.findUnique({ where: { email } });
    if (!userUpdate) return res.status(404).json({ message: 'Usuário não encontrado' });

    const isPasswordValid = await bcrypt.compare(currentPassword, userUpdate.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Senha atual incorreta' });

    const hashNew = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashNew }
    });

    res.status(200).json({ message: 'Senha alterada!' });
  } catch (error) {
    console.error('Erro ao atualizar senha do usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar o usuário' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
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
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao retornar usuários:', error);
    res.status(500).json({ error: 'Erro ao retornar os usuários' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'Usuário deletado' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    let updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (role) updatedData.role = role;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};
