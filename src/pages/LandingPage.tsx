import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Map, 
  MessageSquare, 
  WifiOff, 
  Camera, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Smartphone,
  ChevronRight,
  Star,
  Download,
  Youtube,
  Menu,
  Facebook,
  Instagram,
  Twitter,
  Plane,
  Bed,
  Ticket
} from 'lucide-react';
import { useI18n } from '../lib/i18n';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleGetStarted = () => navigate('/app');

  return (
    <div className="min-h-screen bg-[#FFFBEA] text-slate-900 font-sans overflow-x-hidden selection:bg-red-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFBEA]/90 backdrop-blur-md border-b border-red-500/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg">
            <Map className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">VoyageAI</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGetStarted}
            className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-red-700 transition-colors hidden sm:block shadow-md hover:shadow-lg"
          >
            Launch App
          </button>
          <button className="md:hidden text-slate-900 hover:text-red-600 transition-colors p-1">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFFBEA]/40 via-[#FFFBEA]/80 to-[#FFFBEA] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=2000" 
            alt="Vietnam Ha Long Bay" 
            className="w-full h-full object-cover opacity-30 mix-blend-multiply"
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-red-500/20 text-xs font-bold text-red-600 mb-6 uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Vietnam Travel Assistant
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1] text-slate-900 drop-shadow-sm">
             Explore Vietnam with Confidence
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-10 max-w-2xl leading-relaxed">
            AI-powered itineraries, offline travel tools, smart recommendations, and local guidance — your smart local travel companion in your pocket.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-full text-base font-bold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone size={20} />
              Open Web App
            </button>
            <button 
              onClick={() => navigate('/local-experiences')}
              className="w-full sm:w-auto bg-white/60 backdrop-blur-md border border-red-500/20 text-red-600 px-8 py-4 rounded-full text-base font-bold hover:bg-white/80 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Explore Features <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative z-10 w-full overflow-hidden max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24 relative z-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-slate-900"
          >
            A smart companion in your pocket
          </motion.h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
            Everything you need for a stress-free trip to Vietnam, packed into one beautifully designed app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Map size={24} className="text-red-500" />}
            title="AI Itinerary Planner"
            description="First-timer friendly personalized plans with smart local recommendations."
            delay={0.1}
            onClick={() => navigate('/app?intent=ai-planner')}
          />
          <FeatureCard 
            icon={<MessageSquare size={24} className="text-yellow-600" />}
            title="AI Travel Assistant"
            description="Conversational AI for travel questions and local guidance on the go."
            delay={0.2}
            onClick={() => navigate('/assistant')}
          />
          <FeatureCard 
            icon={<WifiOff size={24} className="text-orange-500" />}
            title="Offline Travel Mode"
            description="Access your saved trips, cached guides, and documents without internet."
            delay={0.3}
          />
          <FeatureCard 
            icon={<MapPin size={24} className="text-teal-600" />}
            title="Feel the true heartbeat of Vietnam"
            description="Discover hidden gems, local food, cafés, and connect with locals securely."
            delay={0.4}
            onClick={() => navigate('/explore')}
          />
          <FeatureCard 
            icon={<FileText size={24} className="text-green-600" />}
            title="E-Visa & Forms"
            description="Simplified visa application and essential travel documents."
            delay={0.5}
            onClick={() => navigate('/evisa')}
          />
          <FeatureCard 
            icon={<Camera size={24} className="text-pink-600" />}
            title="Camera AI Features"
            description="Scan menus, identify landmarks, and translate receipts instantly."
            delay={0.6}
          />
        </div>
      </section>

      {/* Vietnam Experience Section */}
      <section id="experience" className="py-24 px-6 bg-white relative border-y border-red-500/10">
        <div className="max-w-7xl mx-auto">
          {/* Affiliate Booking Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 w-full">
            <a
              href={`https://www.skyscanner.com/`}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:border-brand-300 hover:shadow-md hover:bg-white transition-all cursor-pointer group"
            >
              <div className="bg-brand-100 text-brand-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Plane size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Flights</h3>
                <p className="text-sm text-slate-500 font-medium">Find the best deals</p>
              </div>
            </a>
            <a
              href={`https://www.booking.com/searchresults.html?ss=Vietnam`}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:border-indigo-300 hover:shadow-md hover:bg-white transition-all cursor-pointer group"
            >
              <div className="bg-indigo-100 text-indigo-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Bed size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Hotels</h3>
                <p className="text-sm text-slate-500 font-medium">Book your stay</p>
              </div>
            </a>
            <a
              href={`https://www.getyourguide.com/s?q=Vietnam`}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:border-emerald-300 hover:shadow-md hover:bg-white transition-all cursor-pointer group"
            >
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Ticket size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Tours</h3>
                <p className="text-sm text-slate-500 font-medium">Discover activities</p>
              </div>
            </a>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Feel the true heartbeat of Vietnam</h2>
              <p className="text-slate-600 text-lg font-medium">
                We don't just guide you to tourist traps. We help you experience the rich culture, hidden cafés, and authentic flavors safely.
              </p>
            </div>
            <button onClick={() => navigate('/explore')} className="shrink-0 bg-red-50 text-red-600 border border-red-500/20 hover:bg-red-100 hover:border-red-500/30 font-bold px-6 py-3 rounded-full text-sm transition-colors w-fit shadow-sm">
              View All Experiences
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
             {/* Large feature image */}
             <motion.div 
               whileHover={{ scale: 1.02 }}
               className="md:col-span-8 rounded-3xl overflow-hidden relative group cursor-pointer h-[400px] md:h-auto shadow-lg"
             >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <img src="https://images.unsplash.com/photo-1581337204873-ef36aa186caa?w=1200&q=80" alt="Da Nang Golden Bridge" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-0 left-0 p-8 z-20">
                  <div className="bg-yellow-400 text-yellow-900 border border-yellow-300 px-3 py-1 text-xs font-black rounded-full w-fit mb-3 uppercase tracking-wider shadow-sm">Local Experience</div>
                  <h3 className="text-3xl font-black text-white mb-2 drop-shadow-md">Da Nang Bridges & Beaches</h3>
                  <p className="text-slate-100 lg:w-2/3 drop-shadow-sm font-medium">Experience the breathtaking Golden Bridge and the spectacular coastal city vibes.</p>
                </div>
             </motion.div>

             {/* Stacked images */}
             <div className="md:col-span-4 grid grid-rows-2 gap-6 h-[500px] md:h-auto">
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="rounded-3xl overflow-hidden relative group cursor-pointer shadow-lg"
               >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80" alt="Hoi An Lanterns" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-0 left-0 p-6 z-20">
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Hoi An Ancient Town</h3>
                    <p className="text-slate-200 text-sm font-medium drop-shadow-sm">Discover the magic of thousands of glowing lanterns.</p>
                  </div>
               </motion.div>

               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="rounded-3xl overflow-hidden relative group cursor-pointer shadow-lg"
               >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Ho_Chi_Minh_City_Vietnam_42-Nguyen-Hue-Street-apartment-block-01.jpg/800px-Ho_Chi_Minh_City_Vietnam_42-Nguyen-Hue-Street-apartment-block-01.jpg" alt="Vietnamese Cafe Apartment" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-0 left-0 p-6 z-20">
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Hidden Café Culture</h3>
                    <p className="text-slate-200 text-sm font-medium drop-shadow-sm">Find the best egg coffee tucked away in hidden apartment cafes.</p>
                  </div>
               </motion.div>
             </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">How it works</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">Three simple steps to unlock your stress-free Vietnam adventure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-red-300 to-transparent z-0 border-dashed border-t border-red-300" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-white border border-red-200 flex items-center justify-center mb-6 shadow-xl relative">
              <div className="absolute -inset-0.5 bg-red-200 blur rounded-2xl opacity-50" />
              <Map size={32} className="text-red-500 relative z-10" />
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center border-4 border-[#FFFBEA] border-solid z-20 shadow-sm">1</div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Plan Your Trip</h3>
            <p className="text-slate-600 font-medium">Answer a few questions and our AI will generate a personalized Vietnam itinerary tailored to your style.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-white border border-yellow-200 flex items-center justify-center mb-6 shadow-xl relative">
              <div className="absolute -inset-0.5 bg-yellow-200 blur rounded-2xl opacity-50" />
              <MessageSquare size={32} className="text-yellow-500 relative z-10" />
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-yellow-500 text-white text-sm font-bold flex items-center justify-center border-4 border-[#FFFBEA] border-solid z-20 shadow-sm">2</div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Explore with AI</h3>
            <p className="text-slate-600 font-medium">Use the smart AI assistant for on-demand recommendations, translations, and local cultural help.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-white border border-teal-200 flex items-center justify-center mb-6 shadow-xl relative">
              <div className="absolute -inset-0.5 bg-teal-200 blur rounded-2xl opacity-50" />
              <ShieldCheck size={32} className="text-teal-500 relative z-10" />
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-teal-500 text-white text-sm font-bold flex items-center justify-center border-4 border-[#FFFBEA] border-solid z-20 shadow-sm">3</div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Travel Confidently</h3>
            <p className="text-slate-600 font-medium">Access maps, documents, and essential guides even when you don't have internet connection.</p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-white border-y border-red-500/10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Loved by travelers</h2>
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-4 drop-shadow-sm">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="VoyageAI made my first Vietnam trip so much easier. The scam prevention tips saved me on day one."
              name="Sarah Jenkins"
              role="Solo Traveler"
              avatar="https://i.pravatar.cc/150?u=sarah"
            />
            <TestimonialCard 
              quote="The offline tools saved me multiple times when my local SIM lost coverage in Ha Long Bay."
              name="David Chen"
              role="Digital Nomad"
              avatar="https://i.pravatar.cc/150?u=david"
            />
            <TestimonialCard 
              quote="It felt like having a local friend with me. Scanning the menus to know what I was eating was incredible."
              name="Emma Thompson"
              role="First-time Visitor"
              avatar="https://i.pravatar.cc/150?u=emma"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-100 to-yellow-100 z-0" />
        <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] p-10 md:p-16 text-center relative z-10 shadow-2xl">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-red-600 to-yellow-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
            <Map size={32} className="text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900 leading-tight">Ready to Explore Vietnam Smarter?</h2>
          <p className="text-slate-700 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join thousands of travelers who are experiencing the beauty of Vietnam with confidence, safety, and a local AI companion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-red-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl shadow-red-600/30 hover:bg-red-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Open the Web App
            </button>
            <a 
              href="https://www.youtube.com/@VoyageAI-VN"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-white hover:bg-red-50 text-slate-900 border border-red-500/20 px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Youtube size={22} className="text-red-500" /> Watch Videos
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-950 pt-20 pb-10 px-6 border-t border-red-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center shadow-lg">
                  <Map className="text-white" size={18} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">VoyageAI Travel</span>
              </div>
              <p className="text-red-100 max-w-sm mb-6 opacity-80">
                Your AI-powered travel assistant for Vietnam. Smart itineraries, local guidance, and offline tools designed to make you travel with confidence.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-red-200 hover:text-white hover:bg-white/15 transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-red-200 hover:text-white hover:bg-white/15 transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="https://www.youtube.com/@VoyageAI-VN" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-red-200 hover:text-white hover:bg-white/15 transition-colors">
                  <Youtube size={18} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="text-red-200/80 hover:text-white transition-colors">Features</a></li>
                <li><a href="#experience" className="text-red-200/80 hover:text-white transition-colors">Vietnam Guide</a></li>
                <li><a href="#" className="text-red-200/80 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-red-200/80 hover:text-white transition-colors">Offline Mode</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-red-200/80 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-red-200/80 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-red-200/80 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-red-200/80 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-red-900/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-red-200/60">
            <p>© {new Date().getFullYear()} VoyageAI Travel. All rights reserved.</p>
            <p>Designed with ❤️ for travelers in Vietnam.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ icon, title, description, delay, onClick }: { icon: React.ReactNode, title: string, description: string, delay: number, onClick?: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className={`bg-white border border-red-500/10 hover:border-red-500/30 p-8 rounded-3xl transition-all group backdrop-blur-sm shadow-sm hover:shadow-md ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 font-medium leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}

function TestimonialCard({ quote, name, role, avatar }: { quote: string, name: string, role: string, avatar: string }) {
  return (
    <div className="bg-white border border-red-500/10 shadow-sm hover:shadow-md transition-shadow p-8 rounded-3xl flex flex-col">
      <div className="text-red-500 mb-6 font-serif text-5xl opacity-30">"</div>
      <p className="text-slate-700 font-medium text-lg mb-8 flex-grow">{quote}</p>
      <div className="flex items-center gap-4 mt-auto">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full ring-2 ring-red-100 object-cover" />
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{name}</h4>
          <p className="text-slate-500 text-xs font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
}
