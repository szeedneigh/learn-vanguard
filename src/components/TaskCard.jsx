import { cn } from '@/lib/utils'

const statusStyles = {
  'in-progress': { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡' },
  'not-started': { color: 'text-red-600', bg: 'bg-red-50', icon: '⭕' },
  completed: { color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
}

const TaskCard = ({ task }) => {
  const style = statusStyles[task.status]

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{task.name}</h3>
        <span className="text-gray-500 text-sm">{task.date}</span>
      </div>
      <p className="text-gray-600 text-sm mb-4">{task.description}</p>
      <div className={cn('inline-flex items-center px-2 py-1 rounded-full text-sm', style.bg, style.color)}>
        <span className="mr-1">{style.icon}</span>
        {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
      </div>
    </div>
  )
}

export default TaskCard