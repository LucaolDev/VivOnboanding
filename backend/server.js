import express from 'express';
import userRoutes from './routes/User.js';
import trailRoutes from './routes/Trail.js';
import departmentRoutes from './routes/Department.js';
import teamRoutes from './routes/Team.js';
import stepRoutes from './routes/Step.js';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());


app.use('/auth', userRoutes);
app.use('/trail', trailRoutes);
app.use('/department', departmentRoutes);
app.use('/team', teamRoutes);
app.use('/step', stepRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})
