"use client";

import { CarFront, ShieldCheck, Settings2, FileText, Lock, AlertTriangle, Key } from "lucide-react";
import Image from "next/image";

export default function VehicleClient({ rider, vehicle }: { rider: any, vehicle: any }) {
  
  // Helper to get the correct image based on the vehicle type
  const getVehicleImage = (type: string) => {
    switch (type) {
      case "TRICYCLE": return "/images/showcase-tricycle.png";
      case "MINIBUS_KOROPE": return "/images/showcase-minibus.png";
      case "CAR_UBER": return "/images/showcase-uber.png";
      case "TIPPER": return "/images/showcase-tipper.png";
      case "MOTORCYCLE": return "/images/keke-transparent.png"; // Fallback if no specific moto image
      default: return "/images/showcase-tricycle.png";
    }
  };

  const getVehicleTypeName = (type: string) => {
    switch (type) {
      case "TRICYCLE": return "Tricycle (Keke)";
      case "MINIBUS_KOROPE": return "Minibus (Korope)";
      case "CAR_UBER": return "Standard Car";
      case "TIPPER": return "Tipper / Truck";
      case "MOTORCYCLE": return "Motorcycle";
      default: return type;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2">My Vehicle</h1>
        <p className="text-sm text-slate-light">Digital logbook and specifications for your assigned asset.</p>
      </div>

      {!vehicle ? (
        <div className="bg-void-dark border border-cobalt/20 rounded-xl p-12 text-center shadow-lg mt-8">
          <div className="w-24 h-24 bg-void-light/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-slate-light/40" />
          </div>
          <h3 className="text-2xl font-black text-crisp-white uppercase tracking-wider mb-2">No Vehicle Assigned</h3>
          <p className="text-sm text-slate-light max-w-md mx-auto mb-8 leading-relaxed">
            You currently do not have an active fleet assignment. Complete your guarantor verification and pending agreements to unlock your asset.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: VEHICLE SHOWCASE & SPECS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Showcase Card */}
            <div className="bg-void-dark border border-cobalt/20 rounded-xl overflow-hidden shadow-lg relative">
              <div className="absolute top-0 right-0 p-6 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <ShieldCheck size={12} /> Active Assignment
                </span>
              </div>

              <div className="bg-gradient-to-b from-void-light/10 to-transparent pt-12 pb-6 px-6 flex justify-center items-center relative overflow-hidden h-64 sm:h-80">
                {/* Glow effect behind vehicle */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-64 h-64 bg-cobalt rounded-full blur-[100px]"></div>
                </div>
                
                <Image 
                  src={getVehicleImage(vehicle.type)} 
                  alt={vehicle.makeModel || "Vehicle"} 
                  width={400} 
                  height={300} 
                  className="object-contain drop-shadow-2xl z-10 scale-110 sm:scale-125 hover:scale-150 transition-transform duration-700"
                />

                {/* MOCK IMAGE DISCLAIMER */}
                <div className="absolute bottom-2 w-full text-center z-20">
                  <p className="text-[9px] text-slate-light/60 italic uppercase tracking-widest bg-void-dark/50 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                    * This is a mock image and does not show your exact vehicle
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-void-navy/50 border-t border-cobalt/20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs text-cobalt font-bold uppercase tracking-widest mb-1">{getVehicleTypeName(vehicle.type)}</p>
                    <h2 className="text-3xl font-black text-crisp-white">{vehicle.makeModel || "Standard Model"}</h2>
                  </div>
                  <div className="bg-signal-red/10 border border-signal-red/20 px-4 py-2 rounded-lg inline-block">
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest text-center mb-0.5">Plate Number</p>
                    <p className="text-lg font-black text-crisp-white tracking-widest">{vehicle.registrationNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-void-dark p-4 rounded-xl border border-void-light/10">
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><CarFront size={12} className="text-cobalt"/> Year</p>
                    <p className="text-sm font-bold text-crisp-white">{vehicle.year || "N/A"}</p>
                  </div>
                  <div className="bg-void-dark p-4 rounded-xl border border-void-light/10">
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><Settings2 size={12} className="text-cobalt"/> Engine No.</p>
                    <p className="text-xs font-mono text-crisp-white truncate" title={vehicle.engineNumber}>{vehicle.engineNumber || "N/A"}</p>
                  </div>
                  <div className="bg-void-dark p-4 rounded-xl border border-void-light/10">
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><Key size={12} className="text-cobalt"/> Chassis No.</p>
                    <p className="text-xs font-mono text-crisp-white truncate" title={vehicle.chassisNumber}>{vehicle.chassisNumber || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* GPS & Compliance Notice */}
            <div className="bg-cobalt/10 border border-cobalt/30 rounded-xl p-6 flex gap-4 items-start">
              <div className="p-3 bg-cobalt/20 rounded-full shrink-0 text-cobalt">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-crisp-white uppercase tracking-wider mb-2">Telematics & Tracking Active</h4>
                <p className="text-xs text-slate-light leading-relaxed">
                  This vehicle is equipped with active GPS tracking and engine-immobilization telematics. Any attempt to tamper with, bypass, or remove the tracking devices will result in immediate engine shutdown, contract termination, and legal action.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTRACT & TERMS */}
          <div className="space-y-6">
            
            <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
                <FileText size={18} className="text-cobalt"/> Agreement Terms
              </h3>

              {vehicle.contract ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Total Asset Value</p>
                    <p className="text-xl font-black text-crisp-white font-mono">₦{vehicle.contract.totalPrice?.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Weekly Remittance</p>
                    <p className="text-xl font-black text-signal-red font-mono">₦{vehicle.contract.weeklyRemittance?.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Payment Day</p>
                    <p className="text-sm font-bold text-crisp-white uppercase">{vehicle.contract.paymentDay || "Friday 11:59 PM"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Contract Tenure</p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-black text-crisp-white">{vehicle.contract.agreedDurationMonths * 4}</p>
                      <p className="text-xs text-slate-light font-bold uppercase tracking-widest pb-1">Weeks</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-cobalt/20">
                    <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-2">Legal Document</p>
                    {rider.hpaAgreementUrl ? (
                      <a 
                        href={`${rider.hpaAgreementUrl}?fl_attachment=YUSDAAM_HPA.pdf`} 
                        download
                        className="w-full flex items-center justify-center gap-2 py-3 bg-void-light/10 hover:bg-void-light/20 border border-cobalt/30 text-crisp-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                      >
                        Download Contract
                      </a>
                    ) : (
                      <p className="text-xs text-signal-red italic">Contract document not found.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={32} className="text-slate-light/20 mx-auto mb-3" />
                  <p className="text-xs text-slate-light italic">No financial contract has been assigned to this vehicle yet.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
