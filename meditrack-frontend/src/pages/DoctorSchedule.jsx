import React, { useState } from 'react';
import { User, Stethoscope, Clock, Calendar, Search, MapPin, Star, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DOCTORS = [
  {
    id: 1,
    name: "Dr. Sunita Sharma",
    specialization: "General Physician",
    experience: "12+ Years",
    rating: 4.8,
    reviews: 124,
    timings: "10:00 AM - 01:00 PM",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita",
    location: "South Delhi Medical Center"
  },
  {
    id: 2,
    name: "Dr. Arjun Mehta",
    specialization: "Pediatrician",
    experience: "8+ Years",
    rating: 4.9,
    reviews: 89,
    timings: "04:00 PM - 07:00 PM",
    days: ["Mon", "Wed", "Fri", "Sat"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    location: "City Children's Hospital"
  },
  {
    id: 3,
    name: "Dr. Rajesh Iyer",
    specialization: "Cardiologist",
    experience: "15+ Years",
    rating: 4.7,
    reviews: 210,
    timings: "09:00 AM - 12:00 PM",
    days: ["Tue", "Thu", "Sat"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    location: "Heart Care Institute"
  },
  {
    id: 4,
    name: "Dr. Preeti Verma",
    specialization: "Dermatologist",
    experience: "10+ Years",
    rating: 4.6,
    reviews: 156,
    timings: "11:00 AM - 02:00 PM",
    days: ["Mon", "Tue", "Thu", "Fri"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Preeti",
    location: "Skin & Glow Clinic"
  },
  {
    id: 5,
    name: "Dr. Vikram Singh",
    specialization: "Orthopedic",
    experience: "14+ Years",
    rating: 4.8,
    reviews: 178,
    timings: "05:00 PM - 08:00 PM",
    days: ["Wed", "Thu", "Sat", "Sun"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    location: "Orthocare Specialty"
  },
  {
    id: 6,
    name: "Dr. Ananya Reddy",
    specialization: "Gynecologist",
    experience: "9+ Years",
    rating: 4.9,
    reviews: 142,
    timings: "10:30 AM - 01:30 PM",
    days: ["Mon", "Wed", "Fri"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    location: "Women's Wellness Hub"
  },
  {
    id: 7,
    name: "Dr. Ramesh Gupta",
    specialization: "ENT Specialist",
    experience: "11+ Years",
    rating: 4.5,
    reviews: 95,
    timings: "02:00 PM - 05:00 PM",
    days: ["Tue", "Thu", "Sat"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh",
    location: "Ear & Nose Care Center"
  },
  {
    id: 8,
    name: "Dr. Kavita Nair",
    specialization: "Neurologist",
    experience: "13+ Years",
    rating: 4.7,
    reviews: 112,
    timings: "09:30 AM - 12:30 PM",
    days: ["Mon", "Thu", "Sat"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita",
    location: "Neuroscience Institute"
  }
];

const DoctorSchedule = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [bookedDoctors, setBookedDoctors] = useState([]);

  const specializations = ['All', ...new Set(DOCTORS.map(d => d.specialization))];

  const handleBooking = (id, name) => {
    if (bookedDoctors.includes(id)) return;
    setBookedDoctors(prev => [...prev, id]);
    toast.success(`Consultation booked with ${name}!`, {
      icon: '✅',
      style: {
        borderRadius: '12px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const filteredDoctors = DOCTORS.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || d.specialization === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-10 animate-fade-in-up" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Stethoscope size={22} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Doctor Schedules
          </h1>
        </div>
        <p className="text-slate-500 font-medium max-w-2xl">
          Browse verified specialist doctors at nearby medical centers. Admin-curated directory for your convenience.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or specialization..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {specializations.map(spec => (
            <button
              key={spec}
              onClick={() => setFilter(spec)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                filter === spec 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <User size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No doctors found</h3>
          <p className="text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => {
            const isBooked = bookedDoctors.includes(doctor.id);
            return (
              <div key={doctor.id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                
                <div className="flex gap-5 mb-6 relative">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 p-0.5 flex-shrink-0">
                   {/* Fallback to dicebear if image is missing */}
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full rounded-2xl object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-extrabold text-slate-900 leading-tight">{doctor.name}</h3>
                      <ShieldCheck size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-indigo-600 text-sm font-bold">{doctor.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{doctor.rating}</span>
                      <span className="text-xs text-slate-400 font-medium">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <Clock size={16} className="text-indigo-500" />
                    <span className="font-semibold">{doctor.timings}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <Calendar size={16} className="text-indigo-500" />
                    <span className="font-semibold">{doctor.days.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 px-2.5">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="font-medium truncate">{doctor.location}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleBooking(doctor.id, doctor.name)}
                  disabled={isBooked}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 duration-150 flex items-center justify-center gap-2 ${
                    isBooked 
                    ? 'bg-emerald-500 text-white cursor-default' 
                    : 'bg-slate-900 text-white hover:bg-indigo-600'
                  }`}
                >
                  {isBooked ? (
                    <>
                      <CheckCircle2 size={18} />
                      Appointment Booked
                    </>
                  ) : (
                    'Book Consultation'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
