import React from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Play, 
  Users, 
  ArrowRight, 
  Quote, 
  Heart, 
  Activity, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Stethoscope,
  BrainCircuit,
  Droplets,
  Video
} from "lucide-react";

interface LandingPageProps {
  onNavigateToAuth: () => void;
  onNavigateToDashboard: () => void;
  isAuthenticated: boolean;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function LandingPage({ 
  onNavigateToAuth, 
  onNavigateToDashboard, 
  isAuthenticated,
  darkMode,
  setDarkMode
}: LandingPageProps) {

  const specialties = [
    {
      id: "cardio",
      title: "Cardiología",
      desc: "Cuidado integral del corazón con diagnósticos no invasivos de última generación.",
      icon: Heart,
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      id: "derma",
      title: "Dermatología",
      desc: "Tratamientos avanzados para la salud y estética de la piel con láser de vanguardia.",
      icon: Droplets,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      id: "neuro",
      title: "Neurología",
      desc: "Expertos en el sistema nervioso y tratamientos complejos de la salud cerebral.",
      icon: BrainCircuit,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      id: "diagnos",
      title: "Diagnóstico Avanzado",
      desc: "Imagen de alta resolución y laboratorio clínico con procesamiento ultrarrápido.",
      icon: Stethoscope,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  const doctors = [
    {
      name: "Dra. Elena Valdés",
      role: "Directora de Cardiología",
      desc: "Investigadora y especialista en cardiología preventiva con más de 15 años de trayectoria.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBj9rlWROLDJdytF7E8PttJgO6nlDOSI0PwSaRDGpwSfHUdWGgMvoQOemvNgyeHfZnBc988x8GCl3CW1ViPxw18rIhD4gp2hbFseOHXvZQ8lhV6LBi5CzSUzkTA58qyRdi2mO7VjJ_OHnN7uTneImQ-DsXXR8K6HaqN6wSXxw9UsAgQdwvsU4uYaXYddsMT1S8KO0EGRH0ALzZXFfAmjFIwj6s-qIh-xAtX-lju55DImhQZzAmJGl32w"
    },
    {
      name: "Dr. Julian Marcos",
      role: "Jefe de Neurocirugía",
      desc: "Pionero en microcirugía robótica de tumores cerebrales y técnicas mínimamente invasivas.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6LCiAcgqBG_bdbbWuW8douf48tLT32tQKGlun8pwTL3nZbDh-OobZ7csPORr9k0KDDyuJJSnEQl_3lnoplVV8dCtMfZ_2VzeXzGHiiKinVadDV8s5_g1aLrwAROPOIYxf5etSVQE96uomteurspPmvwoUCEaD-gktz5BQjmy2Eo8i5LmnOtZCciPaVAaBlcEklmgWcMYVW4UEiLLvkffkHcQQeQYSR_-f3LH174wfOpMff8vVlavjwg"
    },
    {
      name: "Dra. Sofía Rivas",
      role: "Especialista en Dermatología",
      desc: "Experta internacional en tratamientos dermoestéticos con láser y oncología cutánea.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnGXwRqqq-DK1ggNtloGqU6iF7GaN5YDtpf2xxVbqG14PUCKoImtE4v5Za8Xxs9qg2nhxFGQQYoHNnToTQj7JaOeZHgETgYXxpp_1XKVlBQ2VEnT75RBeRpYHN-u-YMbaEz323GVsUWJvJYOTf2UT2DDjbVCiBm0_HtStKRjFRk5V-pTV7ehCKJP5AHo6TEzLbW-Y6O7_Z0kJ58d1lk-GYUzdlZPh0Mz-o4YtoMgGs98uz2pJpT1OLCQ"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg font-display">
              P
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-950 dark:text-white">
              Clínica <span className="text-emerald-600">Premium</span>
            </span>
          </div>
          
          <nav className="flex items-center gap-6">
            <a href="#especialidades" className="hidden md:inline text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">
              Especialidades
            </a>
            <a href="#equipo" className="hidden md:inline text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">
              Nuestro Equipo
            </a>
            <a href="#testimonios" className="hidden md:inline text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">
              Pacientes
            </a>

            {/* Dark Mode Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Alternar modo oscuro"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {isAuthenticated ? (
              <button 
                id="btn-landing-dashboard"
                onClick={onNavigateToDashboard}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Mi Portal Médico
              </button>
            ) : (
              <button 
                id="btn-landing-login"
                onClick={onNavigateToAuth}
                className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-slate-950/10 transition-all"
              >
                Acceder / Registrarse
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-16 md:py-24">
        {/* Decorative Grid Patterns */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Excelencia Médica Certificada
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
              Su salud merece <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">la máxima precisión.</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-lg">
              Combinamos la tecnología médica más avanzada con un trato humano exclusivo. En Clínica Premium, su bienestar es nuestra única prioridad.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                id="btn-hero-schedule"
                onClick={isAuthenticated ? onNavigateToDashboard : onNavigateToAuth}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Pedir Cita Ahora
              </button>
              <button 
                id="btn-hero-explore"
                onClick={() => {
                  const elem = document.getElementById("especialidades");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm px-6 py-4 rounded-2xl transition-all"
              >
                <Play className="w-4 h-4 fill-current text-emerald-600" />
                Explorar Servicios
              </button>
            </div>
          </div>
          
          <div className="relative">
            {/* Visual Frame */}
            <motion.div 
              className="relative z-10 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 group"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5-QXPLZLkmo0DPMnNlFE_eSLawZiAegSVI0-4SN1lzBSCydhK3qMdnEuKL5xABiEJ_1-c_jESWisPcfDvt0ZY63HwAMN47_h8LjBTpV2aL11JKGDSd7LKOlWUsdMNys4X9Tzhth7YdMPalidizAWSvCV3d0FHteEDjhM8nXtBvVtJZPlquKvN8hTYrcwS6IrC-HD4-COO25cSuapi043p3WJ-pnF3Y7XN00rrADQgG0NQ4hcZuZcbKg" 
                alt="Médico Profesional"
                className="w-full h-[480px] object-cover filter brightness-[1.02] contrast-[1.02] group-hover:scale-105 group-hover:contrast-105 transition-all duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              {/* Shiny Light Reflection Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-20 pointer-events-none" />
              {/* Elegant Gradient Rim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
            
            {/* Overlay Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl z-20 flex items-center gap-4 max-w-[260px] border border-slate-100 dark:border-slate-700">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold font-display text-slate-900 dark:text-white">+15.000</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Pacientes Satisfechos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Bento Grid */}
      <section className="py-20 md:py-28" id="especialidades">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
              Nuestras Especialidades Médicas
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto">
              Contamos con unidades especializadas equipadas con la última tecnología diagnóstica para ofrecerle tratamientos eficaces y personalizados.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((spec) => {
              const IconComponent = spec.icon;
              return (
                <div 
                  key={spec.id}
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 ${spec.bg} ${spec.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                    {spec.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {spec.desc}
                  </p>
                  <button 
                    onClick={isAuthenticated ? onNavigateToDashboard : onNavigateToAuth}
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors"
                  >
                    Agendar en esta unidad <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clinical Team Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800" id="equipo">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
                Nuestro Exclusivo Equipo Médico
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Especialistas de renombre internacional comprometidos con la investigación científica y la máxima dedicación al paciente.
              </p>
            </div>
            <button 
              id="btn-meet-team"
              onClick={isAuthenticated ? onNavigateToDashboard : onNavigateToAuth}
              className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
            >
              Consultar disponibilidad <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doc, idx) => (
              <div key={idx} className="space-y-4 group">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={doc.image} 
                    alt={doc.name}
                    className="w-full h-full object-cover filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Emerald Soft Overlay */}
                  <div className="absolute inset-0 bg-emerald-950/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  {/* Reflection sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-20 pointer-events-none" />
                  {/* Description with slide-up fade-in */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                    <p className="text-xs text-white/95 leading-relaxed font-normal translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      {doc.desc}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {doc.name}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {doc.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient voice & satisfaction stats */}
      <section className="py-20 md:py-28" id="testimonios">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
              La voz de nuestros pacientes
            </h2>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <Quote className="absolute -top-4 -left-4 text-emerald-600/20 w-12 h-12" />
              <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed text-base mb-6">
                "La atención en Clínica Premium superó todas mis expectativas. No solo por la excelente tecnología láser y diagnósticos inmediatos, sino por la calidez, dedicación y profesionalismo absoluto de los doctores."
              </p>
              
              <div className="flex items-center gap-4">
                <div className="relative group/avatar shrink-0">
                  {/* Glow expansion effect */}
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-sm scale-100 group-hover/avatar:scale-125 opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 pointer-events-none" />
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBtJN4OwVCfnnCw4lfD5HnEMLEyLOuFcUsNmuF6JVLTmHnvE-QFo9Wtm9x3Eqy0JajgySPqbifhggIApHixSZqFeZonAdscx0vfCH1wcQT5OyyD5_uvx922T_7srxLmsNLAoPD0ad_8iQEgyc_-HBRNxe9HPmZn0JvptVxGcRSOIAgfzHzCrBJUp6kWie11QxGd3Ybz2dwkSx1vdCbJHQAP5kx5wFj-7YjnxF-zVTTI6KYUnAXtm4R-Q" 
                    alt="Isabel García"
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 group-hover/avatar:border-emerald-500 group-hover/avatar:scale-105 transition-all duration-300 relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">Isabel García</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Paciente de Neurocirugía & Bienestar</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative h-[340px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl bg-slate-950">
            <motion.img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuATe0K0jie4PEcE3oijPLMYhYKJxck0M-ZCv_NNVokIVeTY7kHoTE_KUD9vADcSeHIy-vXD5Nmh22UkaxJckQeBZAZ8st6cgJAVT0swt7GGNv6bkNe0C3CxV_SWPetJf8X4CYydBE3Jeqvkk8NYuU-ZGkfHtOzdFNk3q5Zl4N9O9qP1M-hOcP9jPdf51pcxLJZ2MbIO7hxL1G44xPtepjh0-koveYCw9V3WDiFECWbtfMX6h-cBsHBl4g" 
              alt="Instalaciones y ciencia"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35]"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-8">
              <Activity className="w-16 h-16 text-emerald-400 mb-4 animate-pulse" />
              <div className="text-5xl font-extrabold font-display mb-2">98%</div>
              <div className="text-sm font-semibold tracking-widest text-emerald-400 uppercase">Índice de satisfacción clínica</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 dark:bg-slate-800 rounded-[40px] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
              Inicie su camino hacia una salud de precisión.
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Agende su consulta de valoración con nuestros especialistas médicos de élite y reciba un trato totalmente adaptado.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                id="btn-cta-schedule"
                onClick={isAuthenticated ? onNavigateToDashboard : onNavigateToAuth}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-8 py-4 rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
              >
                Pedir Cita Online
              </button>
              <button 
                onClick={onNavigateToAuth}
                className="bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all"
              >
                Registrar Nuevo Paciente
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="font-display font-bold text-base text-slate-900 dark:text-white">
              Clínica Premium
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Clínica Premium. Excelencia Médica Privada en España. Todos los derechos reservados.
          </div>
          <div className="flex gap-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Términos de servicio</a>
            <span className="text-red-500 dark:text-red-400 font-bold flex items-center gap-1 animate-pulse">
              ● Emergencias: +34 900 123 456
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
