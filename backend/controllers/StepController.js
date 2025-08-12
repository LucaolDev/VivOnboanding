import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const registerStep = async (req, res) => {

  const { id, title, type, order, trailId, content, description, duration, isRequired} = req.body;

  if(!title || !type || !trailId){
    return res.status(400).json({error: 'Campos obrigatórios ausentes'});
  }

  const stepCount = await prisma.step.findMany({select: { id: true },});

  const directionNumber = Number(duration);

  try{
    let step;

    if(id !== undefined){
        step = await prisma.step.update({
            where:{id},
            data:{
                title,
                type,
                order,
                duration: directionNumber,
                description,
                content:{
                    update:content,
                },
            },
            include:{
                content: true,
            },
        });

        const totalDuration = await prisma.step.aggregate({
            where: {trailId},
            _sum: {duration: true},
        })

        await prisma.trail.update({ where: {id: trailId}, data:{ duration: totalDuration._sum.duration || 0,}})
        
    }else{
        step = await prisma.step.create({
        data:{ 
            title,
            description,
            duration: directionNumber,
            order: stepCount.length + 1,
            isRequired,
            type,
            trail:{
                connect:{id: trailId}
            },
            content:{
                create: generatedContent(type,content)
            }
        },
        include:{
            content:{
                include:{
                    question: true
                }
            }
        },
        });

        const totalDuration = await prisma.step.aggregate({
            where: {trailId},
            _sum: {duration: true},
        })

        console.log("total : " + totalDuration._sum.duration)
        await prisma.trail.update({ where: {id: trailId}, data:{ duration: totalDuration._sum.duration || 0,}})
    }

    res.status(200).json(step);
  } catch (error) {
    console.error('Erro ao salvar o Step com conteudo:', error)
    res.status(500).json({ error: 'Erro ao salvar o Step com conteudo' })
  }
};

export const updateStep = async (req, res) => {
    const { id } = req.params;
    const stepData = req.body;

    try{
        const step = await prisma.step.update({
            where: {id: id},
            data:{
                ...stepData,
                content: stepData.content 
                ? { update: stepData.content, }
                : undefined,
            },
            include:{
                content: true,
            },
        });
        return res.status(200).json(step);
    }catch(error){
        return res.status(500).json({ error: 'Erro ao atualizar step'});
    }
}

export const deleteStep = async (req, res) => {
    const { id } = req.params;

    try{
        const existingStep = await prisma.step.findUnique({ where: {id}});

        if(!existingStep){
            return res.status(404).json({ error: 'Step não encontrado'})
        }

        if(existingStep.content){
            await prisma.content.delete({where: {id: existingStep.content.id},})
        }

        await prisma.step.delete({ where: { id }});
        return res.status(200).json({message: 'Etapa deletada com sucesso'})
    }catch(error){
        return res.status(500).json({error:'Erro ao deletar etapa'});
    }
}


function generatedContent(type, content){
    switch(type){
        case 'video':
            return{
                videoUrl: content.videoUrl,
                description: content.description
            };
        case 'book':
            return{
                documentUrl: content.documentUrl,
                description: content.description
            };
        case 'question':
            return{
                description: content.description,
                question:{
                    create: content.questions.map(q => ({
                        id: q.id,
                        questionTitle: q.question,
                        type: q.type,
                        options: q.options,
                        correctAswer: q.correctAswer
                    }))
                }
            };
        default:
            throw new Error('Tipo de conteúdo inválido');
    }
}