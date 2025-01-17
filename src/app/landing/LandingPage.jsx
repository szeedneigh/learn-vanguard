import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, GraduationCap, Book, Target } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/LVBackdrop.png"
          alt="Campus Building"
          className="object-cover w-full h-full scale-105 transform transition-transform duration-[25000ms] hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-900/85 to-blue-800/75" />
      </div>

      <div className="relative z-10">
        {/* Header with glass effect */}
        <header className="backdrop-blur-sm bg-white/5">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <a 
              href="/" 
              className="flex items-center animate-fade-in-left"
            >
              <img
                src="/images/LVlogo.png"
                alt="Logo"
                className="w-25 h-20"
              />
            </a>
            <div className="animate-fade-in-right">
              <Link to="/login">
                <Button
                  variant="secondary"
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 pt-20 lg:pt-32">
          <div className="max-w-3xl">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up"
              style={{ '--delay': '0ms' }}
            >
              Empowering Students,
              <br />
              <span className="text-yellow-400">Enabling Excellence.</span>
            </h1>
            
            <div
              className="w-32 border-2 border-yellow-400 mb-8 animate-expand"
            />
            
            <p 
              className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl leading-relaxed animate-fade-in-up"
              style={{ '--delay': '400ms' }}
            >
              Discover a unified platform for academic resources and progress
              tracking all tailored to help you achieve your educational goals.
            </p>

            <div
              className="space-y-8 animate-fade-in-up"
              style={{ '--delay': '600ms' }}
            >
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] group"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                {[
                  { icon: GraduationCap, text: "Personalized Learning Path", delay: "800ms" },
                  { icon: Book, text: "Comprehensive Resources", delay: "900ms" },
                  { icon: Target, text: "Progress Tracking", delay: "1000ms" }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-4 text-white/90 animate-fade-in-up"
                    style={{ '--delay': feature.delay }}
                  >
                    <div className="p-3 bg-white/10 rounded-lg">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes expand {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 8rem;
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.7s ease-out forwards;
          animation-delay: var(--delay, 0ms);
        }

        .animate-fade-in-left {
          opacity: 0;
          animation: fadeInLeft 0.5s ease-out forwards;
        }

        .animate-fade-in-right {
          opacity: 0;
          animation: fadeInRight 0.5s ease-out forwards;
        }

        .animate-expand {
          opacity: 0;
          animation: expand 0.7s ease-out forwards;
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;