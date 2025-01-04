import HeroSection from "@/components/HeroSection"
import TaskList from "@/components/TaskList"
import { Calendar } from "@/components/ui/calendar"

const Home = () => {
  console.log("Home component rendered");

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <HeroSection />
          <TaskList />
        </div>
        <div>
          <Calendar />
        </div>
      </div>
    </div>
  )
}

export default Home