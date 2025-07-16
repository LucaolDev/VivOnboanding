import express from 'express'
import funcionariosRoutes from './routes/Funcionario.js';
import gestorRoutes from './routes/Gestor.js';

const app = express()
app.use(express.json())

app.use('/gestor', gestorRoutes)
app.use('/funcionario', funcionariosRoutes)

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})