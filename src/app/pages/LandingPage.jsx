import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, GraduationCap, Book, Target } from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: GraduationCap,
      title: "Personalized Learning Path",
      description:
        "Get a customized roadmap tailored to your goals and learning style.",
    },
    {
      icon: Book,
      title: "Comprehensive Resources",
      description:
        "Access a vast library of study materials, from notes to practice exams.",
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description:
        "Monitor your academic performance with detailed analytics and insights.",
    },
  ];

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
        <header className="backdrop-blur-xl bg-white/5 fixed w-full z-20">
          <div className="container mx-auto px-4 py-2 flex justify-between md:flex-row md:justify-between md:py-1">
            <a href="/" className="flex items-center mb-2 md:mb-0 animate-fade-in-left">
              <img
                src="/images/LearnVanguard_LOGO.png"
                alt="Logo"
                className="w-20 h-16 md:w-25 md:h-20"
              />
            </a>
            <div className="animate-fade-in-right mt-4">
              <Link to="/login">
                <Button
                  variant="secondary"
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-4 md:px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 pt-32 xs:pt-32 md:pt-36 lg:pt-56 pb-8 md:pb-16">
          <div className="max-w-3xl">
            <h1
              className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight animate-fade-in-up"
              style={{ "--delay": "0ms" }}
            >
              Empowering Students,
              <br />
              <span className="text-yellow-400">Enabling Excellence.</span>
            </h1>
            <h2
              className="text-xl xs:text-2xl md:text-3xl text-yellow-400 mb-3 md:mb-4 animate-fade-in-up"
              style={{ "--delay": "200ms" }}
            >
              Your All-in-One Academic Companion
            </h2>

            <div
              className="w-32 border-2 border-yellow-400 mb-8 animate-expand"
            />

            <p
              className="text-base xs:text-lg md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto md:mx-0 leading-relaxed animate-fade-in-up"
              style={{ "--delay": "400ms" }}
            >
              Discover a unified platform for academic resources and progress 
              tracking all tailored to help you achieve your educational goals.
            </p>
          </div>
        </main>

        {/* Feature Cards */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.02] hover:shadow-2xl animate-fade-in-up transform-gpu will-change-transform"
                style={{ "--delay": `${600 + index * 100}ms` }}
              >
                <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-3 sm:mb-4 transition-transform duration-300 ease-in-out hover:scale-110" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-white/80">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>


        {/* About Section */}
        <section className="container mx-auto px-4 mt-12 md:mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center animate-fade-in-up" style={{ "--delay": "0ms" }}>
            About Student Resource Hub
          </h2>
          <p className="text-white/80 max-w-3xl mx-auto text-center text-base md:text-lg lg:text-xl animate-fade-in-up" style={{ "--delay": "200ms" }}>
            Student Resource Hub is a comprehensive platform designed to support
            students throughout their academic journey. We provide personalized
            learning paths, a vast library of study materials, advanced progress
            tracking tools, and a vibrant community for peer and mentor support.
            Our mission is to empower students to achieve their full potential
            by making academic success more accessible and manageable.
          </p>
        </section>

        {/* Secondary CTA Section */}
        <section className="container mx-auto px-4 mt-12 md:mt-24 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 animate-fade-in-up" style={{ "--delay": "0ms" }}>
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-white/80 mb-6 md:mb-8 text-base md:text-lg animate-fade-in-up" style={{ "--delay": "200ms" }}>
            Join thousands of students who are already achieving their goals
            with Student Resource Hub.
          </p>
          <div className="animate-fade-in-up" style={{ "--delay": "400ms" }}>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold text-base md:text-lg px-6 md:px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] group"
              >
                Get Started Now
                <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 md:mt-24 py-4 md:py-8 bg-blue-900/50 text-white/80 text-center">
          <p className="text-sm md:text-base animate-fade-in-up" style={{ "--delay": "0ms" }}>
            © {new Date().getFullYear()} Student Resource Hub. All rights
            reserved.
          </p>
        </footer>
      </div>

      {/* CSS Animations */}
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
      `}</style>
    </div>
  );
};

export default LandingPage;