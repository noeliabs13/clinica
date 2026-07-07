import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db, logOut } from "../lib/firebase";
import { Appointment } from "../types";
import { jsPDF } from "jspdf";
import { 
  Users, 
  CalendarDays, 
  DollarSign, 
  LayoutDashboard, 
  FileText, 
  UserPlus, 
  Check, 
  X, 
  Trash2, 
  Search, 
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Loader2,
  Download,
  Plus,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface DashboardAdminProps {
  user: any;
  onLogout: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export default function DashboardAdmin({ user, onLogout, darkMode, setDarkMode }: DashboardAdminProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "appointments">("overview");

  // Create Appointment Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [patName, setPatName] = useState("");
  const [patEmail, setPatEmail] = useState("");
  const [docName, setDocName] = useState("Dra. Elena Valdés");
  const [specialty, setSpecialty] = useState("Cardiología");
  const [apptDate, setApptDate] = useState("2026-07-07");
  const [apptTime, setApptTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: Appointment[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Appointment);
      });
      setAppointments(list);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Appointment["status"]) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        status: newStatus
      });
      setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt));
    } catch (err) {
      console.error("Error updating appointment status:", err);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    const confirmed = window.confirm("¿Está seguro de que desea eliminar permanentemente esta cita del sistema? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "appointments", id));
      setAppointments(prev => prev.filter(appt => appt.id !== id));
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newAppt = {
        patientName: patName,
        patientEmail: patEmail,
        doctorName: docName,
        specialty: specialty,
        date: apptDate,
        time: apptTime,
        status: "Próxima" as const,
        notes: notes,
        userId: "admin-registered",
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, "appointments"), newAppt);
      setAppointments(prev => [{ id: docRef.id, ...newAppt }, ...prev]);
      setShowAddModal(false);
      // Reset
      setPatName("");
      setPatEmail("");
      setNotes("");
    } catch (err) {
      console.error("Error adding appointment:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDoctorChange = (selectedDoc: string) => {
    setDocName(selectedDoc);
    if (selectedDoc === "Dra. Elena Valdés") setSpecialty("Cardiología");
    else if (selectedDoc === "Dr. Julian Marcos") setSpecialty("Neurocirugía");
    else if (selectedDoc === "Dra. Sofía Rivas") setSpecialty("Dermatología");
    else setSpecialty("Consulta General");
  };

  // PDF Export Generation utilizing jsPDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Document Styling and Banner
      doc.setFillColor(15, 23, 42); // slate-900 color
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.text("CLINICA PREMIUM", 15, 20);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text("EXCELENCIA MEDICA Y DIAGNOSTICO DE ALTA PRECISION", 15, 30);

      // Date of report
      const reportDate = new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text(`Fecha del Reporte: ${reportDate}`, 15, 55);
      doc.text(`Generado por: ${user.displayName || "Administrador Clínica"}`, 15, 62);

      // KPIs
      doc.rect(15, 75, 50, 20);
      doc.setFont("Helvetica", "bold");
      doc.text("Citas Totales", 20, 82);
      doc.setFont("Helvetica", "normal");
      doc.text(appointments.length.toString(), 20, 90);

      doc.rect(75, 75, 50, 20);
      doc.setFont("Helvetica", "bold");
      doc.text("Completadas", 80, 82);
      doc.setFont("Helvetica", "normal");
      doc.text(appointments.filter(a => a.status === "Completada").length.toString(), 80, 90);

      doc.rect(135, 75, 60, 20);
      doc.setFont("Helvetica", "bold");
      doc.text("Facturacion Est.", 140, 82);
      doc.setFont("Helvetica", "normal");
      doc.text(`${appointments.length * 150} EUR`, 140, 90);

      // Table Header
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(15, 110, 180, 10, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text("Paciente", 20, 116);
      doc.text("Especialista", 70, 116);
      doc.text("Fecha", 120, 116);
      doc.text("Estado", 160, 116);

      // Table Rows
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      let y = 126;
      appointments.forEach((appt, index) => {
        if (index < 12) { // limit to first 12 for pagination ease
          doc.text(appt.patientName.substring(0, 25), 20, y);
          doc.text(appt.doctorName.substring(0, 20), 70, y);
          doc.text(`${appt.date} ${appt.time}`, 120, y);
          doc.text(appt.status, 160, y);
          y += 10;
        }
      });

      if (appointments.length > 12) {
        doc.setFontSize(8);
        doc.text(`* Mostrando las primeras 12 de ${appointments.length} citas registradas.`, 15, y + 5);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Documento oficial privado generado bajo encriptacion de Clinica Premium España.", 15, 280);

      doc.save(`Reporte_Clinico_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al exportar reporte PDF.");
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = filterStatus === "All" || appt.status === filterStatus;
    const matchesSearch = appt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          appt.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          appt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Trend data for admin chart
  const weeklyTrendData = [
    { name: "Lun", consultas: 12, ingresos: 1800 },
    { name: "Mar", consultas: 18, ingresos: 2700 },
    { name: "Mie", consultas: 22, ingresos: 3300 },
    { name: "Jue", consultas: 15, ingresos: 2250 },
    { name: "Vie", consultas: 25, ingresos: 3750 },
    { name: "Sab", consultas: 10, ingresos: 1500 },
    { name: "Dom", consultas: 4, ingresos: 600 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col py-6 px-4 shrink-0">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg border border-emerald-500">
            A
          </div>
          <div className="truncate">
            <h4 className="font-display font-bold text-sm text-white truncate">
              {user.displayName || "Admin Clínica"}
            </h4>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Médico Administrador
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Panel General
          </button>
          
          <button
            onClick={() => setActiveTab("appointments")}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all ${
              activeTab === "appointments"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <CalendarDays className="w-4 h-4" /> Gestor de Citas
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          <button
            onClick={handleExportPDF}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <Download className="w-4 h-4" /> Exportar Reporte PDF
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all"
          >
            <X className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Admin View */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Consola de Gestión Médica
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Acceso y control unificado de agenda clínica, finanzas estimadas y flujo de pacientes.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            {setDarkMode && (
              <button
                id="btn-admin-theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="Alternar modo oscuro"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agendar Cita Manual
            </button>
          </div>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* KPI Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Citas Agendadas</span>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><CalendarDays className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-display font-extrabold text-slate-950 dark:text-white">
                  {appointments.length}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Citas totales registradas</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Por Atender</span>
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg"><Clock className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-display font-extrabold text-slate-950 dark:text-white">
                  {appointments.filter(a => a.status === "Próxima" || a.status === "En espera").length}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Citas pendientes hoy</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ingresos Estimados</span>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><DollarSign className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-display font-extrabold text-slate-950 dark:text-white">
                  {appointments.length * 150}€
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Calculado a 150€ por consulta</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ocupación Salas</span>
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg"><Users className="w-4 h-4" /></div>
                </div>
                <div className="text-3xl font-display font-extrabold text-slate-950 dark:text-white">
                  85%
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Salas de consulta activas hoy</p>
              </div>

            </div>

            {/* Global Trends chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="font-display font-bold text-slate-950 dark:text-white text-base">Tendencia Semanal de Consultas</h4>
                    <span className="text-slate-400 text-xs">Ingresos (€) y volumen de pacientes atendidos</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <TrendingUp className="w-3.5 h-3.5" /> +22% vs mes anterior
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrendData}>
                      <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#0f172a", 
                          border: "none", 
                          borderRadius: "12px", 
                          color: "#fff" 
                        }} 
                      />
                      <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Doctors Shift list */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="font-display font-bold text-slate-950 dark:text-white text-base mb-6">Equipo de Turno</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">EV</div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-950 dark:text-white">Dra. Elena Valdés</h5>
                        <span className="text-[10px] text-slate-400">Cardiología</span>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/15 text-emerald-600 uppercase">Activo</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">JM</div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-950 dark:text-white">Dr. Julian Marcos</h5>
                        <span className="text-[10px] text-slate-400">Neurocirugía</span>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/15 text-emerald-600 uppercase">Activo</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">SR</div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-950 dark:text-white">Dra. Sofía Rivas</h5>
                        <span className="text-[10px] text-slate-400">Dermatología</span>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/15 text-emerald-600 uppercase">Activo</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Appointment Table tab */}
        {activeTab === "appointments" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            
            {/* Filter controls */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-950 px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente o doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-xs outline-none w-full dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none dark:text-white"
                >
                  <option value="All">Todos los estados</option>
                  <option value="Próxima">Próxima</option>
                  <option value="Completada">Completada</option>
                  <option value="Urgente">Urgente</option>
                  <option value="En espera">En espera</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-xs">Consultando base de datos...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs">No se encontraron citas bajo los criterios indicados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="px-6 py-3.5">Paciente</th>
                      <th className="px-6 py-3.5">Médico Asignado</th>
                      <th className="px-6 py-3.5">Especialidad</th>
                      <th className="px-6 py-3.5">Fecha / Hora</th>
                      <th className="px-6 py-3.5">Estado</th>
                      <th className="px-6 py-3.5">Notas clínicas</th>
                      <th className="px-6 py-3.5 text-right">Acciones de Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-slate-950 dark:text-white block">{appt.patientName}</span>
                            <span className="text-[10px] text-slate-400">{appt.patientEmail}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                          {appt.doctorName}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                          {appt.specialty}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-slate-950 dark:text-white block">{appt.date}</span>
                            <span className="text-[10px] text-slate-400">{appt.time} h</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={appt.status}
                            onChange={(e) => handleUpdateStatus(appt.id, e.target.value as Appointment["status"])}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border outline-none cursor-pointer ${
                              appt.status === "Completada"
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-200 dark:border-emerald-900"
                                : appt.status === "Urgente"
                                ? "bg-red-50 dark:bg-red-950/50 text-red-600 border-red-200 dark:border-red-900"
                                : appt.status === "En espera"
                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 border-blue-200 dark:border-blue-900"
                                : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-200 dark:border-amber-900"
                            }`}
                          >
                            <option value="Próxima">Próxima</option>
                            <option value="Completada">Completada</option>
                            <option value="Urgente">Urgente</option>
                            <option value="En espera">En espera</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-slate-500 dark:text-slate-400 italic">
                          {appt.notes || "Sin notas asignadas."}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteAppointment(appt.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/25 transition-all inline-flex items-center gap-1 font-bold text-[10px]"
                            title="Eliminar del sistema"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Manual Appointment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl max-w-md w-full animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold font-display text-slate-950 dark:text-white">Registrar Cita Manual</h4>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre del Paciente</label>
                  <input
                    type="text"
                    required
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    placeholder="Ej. Sra. Ana Martínez"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={patEmail}
                    onChange={(e) => setPatEmail(e.target.value)}
                    placeholder="paciente@correo.com"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Especialista / Especialidad</label>
                  <select
                    value={docName}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:text-white"
                  >
                    <option value="Dra. Elena Valdés">Dra. Elena Valdés (Cardiología)</option>
                    <option value="Dr. Julian Marcos">Dr. Julian Marcos (Neurocirugía)</option>
                    <option value="Dra. Sofía Rivas">Dra. Sofía Rivas (Dermatología)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hora</label>
                    <select
                      value={apptTime}
                      onChange={(e) => setApptTime(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:text-white"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="15:00">15:00 PM</option>
                      <option value="16:00">16:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notas Clínicas</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Síntomas iniciales, requerimiento quirúrgico, etc."
                    rows={3}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Agendar Nueva Cita"}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
