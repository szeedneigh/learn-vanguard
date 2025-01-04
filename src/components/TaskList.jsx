import TaskCard from "./TaskCard"

const tasks = [
  {
    id: 1,
    name: 'Complete Math Assignment',
    description: 'Chapter 5 exercises on differential equations',
    date: 'Aug 28, 2023',
    status: 'in-progress',
  },
  {
    id: 2,
    name: 'Read History Chapter',
    description: 'World War II - Pacific Theater',
    date: 'Aug 28, 2023',
    status: 'not-started',
  },
  {
    id: 3,
    name: 'Submit Physics Lab Report',
    description: 'Wave motion experiment analysis',
    date: 'Aug 28, 2023',
    status: 'completed',
  },
];

const TaskList = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Latest Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export default TaskList