import React, {useEffect, useState} from 'react';
import { Plus, Edit, Trash2, Play, FileText, CheckCircle, Clock,Users,BookOpen,Video,HelpCircle,Save,X,ArrowUp,ArrowDown } from 'lucide-react';
import { Trail, Step, Department, Question } from '../../type/Tabelas.ts';
import { getAllTrails,createTrail,updatedTrail,deleteTrail } from '../../services/trailService.ts';
import { saveStep, deleteStep, updateStep } from '../../services/stepService.ts';
import { getDepartments } from '../../services/departmentService.ts';
import { getTeams } from '../../services/teamService.ts';

const RhTrail : React.FC = () =>{

  const [trails, setTrails] = useState<Trail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        const data = await getAllTrails();
        setTrails(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
      };

      fetchTrails();
  }, []);

  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  const getStepIcon = (type: string) => {
    switch(type){
      case 'video': return <Video className='text-red-500' size={20}/>;
      case 'question': return <HelpCircle className='text-purple-500' size={20}/>;
      case 'book': return<FileText className='text-blue-500' size={20}/>;
      default: return <FileText className='text-gray-500' size={20}/>;
    }
  }

  const handleCreateTrail = async () => {
    try{
      const departments = await getDepartments();
      const defaultDept = departments.find(dep => dep.name === 'Todos');

      const teams = await getTeams();
      const defaultTeam = teams.find(team => team.name === 'Vendas');

      if (!defaultDept) throw new Error('Departamento "Todos" não encontrado');

      const newTrail = {
        title: 'Nova Trilha',
        description: 'Descrição da nova trilha',
        duration: 0,
        isActive: false,
        createdAt: new  Date().toISOString().split('T')[0],
        assignedUsers: 0
      };

      const created = await createTrail(newTrail)
      setTrails([...trails, created]);
      setSelectedTrail(created);
      setIsEditing(true);
    }catch(error){
      console.error(error);
    }
  }

  const handleSaveTrail = async (trail: Trail) => {
    try{
      const saved = await updatedTrail(trail.id, trail);
      setTrails(trails.map(t => t.id === saved.id ? saved : t))
      setSelectedTrail(saved)
      setIsEditing(false);
      window.location.reload();
    } catch(error){
        console.error(error)
    }
  }

  const handleDeleteTrail = async (trailId: string) => {
    try{
      await deleteTrail(trailId);
      setTrails(trails.filter(t => t.id !== trailId));

      if(selectedTrail?.id === trailId){
        setSelectedTrail(null);
      }
    }catch(error){
      console.error(error);
    }
  };

  const handleAddStep = () => {
    if (!selectedTrail) return;
  
    setEditingStep({
      id: Date.now().toString(),
      title: 'Nova Etapa',
      description: '',
      type: 'video',
      duration: 30,
      order: (selectedTrail?.step?.length || 0) + 1,
      isRequired: true,
      trailId: selectedTrail.id,
      content: {
        id: '', 
        stepId: '',
        videoUrl: '',
        description: '',
        documentUrl: '',
        question: [],
      },
    });

    setShowStepModal(true);
  };

  const handleSaveStep = async(step: Step) => {
    if(!selectedTrail) return;

    try{
      const cleanedStep = {...step} as any;

      if(!cleanedStep.id){
        delete cleanedStep.id;
        if(cleanedStep.content){
          delete cleanedStep.content.id;
          delete cleanedStep.content.stepId;
        }
      }

      const savedStep = await saveStep(cleanedStep, selectedTrail.id);

      const exists = selectedTrail.step?.some(s => s.id === savedStep.id);

      const updatedSteps = exists
      ? selectedTrail.step!.map(s => s.id === savedStep.id ? savedStep : s)
      : [...(selectedTrail.step || []), savedStep];

      const updateTrail = {
        ...selectedTrail,
        steps: updatedSteps,
        duration: updatedSteps.reduce((total, s) => total + s.duration, 0),
      }

      setSelectedTrail(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          steps: [...(prev.step || []), savedStep],
        };
      });

      const allTrails = await getAllTrails();
      const updatTrail = allTrails.find(r => r.id === selectedTrail.id);
      
      if(updatTrail){
        setSelectedTrail(updatTrail);
      }


      handleSaveTrail(updateTrail);
      setShowStepModal(false);
      setEditingStep(null);
    }catch(error){
      console.error(error);
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!selectedTrail) return;

    try{
      await deleteStep(stepId);

      const updatedSteps = selectedTrail.step?.filter(s => s.id !== stepId) || [];
      const updatedTrail = {
        ...selectedTrail,
        steps: updatedSteps,
        duration: updatedSteps?.reduce((total, s) => total + s.duration, 0),
      };

      handleSaveTrail(updatedTrail);
    }catch (error) {
      console.error('Erro ao deletar step:', error);
    }
  }

  const moveStep = async(stepId: string, direction: 'up' | 'down') => {
    if(!selectedTrail) return;

    const steps = [...selectedTrail.step || []] ;
    const currentIndex = steps.findIndex(s => s.id === stepId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if(newIndex >= 0 && newIndex < steps.length){
      [steps[currentIndex], steps[newIndex]] = [steps[newIndex], steps[currentIndex]];

      const updatedSteps = steps.map((step, index) => ({
        ...step,
        order: index + 1,
      }));

      try{
        await Promise.all(
          updatedSteps.map(s => {
             console.log('Atualizando step:', s);
            updateStep(s.id, { order: s.order}
            )})
        )

        const updatedTrail = {
        ...selectedTrail,
        step: updatedSteps,
        duration: updatedSteps.reduce((total, s) => total + s.duration, 0),
      };

      handleSaveTrail(updatedTrail);
      }catch(error){
      console.error('Erro ao mover steps:', error)
    }
    }
  };

  const handleEditTrailInfo = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveTrailInfo = async (trail: Trail) => {
    try{
      await updatedTrail(trail.id, trail);
      setSelectedTrail(trail);
      setIsEditing(false);
    }catch(error){
      console.error('Erro ao atualizar a trilha:', error)
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Gestão de Trilhas</h2>
          <button
            onClick={handleCreateTrail}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus size={20} />
            <span>Nova Trilha</span>
          </button>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Trilhas Disponíveis</h3>
            <div className="space-y-3">
              {trails.map((trail) => (
                <div
                  key={trail.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTrail?.id === trail.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`} onClick={() => setSelectedTrail(trail)}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{trail.title}</h4>
                    <div className="flex items-center space-x-1">
                      {trail.isActive ? (
                        <CheckCircle className="text-green-500" size={16} /> ) : ( <Clock className="text-gray-400" size={16} /> )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{trail.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{trail.step?.length} etapas</span>
                    <span>{trail.duration} min</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{trail.assignedUsers} usuários</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detalhes da Trilha */}
        <div className="lg:col-span-2">
          {selectedTrail ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              {isEditing ? (
                <TrailEditForm
                  trail={selectedTrail}
                  onSave={handleSaveTrailInfo}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{selectedTrail.title}</h3>
                    <p className="text-gray-600">{selectedTrail.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Departamento: {selectedTrail.department?.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedTrail.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTrail.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditTrailInfo}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteTrail(selectedTrail.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Informações da Trilha */}
              {!isEditing && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Etapas</p>
                    <p className="text-xl font-bold text-gray-800">{selectedTrail.step?.length}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Duração</p>
                    <p className="text-xl font-bold text-gray-800">{selectedTrail.duration}min</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Usuários</p>
                    <p className="text-xl font-bold text-gray-800">{selectedTrail.assignedUsers}</p>
                  </div>
                </div>
              )}

              {/* Etapas da Trilha */}
              {!isEditing && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">Etapas da Trilha</h4>
                    <button
                      onClick={handleAddStep}
                      className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Adicionar Etapa</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedTrail.step
                      ?.sort((a, b) => a.order - b.order)
                      .map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStepIcon(step.type)}
                            <div>
                              <h5 className="font-medium text-gray-800">{step.title}</h5>
                              <p className="text-sm text-gray-600">
                                {step.type === 'video' && 'Vídeo'} 
                                {step.type === 'question' && 'Avaliação'}
                                {step.type === 'book' && 'Documento'}
                                • {step.duration} min
                                {step.isRequired && ' • Obrigatório'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveStep(step.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              onClick={() => moveStep(step.id, 'down')}
                              disabled={index === (selectedTrail.step?.length ?? 0) - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingStep(step);
                                setShowStepModal(true);
                              }}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Detalhes específicos do tipo */}
                        {step.type === 'video' && step.content?.videoUrl && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">URL do Vídeo:</p>
                            <a href={step.content.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline">
                              {step.content.videoUrl}
                            </a>
                          </div>
                        )}
                        
                        {step.type === 'question' && step.content?.question && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600 mb-2">Perguntas da Avaliação:</p>
                            {step.content.question.map((q: any, qIndex: number) => (
                              <div key={q.id} className="mb-2">
                                <p className="text-sm font-medium">{qIndex + 1}. {q.question}</p>
                                <ul className="text-xs text-gray-600 ml-4">
                                  {q.options.map((option: string, oIndex: number) => (
                                    <li key={oIndex} className={oIndex === q.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                      {String.fromCharCode(97 + oIndex)}) {option}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-12">
                <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Selecione uma trilha</h3>
                <p className="text-gray-600">Escolha uma trilha da lista para visualizar e editar seus detalhes</p>
              </div>
            </div>
          )}
        </div>
  
      {showStepModal && (
        <StepModal
          step={editingStep}
          onSave={handleSaveStep}
          onClose={() => {
            setShowStepModal(false);
            setEditingStep(null);
          }}
        />
      )}
    </div>
  )
};

interface TrailEdirFormProps {
  trail: Trail;
  onSave: (trail: Trail) => void;
  onCancel: () => void;
}

const TrailEditForm: React.FC<TrailEdirFormProps> = ({ trail, onSave, onCancel}) => {
  const [formData, setFormData] = useState<Trail>(trail);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
    }
  };

  fetchDepartments();
}, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  }

  return(
     <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Informações da Trilha</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título da Trilha
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              value={formData.departmentId ?? ''}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              {departments.map((dept) => (
                <option key={dept.name} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Trilha ativa
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Salvar Trilha</span>
          </button>
        </div>
      </form>
    </div>
  )
};

interface StepModalProps {
  step: Step | null;
  onSave: (step: Step) => void;
  onClose: () => void;
}

const StepModal: React.FC<StepModalProps> = ({ step, onSave, onClose }) => {
  const [formData, setFormData] = useState<Step>({
  id: '',
  title: '',
  description: '',
  duration: 0,
  order: 0,
  isRequired: false,
  type: 'video',
  trailId: '',
  content: {
    id: '',
    videoUrl: '',
    description: '',
    documentUrl: '',
    stepId: '',
    question: [],
  }
});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData) return;
    onSave(formData);
  };

  const addQuestion = () => {
    if(!formData) return;

    const questions = formData.content?.question || [];

    const newQuestion: Question = {
      id: Date.now().toString(),
      questionTitle: '',
      type: 'multiple',
      options:['','','',''],
      correctAswer: 0,
      contentId: formData?.content?.id || '',
    };

    setFormData({
      ...formData,
      content:{
        id: formData?.content?.id ?? '',
        stepId: formData.id,
        videoUrl: formData.content?.videoUrl ?? '',
        description: formData.content?.description ?? '',
        documentUrl: formData.content?.documentUrl ?? '',
        question: [...questions, newQuestion],
      }
    });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const questions = [...(formData?.content?.question || [])];
    questions[questionIndex].options[optionIndex] = value;
    
    if (!formData?.id) return; 

    setFormData({
      ...formData,
      content:{
        id: formData?.content?.id ?? '',
        stepId: formData.id ?? '',
        videoUrl: formData.content?.videoUrl ?? '',
        description: formData.content?.description ?? '',
        documentUrl: formData.content?.documentUrl ?? '',
        question: questions,
      }
    })
  };

  const removeQuestion = (questionIndex: number) => {
    const questions = [...(formData?.content?.question || [])];
    questions.splice(questionIndex, 1);

    if(!formData.id || !formData?.content?.id) return;

    setFormData({
      ...formData,
      content:{
        ...formData?.content,
        id: formData.content.id,
        stepId: formData.id,
        question: questions, // ou questions
        videoUrl: formData.content.videoUrl ?? '',
        description: formData.content.description ?? '',
        documentUrl: formData.content.documentUrl ?? '',
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {step ? 'Editar Etapa' : 'Nova Etapa'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título da Etapa
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Etapa
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="video">Vídeo</option>
                <option value="evaluation">Avaliação</option>
                <option value="document">Documento</option>
                <option value="reading">Leitura</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração (minutos)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRequired"
              checked={formData.isRequired}
              onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isRequired" className="text-sm text-gray-700">
              Etapa obrigatória
            </label>
          </div>

          {/* Conteúdo específico por tipo */}
          {formData.type === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Vídeo (YouTube)
                </label>
                <input
                  type="url"
                  value={formData?.content?.videoUrl}
                  onChange={(e) => {
                    if(!formData?.content) return;

                    setFormData({
                    ...formData,
                    content: { ...formData?.content, videoUrl: e.target.value }
                  })}}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData?.content?.description || ''}
                  onChange={(e) => {
                    if(!formData?.content) return;
                    setFormData({
                    ...formData,
                    content: { ...formData.content, description: e.target.value }
                  })}}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {formData.type === 'question' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">Perguntas da Avaliação</h4>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Adicionar Pergunta
                </button>
              </div>

              {(formData?.content?.question || []).map((question: any, qIndex: number) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-700">Pergunta {qIndex + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:bg-red-100 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestionOption(qIndex, question.correctAnswer, e.target.value)}
                      placeholder="Digite a pergunta..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Opções de Resposta:
                      </label>
                      {question.options.map((option: string, oIndex: number) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === oIndex}
                            onChange={(e) => updateQuestionOption(qIndex, question.correctAnswer, e.target.value)}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Opção ${String.fromCharCode(97 + oIndex)}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">
                        Selecione a opção correta marcando o botão de rádio
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.type === 'book' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Documento
                </label>
                <input
                  type="url"
                  value={formData?.content?.documentUrl || ''}
                  onChange={(e) => {
                    if(!formData?.content) return;
                    setFormData({
                    ...formData,
                    content: { ...formData.content, documentUrl: e.target.value }
                  })}}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData?.content?.description || ''}
                  onChange={(e) => {
                     if (!formData?.content) return;
                    setFormData({
                    ...formData,
                    content: { ...formData.content, description: e.target.value }
                  })}}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Salvar Etapa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RhTrail;
