import { Routes, Route, Navigate } from 'react-router-dom';
import Events from "@/app/pages/Events";
import Home from "@/app/pages/Home";
import Resources from "@/app/pages/Resources";
import Tasks from "@/app/pages/Tasks";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Archive from "@/app/pages/Archive";
import Users from "@/app/pages/Users";
import { Toaster } from '@/components/ui/toaster';

const Dashboard = () => {

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate replace to="home" />} />
            <Route path="home" element={<Home />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="resources" element={<Resources />} />
            <Route path="events" element={<Events />} />
            <Route path="archive" element={<Archive />} />
            <Route path="users" element={<Users />} />
          </Routes>
          <Toaster />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;