import { GraduationCap, BookOpen, Calendar, ListTodo } from "lucide-react";

const HeroSection = () => {
  const stats = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Resources",
      value: "111"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Events",
      value: "8"
    },
    {
      icon: <ListTodo className="h-5 w-5" />,
      label: "Tasks",
      value: "12"
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5,#0ea5e9)] opacity-10 mix-blend-multiply" />
      <div className="absolute -inset-x-20 -top-20 -bottom-40 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5] to-[#0ea5e9] opacity-40 [mask-image:url(/grid.svg)] [mask-size:40px]" />
      </div>
      
      <div className="relative p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className="h-8 w-8 text-white" />
          <h2 className="text-3xl font-bold text-white">
            STUDENT RESOURCE HUB
          </h2>
        </div>

        <p className="text-xl text-blue-50 max-w-2xl mb-8">
          Unlock your full potential with personalized learning tools and resources. 
          Your one-stop platform for academic excellence.
        </p>

        <div className="grid grid-cols-3 gap-6 mt-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center gap-2 text-blue-50 mb-2">
                {stat.icon}
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;