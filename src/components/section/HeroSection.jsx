import { GraduationCap, BookOpen, Calendar, ListTodo } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTaskCounts } from "@/lib/api/taskApi";
import { getEvents } from "@/lib/api/eventApi";
import { getResources } from "@/lib/api/resourceApi";
import { Loader2 } from "lucide-react";

const HeroSection = () => {
  // Fetch task count for the current user
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "counts"],
    queryFn: async () => {
      const result = await getTaskCounts();
      return result?.data?.total || 0;
    },
  });

  // Fetch events count
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["events", "count"],
    queryFn: async () => {
      const result = await getEvents();
      return result?.data?.length || 0;
    },
  });

  // Fetch resources count
  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ["resources", "count"],
    queryFn: async () => {
      const result = await getResources();
      return result?.data?.length || 0;
    },
  });

  const stats = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Resources",
      value: resourcesLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        resourcesData || 0
      ),
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Events",
      value: eventsLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        eventsData || 0
      ),
    },
    {
      icon: <ListTodo className="h-5 w-5" />,
      label: "Tasks",
      value: tasksLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        tasksData || 0
      ),
    },
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
          <h2 className="text-3xl font-bold text-white">LEARN VANGUARD</h2>
        </div>

        <p className="text-xl text-blue-50 max-w-2xl mb-8">
          Unlock your full potential with personalized learning tools and
          resources. Your one-stop platform for academic excellence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
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
