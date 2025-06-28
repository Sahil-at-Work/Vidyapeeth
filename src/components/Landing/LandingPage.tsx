import React from 'react'
import { 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  Users, 
  Zap, 
  Target, 
  Star, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Award,
  Brain,
  Calculator,
  Microscope,
  Cpu,
  FlaskConical,
  Atom
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Vidyapeeth
              </h1>
            </div>
            
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 mb-8 shadow-lg">
              <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">India's #1 Gamified Learning Platform</span>
            </div>

            {/* Main Heading - SEO Optimized */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="block text-4xl md:text-5xl mt-2">Master your</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                VIDYAPEETH
              </span>
              <span className="block text-4xl md:text-5xl mt-2">& All Competitive Exams</span>
            </h1>

            {/* SEO-Rich Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-5xl mx-auto leading-relaxed">
              India's most comprehensive online learning platform for <strong>JEE Main & Advanced</strong>, <strong>NEET</strong>, <strong>CET</strong>, <strong>GATE</strong>, and <strong>Board Exams</strong>. 
              Experience gamified learning with AI-powered progress tracking, comprehensive study materials, and mock tests.
            </p>

            {/* Exam Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">JEE Main & Advanced</span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">NEET UG</span>
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">MHT CET</span>
              <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">GATE</span>
              <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">Board Exams</span>
              <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium">University Exams</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center"
              >
                Start Free Preparation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center text-gray-600">
                <div className="flex -space-x-2 mr-3">
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop" alt="JEE Student Success" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop" alt="NEET Student Success" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop" alt="GATE Student Success" />
                </div>
                <span className="text-sm">Join 6,000+ successful students</span>
              </div>
            </div>

            {/* Success Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
                <div className="text-gray-600">Universities+Boards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">6000+</div>
                <div className="text-gray-600">Students Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">100+</div>
                <div className="text-gray-600">Study Materials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>

      {/* Exam Categories Section */}
      <section className="py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Preparation for All Major Exams
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              From undergraduate entrance exams to graduate-level competitive tests, we cover everything you need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Undergraduate Exams */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Undergraduate Exams</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <Calculator className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">JEE Main & Advanced</div>
                    <div className="text-sm text-gray-600">Engineering Entrance</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <Microscope className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">NEET UG</div>
                    <div className="text-sm text-gray-600">Medical Entrance</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <FlaskConical className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">MHT CET</div>
                    <div className="text-sm text-gray-600">Maharashtra CET</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <BookOpen className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Board Exams</div>
                    <div className="text-sm text-gray-600">CBSE, State Boards</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graduate Exams */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Graduate Exams</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <Cpu className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">GATE</div>
                    <div className="text-sm text-gray-600">All Engineering Streams</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <GraduationCap className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">University Exams</div>
                    <div className="text-sm text-gray-600">All Major Universities</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <Atom className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Technical Education</div>
                    <div className="text-sm text-gray-600">Specialized Courses</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <Target className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Competitive Tests</div>
                    <div className="text-sm text-gray-600">Government Jobs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why 50,000+ Students Choose Vidyapeeth?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines proven educational methods with cutting-edge technology for maximum learning efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gamified Learning Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Earn XP points, maintain study streaks, unlock achievements, and compete with AI students on leaderboards for maximum motivation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Study Assistant</h3>
              <p className="text-gray-600 leading-relaxed">
                Personalized learning paths, intelligent progress tracking, and adaptive content recommendations based on your performance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Comprehensive Study Materials</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete syllabi, previous year questions, mock tests, video lectures, and practice problems for all competitive exams.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Progress Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Detailed performance insights, weakness identification, strength analysis, and improvement recommendations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Competitive Environment</h3>
              <p className="text-gray-600 leading-relaxed">
                Compete with thousands of students nationwide, participate in live quizzes, and climb the leaderboards.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-pink-200">
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert-Curated Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Content created by IIT/IIM alumni and subject matter experts with years of teaching experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories That Inspire
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who have achieved their dream ranks with Vidyapeeth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <img src="https://media.licdn.com/dms/image/v2/D4D22AQG1DtRKiohVXw/feedshare-shrink_2048_1536/B4DZQ8uhvZHcAo-/0/1736185619944?e=1753920000&v=beta&t=XmLKIEa84LWB77pklSrPlBBdo5D7SwLxdjjC0O1zHZs" alt="JEE Topper" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="font-semibold text-gray-900">Bhavya Shah</div>
                  <div className="text-sm text-gray-600">VIT-CS aluminus</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Vidyapeeth's gamified approach made studying fun. The AI-powered analytics helped me identify my weak areas and improve systematically."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <img src="https://media.licdn.com/dms/image/v2/D4D03AQEhl_uARMWe3Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1696930496555?e=1756339200&v=beta&t=NLltMdSsKr57rrcH4P-YLNdlu1J8lErF-IRgAPoKfoc" alt="NEET Topper" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="font-semibold text-gray-900">Kaushik Salunkhe</div>
                  <div className="text-sm text-gray-600">IUCAA Jr. Researcher</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The comprehensive study materials and mock tests on Vidyapeeth were exactly what I needed to crack my placement prep with a top rank."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <img src="https://media.licdn.com/dms/image/v2/D4D03AQFpK2PsphpwYQ/profile-displayphoto-shrink_800_800/B4DZW0uDCyHYAg-/0/1742493728182?e=1756339200&v=beta&t=nu4KaIAvJluYFws6blEjtoHL3lJnOosicgelckFwmv4" alt="GATE Topper" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="font-semibold text-gray-900">Lavanya Saindane</div>
                  <div className="text-sm text-gray-600">VIT-E&TC</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The structured approach and competitive environment on Vidyapeeth helped me stay motivated throughout my GATE and college preparation."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Success Journey in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and begin your personalized exam preparation journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Exam</h3>
              <p className="text-gray-600 leading-relaxed">
                Select your target exam (JEE, NEET, GATE, CET, etc.) and complete your academic profile setup.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Access Study Materials</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant access to comprehensive study materials, mock tests, and practice questions tailored to your exam.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track & Improve</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your progress with AI analytics, compete on leaderboards, and achieve your target rank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Crack Your Dream Exam?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join 50,000+ students who are already on their path to success with India's most trusted exam preparation platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center"
            >
              Start Free Preparation Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Instant access to materials</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Vidyapeeth</h3>
              </div>
              <p className="text-gray-400 text-sm">
                India's leading gamified learning platform for competitive exam preparation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Undergraduate Exams</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>JEE Main & Advanced</li>
                <li>NEET UG</li>
                <li>MHT CET</li>
                <li>Board Exams</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Graduate Exams</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>GATE</li>
                <li>University Exams</li>
                <li>Technical Education</li>
                <li>Competitive Tests</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Sadguru Solutions. All rights reserved.
            </div>
            <div className="text-gray-400 text-sm">
              Made with ❤️ for students across India
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}