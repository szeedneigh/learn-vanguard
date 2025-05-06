import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion"
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  Users,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  CheckCircle,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Clock,
  ChevronUp,
  Star,
} from "lucide-react"
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"


const CONFIG = {
  // General
  siteName: "Learn Vanguard",
  tagline: "Your All-in-One Academic Companion",
  description:
    "Discover a unified platform for academic resources and progress tracking all tailored to help you achieve your educational goals.",


  colors: {
    primary: "#2563eb", // Blue 600
    primaryHover: "#1d4ed8", // Blue 700
    secondary: "#facc15", // Yellow 400
    secondaryHover: "#eab308", // Yellow 500
    accent: "#f97316", // Orange 500
    background: "#ffffff",
    backgroundAlt: "#f9fafb", // Gray 50
    text: "#1f2937", // Gray 800
    textMuted: "#6b7280", // Gray 500
    border: "#e5e7eb", // Gray 200
  },


  contact: {
    email: "support@studentresourcehub.com",
    phone: "+1 (555) 123-4567",
    address: "Mac Arthur Highway, Sampaloc Apalit, Pampanga",
    hours: "Monday - Friday: 9AM - 5PM EST",
    social: {
      twitter: "https://twitter.com/studentresourcehub",
      facebook: "https://facebook.com/studentresourcehub",
      instagram: "https://instagram.com/studentresourcehub",
      linkedin: "https://linkedin.com/company/studentresourcehub",
    },
  },

  // Navigation
  navigation: [
    { name: "Features", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ],

  // Call to Action Buttons
  cta: {
    primary: {
      text: "Get Started",
      href: "/signup",
    },
    secondary: {
      text: "Login",
      href: "/signin",
    },
  },

  // Features Section
  features: [
    {
      id: "learning",
      icon: <GraduationCap className="h-5 w-5" />,
      label: "Learning Paths",
      title: "Personalized Learning Paths",
      description:
        "Our AI-powered system creates customized learning paths based on your goals, learning style, and current knowledge level. Adapt and evolve as you progress.",
      benefits: [
        "Tailored to your specific learning style",
        "Adapts based on your progress and performance",
        "Recommends resources that match your needs",
      ],
    },
    {
      id: "resources",
      icon: <BookOpen className="h-5 w-5" />,
      label: "Resources",
      title: "Comprehensive Resource Library",
      description:
        "Access thousands of study materials including lecture notes, practice exams, flashcards, video tutorials, and more across all major academic disciplines.",
      benefits: [
        "Curated high-quality study materials",
        "Covers all major subjects and disciplines",
        "Regularly updated with new content",
      ],
    },
    {
      id: "tracking",
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Progress Tracking",
      title: "Advanced Progress Analytics",
      description:
        "Monitor your academic performance with detailed analytics and insights. Track your progress, identify areas for improvement, and celebrate your achievements.",
      benefits: [
        "Visual dashboards to track your progress",
        "Identify strengths and areas for improvement",
        "Set and monitor academic goals",
      ],
    },
  ],

  // Stats Section
  stats: [
    { number: "600+", label: "Active Students" },
    { number: "2k+", label: "Resources" },
    { number: "98%", label: "Success Rate" },
  ],

  // Testimonials Section
  testimonials: [
    {
      quote:
        "Student Resource Hub completely changed how I study. The personalized learning path helped me improve my GPA by a full point!",
      name: "Alex Johnson",
      role: "Computer Science Major",
      avatar: "AJ",
      rating: 5,
    },
    {
      quote:
        "The comprehensive resources saved me countless hours of searching for study materials. Everything I need is in one place.",
      name: "Samantha Lee",
      role: "Biology Major",
      avatar: "SL",
      rating: 5,
    },
    {
      quote: "The progress tracking feature helped me identify my weak areas and focus my study time more effectively.",
      name: "Michael Chen",
      role: "Business Administration",
      avatar: "MC",
      rating: 5,
    },
  ],

  // FAQ Section
  faqs: [
    {
      question: "What is Student Resource Hub?",
      answer:
        "Student Resource Hub is a comprehensive platform designed to support students throughout their academic journey. We provide a vast library of study materials, task management tool, and event scheduling tool.",
    },
    {
      question: "Can I access the platform on mobile devices?",
      answer:
        "Yes, Student Resource Hub is fully responsive and works on all devices. ",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply sign up your La Verdad account, complete and your academic profile. You can start accessing resources immediately after signing up.",
    },
    {
      question: "Do you offer resources for all subjects?",
      answer:
        "We cover a wide range of subjects across various disciplines including Application Development, Web Development, Data Structures and Algorithms and more. Our library is constantly expanding based on user needs and requests.",
    },
  ],

  // Footer Links
  footerLinks: {
    resources: ["Study Materials", "Practice Tests", "Tutoring", "Learning Paths"],
    company: ["About Us", "Careers", "Blog", "Press"],
    legal: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Accessibility"],
  },
}

// ======================================================
// SECTION COMPONENTS - Individual page sections
// ======================================================

// Section Heading Component
function SectionHeadingComponent({ title, subtitle, config }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl" style={{ color: config.colors.text }}>
        {title}
      </h2>
      <p className="mt-4 text-xl max-w-3xl mx-auto" style={{ color: config.colors.textMuted }}>
        {subtitle}
      </p>
    </motion.div>
  )
}

// ======================================================
// MAIN COMPONENT - The landing page template
// ======================================================

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(CONFIG.features[0].id)
  const [activeFaq, setActiveFaq] = useState(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Scroll to section function
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: CONFIG.colors.primary }}
                >
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold hidden sm:block" style={{ color: CONFIG.colors.primary }}>
                  {CONFIG.siteName}
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {CONFIG.navigation.map((item) => (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-600 hover:text-blue-600 font-medium"
                  style={{ color: CONFIG.colors.textMuted }}
                  onClick={() => scrollToSection(item.href.substring(1))}
                >
                  {item.name}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: CONFIG.colors.primary }}
                onClick={() => scrollToSection("signup")}
              >
                {CONFIG.cta.primary.text}
              </motion.button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600"
                style={{ color: CONFIG.colors.textMuted }}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {CONFIG.navigation.map((item, index) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-gray-600 hover:text-blue-600 font-medium py-2"
                    style={{ color: CONFIG.colors.textMuted }}
                    onClick={() => scrollToSection(item.href.substring(1))}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: CONFIG.colors.primary }}
                  onClick={() => scrollToSection("signup")}
                >
                  {CONFIG.cta.primary.text}
                </motion.button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection scrollToSection={scrollToSection} config={CONFIG} />

        {/* Features Section */}
        <FeaturesSection activeTab={activeTab} setActiveTab={setActiveTab} config={CONFIG} />

        {/* Stats Section */}
        <StatsSection config={CONFIG} />

        {/* Testimonials Section */}
        <TestimonialsSection config={CONFIG} />

        {/* FAQ Section */}
        <FaqSection activeFaq={activeFaq} setActiveFaq={setActiveFaq} config={CONFIG} />

        {/* Sign Up Section */}
        <SignUpSection config={CONFIG} />

        {/* Contact Section */}
        <ContactSection config={CONFIG} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100" style={{ backgroundColor: CONFIG.colors.backgroundAlt }}>
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: CONFIG.colors.primary }}
                >
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold" style={{ color: CONFIG.colors.primary }}>
                  {CONFIG.siteName}
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: CONFIG.colors.textMuted }}>
                {CONFIG.description}
              </p>
              <div className="flex space-x-4">
                {Object.entries(CONFIG.contact.social).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    className="transition-colors"
                    style={{ color: CONFIG.colors.textMuted }}
                    aria-label={`Visit our ${platform} page`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: CONFIG.colors.border }}
                    >
                      <span className="capitalize text-xs">{platform.charAt(0)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: CONFIG.colors.text }}>
                Resources
              </h3>
              <ul className="space-y-2">
                {CONFIG.footerLinks.resources.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-blue-600" style={{ color: CONFIG.colors.textMuted }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: CONFIG.colors.text }}>
                Company
              </h3>
              <ul className="space-y-2">
                {CONFIG.footerLinks.company.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-blue-600" style={{ color: CONFIG.colors.textMuted }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: CONFIG.colors.text }}>
                Legal
              </h3>
              <ul className="space-y-2">
                {CONFIG.footerLinks.legal.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-blue-600" style={{ color: CONFIG.colors.textMuted }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm" style={{ color: CONFIG.colors.textMuted }}>
              © {new Date().getFullYear()} {CONFIG.siteName}. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <select
                className="text-sm rounded-md px-3 py-1 border-none focus:ring-2"
                style={{ color: CONFIG.colors.textMuted, backgroundColor: CONFIG.colors.border }}
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 text-white p-3 rounded-full shadow-lg"
            style={{ backgroundColor: CONFIG.colors.primary }}
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hero Section Component
function HeroSection({ scrollToSection, config }) {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, ${config.colors.primary}, ${config.colors.primaryHover})`,
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
        <svg
          className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform opacity-20 blur-3xl"
          width="400"
          height="400"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="200" cy="200" r="200" fill="url(#paint0_radial)" />
          <defs>
            <radialGradient
              id="paint0_radial"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(200 200) rotate(90) scale(200)"
            >
              <stop stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm backdrop-blur-sm max-w-max"
            >
              <span className="font-medium">New Features Available</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              Empowering Students,{" "}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${config.colors.secondary}, ${config.colors.secondaryHover})`,
                }}
              >
                Enabling Excellence.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-xl text-white/80"
            >
              {config.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-white/70 max-w-lg"
            >
              {config.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mt-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                style={{
                  backgroundColor: config.colors.secondary,
                  color: config.colors.primary,
                }}
                onClick={() => scrollToSection(config.cta.primary.href.substring(1))}
              >
                {config.cta.primary.text}
                <ChevronRight className="ml-2 h-4 w-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium"
                onClick={() => scrollToSection(config.cta.secondary.href.substring(1))}
              >
                {config.cta.secondary.text}
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex items-center gap-4 mt-6"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 overflow-hidden flex items-center justify-center text-xs font-bold"
                    style={{
                      borderColor: config.colors.primary,
                      backgroundColor: config.colors.background,
                      color: config.colors.primary,
                    }}
                  >
                    S{i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/80">
                <span className="font-bold">600+</span> students already enrolled
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative h-[400px] w-full"
          >
            <HeroAnimation config={config} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Hero Animation Component
function HeroAnimation({ config }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Main device */}
        <div className="relative z-20">
          <div className="relative overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-white/10 backdrop-blur-sm">
            <div
              className="h-[300px] w-[500px] max-w-full p-4"
              style={{
                background: `linear-gradient(to bottom right, ${config.colors.primary}, ${config.colors.primaryHover})`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: config.colors.secondary,
                      color: config.colors.primary,
                    }}
                  >
                    <GraduationCap className="w-3 h-3" />
                  </div>
                  <span className="text-white text-sm font-medium">Student Dashboard</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white/50" />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-white text-sm font-medium mb-2">Current Courses</h4>
                  <div className="space-y-2">
                    {["Mathematics 101", "Computer Science", "Biology"].map((course) => (
                      <div key={course} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.colors.secondary }} />
                        <span className="text-white/80 text-xs">{course}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-white text-sm font-medium mb-2">Progress</h4>
                  <div className="space-y-3">
                    {[
                      { course: "Mathematics", progress: 75 },
                      { course: "Computer Science", progress: 60 },
                      { course: "Biology", progress: 90 },
                    ].map((item) => (
                      <div key={item.course} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80">{item.course}</span>
                          <span className="text-white/80">{item.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/20">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-1.5 rounded-full"
                            style={{ backgroundColor: config.colors.secondary }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-white/10 rounded-lg p-3">
                <h4 className="text-white text-sm font-medium mb-2">Upcoming Assignments</h4>
                <div className="space-y-2">
                  {[
                    { title: "Mathematics Quiz", date: "Tomorrow, 10:00 AM" },
                    { title: "CS Project Submission", date: "Friday, 11:59 PM" },
                  ].map((assignment) => (
                    <div key={assignment.title} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.colors.secondary }} />
                        <span className="text-white/80 text-xs">{assignment.title}</span>
                      </div>
                      <span className="text-white/60 text-xs">{assignment.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            className="absolute -right-16 -top-12 z-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm p-4 shadow-lg"
            initial={{ x: 20, y: 20, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">Assignment Completed</p>
                <p className="text-xs text-white/70">Physics Lab Report</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-20 bottom-12 z-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm p-4 shadow-lg"
            initial={{ x: -20, y: 20, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="space-y-2">
              <p className="text-xs font-medium text-white">Progress Update</p>
              <div className="h-2 w-full rounded-full bg-white/20">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: config.colors.secondary }}
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 1.5, duration: 1 }}
                />
              </div>
              <p className="text-xs text-white/70">75% Complete</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-10 left-1/4 z-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm p-3 shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: config.colors.secondary,
                  color: config.colors.primary,
                }}
              >
                <BookOpen className="w-3 h-3" />
              </div>
              <p className="text-xs font-medium text-white">New Resource Available</p>
            </div>
          </motion.div>
        </div>

        {/* Background decorative elements */}
        <motion.div
          className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: config.colors.secondary }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        />
        <motion.div
          className="absolute -top-20 -left-5 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: config.colors.accent }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />
      </div>
    </div>
  )
}

// Features Section Component
function FeaturesSection({ activeTab, setActiveTab, config }) {
  const currentFeature = config.features.find((f) => f.id === activeTab) || config.features[0]

  return (
    <section id="features" className="py-20" style={{ backgroundColor: config.colors.background }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingComponent
          title="Everything you need to succeed"
          subtitle="Our platform provides all the tools and resources you need to excel in your academic journey."
          config={config}
        />

        {/* Feature Tabs */}
        <div className="mt-12">
          <div className="flex overflow-x-auto scrollbar-hide space-x-2 sm:space-x-4 pb-4 mb-8">
            {config.features.map((feature) => (
              <motion.button
                key={feature.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(feature.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap`}
                style={{
                  backgroundColor: activeTab === feature.id ? config.colors.primary : config.colors.border,
                  color: activeTab === feature.id ? config.colors.background : config.colors.textMuted,
                }}
              >
                {feature.icon}
                <span>{feature.label}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 md:grid-cols-2 items-center"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: config.colors.text }}>
                  {currentFeature.title}
                </h3>
                <p className="mb-6" style={{ color: config.colors.textMuted }}>
                  {currentFeature.description}
                </p>
                <ul className="space-y-3">
                  {currentFeature.benefits.map((benefit, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${config.colors.primary}20`,
                        }}
                      >
                        <CheckCircle className="h-3 w-3" style={{ color: config.colors.primary }} />
                      </div>
                      <span style={{ color: config.colors.text }}>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div
                className="relative rounded-lg border overflow-hidden shadow-lg"
                style={{ backgroundColor: `${config.colors.primary}05` }}
              >
                <div
                  className="aspect-video w-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to bottom right, ${config.colors.primary}10, ${config.colors.primary}20)`,
                  }}
                >
                  <div className="text-center p-8">
                    <div
                      className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{
                        backgroundColor: `${config.colors.primary}20`,
                        color: config.colors.primary,
                      }}
                    >
                      {currentFeature.icon}
                    </div>
                    <h4 className="text-lg font-medium" style={{ color: config.colors.primary }}>
                      {currentFeature.label}
                    </h4>
                    <p className="text-sm mt-2" style={{ color: config.colors.primary }}>
                      Interactive demo
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-20">
          {config.features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
              config={config}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description, delay = 0, config }) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay, duration: 0.5 },
        },
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-lg border p-6 shadow-md transition-all hover:shadow-lg"
      style={{
        backgroundColor: config.colors.background,
        borderColor: config.colors.border,
      }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${config.colors.primary}20`,
          color: config.colors.primary,
        }}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold" style={{ color: config.colors.text }}>
        {title}
      </h3>
      <p style={{ color: config.colors.textMuted }}>{description}</p>
      <motion.div
        className="absolute bottom-0 left-0 h-1 w-0"
        style={{ backgroundColor: config.colors.primary }}
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
      />
    </motion.div>
  )
}

// Stats Section Component
function StatsSection({ config }) {
  return (
    <section className="py-16" style={{ backgroundColor: config.colors.backgroundAlt }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {config.stats.map((stat, index) => (
            <StatCard key={stat.label} number={stat.number} label={stat.label} delay={index * 0.1} config={config} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Stat Card Component
function StatCard({ number, label, delay = 0, config }) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay, duration: 0.5 },
        },
      }}
      className="flex flex-col items-center justify-center rounded-lg border p-6 text-center"
      style={{
        backgroundColor: config.colors.background,
        borderColor: config.colors.border,
      }}
    >
      <motion.span
        initial={{ scale: 0.8 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
        className="text-4xl font-bold"
        style={{ color: config.colors.primary }}
      >
        {number}
      </motion.span>
      <span className="mt-2 text-sm" style={{ color: config.colors.textMuted }}>
        {label}
      </span>
    </motion.div>
  )
}

// Testimonials Section Component
function TestimonialsSection({ config }) {
  return (
    <section id="testimonials" className="py-20" style={{ backgroundColor: config.colors.background }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingComponent
          title="What our students say"
          subtitle="Hear from students who have transformed their academic journey with Student Resource Hub."
          config={config}
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {config.testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
              delay={index * 0.1}
              config={config}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonial Card Component
function TestimonialCard({ quote, name, role, avatar, rating = 5, delay = 0, config }) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay, duration: 0.5 },
        },
      }}
      className="rounded-lg border p-6 shadow-md"
      style={{
        backgroundColor: config.colors.background,
        borderColor: config.colors.border,
      }}
    >
      <div className="mb-4 flex items-center gap-4">
        <div
          className="relative h-12 w-12 overflow-hidden rounded-full flex items-center justify-center font-bold"
          style={{
            backgroundColor: `${config.colors.primary}20`,
            color: config.colors.primary,
          }}
        >
          {avatar}
        </div>
        <div>
          <p className="font-medium" style={{ color: config.colors.text }}>
            {name}
          </p>
          <p className="text-sm" style={{ color: config.colors.textMuted }}>
            {role}
          </p>
        </div>
      </div>
      <p className="italic" style={{ color: config.colors.textMuted }}>
        "{quote}"
      </p>
      <div className="mt-4 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4"
            fill={i < rating ? "currentColor" : "none"}
            style={{ color: config.colors.secondary }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// FAQ Section Component
function FaqSection({ activeFaq, setActiveFaq, config }) {
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  return (
    <section id="faq" className="py-20" style={{ backgroundColor: config.colors.backgroundAlt }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingComponent
          title="Frequently asked questions"
          subtitle="Everything you need to know about Student Resource Hub."
          config={config}
        />

        <div className="mx-auto max-w-3xl mt-12">
          <div className="space-y-4">
            {config.faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: config.colors.background,
                  borderColor: config.colors.border,
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium"
                  style={{ color: config.colors.text }}
                >
                  {faq.question}
                  <motion.div animate={{ rotate: activeFaq === index ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="border-t p-4"
                        style={{
                          borderColor: config.colors.border,
                          color: config.colors.textMuted,
                        }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Sign Up Section Component
function SignUpSection({ config }) {
  return (
    <section id="signup" className="py-20 text-white" style={{ backgroundColor: config.colors.primary }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="mt-4 text-xl text-white/80 max-w-3xl">
            Join thousands of students who are already achieving their goals with Student Resource Hub.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-10 w-full max-w-md"
          >
            <Button variant="secondary" className="lg "><Link to="/signup" >Get Started</Link></Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Contact Section Component
function ContactSection({ config }) {
  return (
    <section id="contact" className="py-20" style={{ backgroundColor: config.colors.background }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingComponent
          title="Get in touch"
          subtitle="Have questions or need assistance? We're here to help."
          config={config}
        />

        <div className="grid gap-8 md:grid-cols-2 mt-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold" style={{ color: config.colors.text }}>
              Contact Information
            </h3>
            <p className="max-w-md" style={{ color: config.colors.textMuted }}>
              Our support team is available to assist you with any questions or concerns you may have about Student
              Resource Hub.
            </p>

            <div className="space-y-4">
              {[
                { icon: <Mail className="h-5 w-5" />, label: "Email", value: config.contact.email },
                { icon: <Phone className="h-5 w-5" />, label: "Phone", value: config.contact.phone },
                { icon: <MapPin className="h-5 w-5" />, label: "Address", value: config.contact.address },
                { icon: <Clock className="h-5 w-5" />, label: "Hours", value: config.contact.hours },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div
                    className="mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${config.colors.primary}20`,
                      color: config.colors.primary,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-medium" style={{ color: config.colors.text }}>
                      {item.label}
                    </h4>
                    <p style={{ color: config.colors.textMuted }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-4 pt-4">
              {Object.entries(config.contact.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  className="transition-colors"
                  style={{ color: config.colors.textMuted }}
                  aria-label={`Visit our ${platform} page`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: config.colors.backgroundAlt }}
                  >
                    <span className="capitalize text-sm">{platform.charAt(0)}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="rounded-lg border p-6 shadow-md"
              style={{
                backgroundColor: config.colors.background,
                borderColor: config.colors.border,
              }}
            >
              <h3 className="mb-4 text-xl font-bold" style={{ color: config.colors.text }}>
                Send us a message
              </h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium"
                      style={{ color: config.colors.text }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
                      style={{
                        backgroundColor: config.colors.backgroundAlt,
                        borderColor: config.colors.border,
                      }}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-medium"
                      style={{ color: config.colors.text }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
                      style={{
                        backgroundColor: config.colors.backgroundAlt,
                        borderColor: config.colors.border,
                      }}
                      placeholder="Your email"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium"
                    style={{ color: config.colors.text }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
                    style={{
                      backgroundColor: config.colors.backgroundAlt,
                      borderColor: config.colors.border,
                    }}
                    placeholder="Subject"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium"
                    style={{ color: config.colors.text }}
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    className="mt-1 block w-full rounded-md shadow-sm px-3 py-2"
                    style={{
                      backgroundColor: config.colors.backgroundAlt,
                      borderColor: config.colors.border,
                    }}
                    placeholder="Your message"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="inline-flex items-center rounded-md px-4 py-2 font-medium"
                  style={{
                    backgroundColor: config.colors.primary,
                    color: "white",
                  }}
                >
                  Send Message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Animated Counter Component (for stats)
function AnimatedCounter({ from = 0, to, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(from)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime
    let animationFrame

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / duration, 1)

      // Easing function for smoother animation
      const easeOutQuad = (t) => t * (2 - t)
      const easedPercentage = easeOutQuad(percentage)

      const currentCount = Math.floor(from + (to - from) * easedPercentage)
      setCount(currentCount)

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [from, to, duration, isInView])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}
