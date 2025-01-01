import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    // Background
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/LVBackdrop.png"
          alt="Campus Building"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-blue-900/80" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img
              src="/images/LVlogo.png"
              alt="Logo"
              className="w-25 h-20"
            />
          </a>
          <Link to="/login">
            <Button
              variant="secondary"
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold"
            >
              Log In
            </Button>
          </Link>
        </header>

        {/* Hero */}
        <main className="container mx-auto px-4 pt-20 lg:pt-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Empowering Students,
              <br />
              Enabling Excellence.
            </h1>
            <hr/>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Discover a unified platform for academic resources and progress
              tracking all tailored to help you achieve your educational goals.
            </p>
            <Link to="/signup">
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold text-lg px-8"
            >
              Get Started
            </Button>
            </Link>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;