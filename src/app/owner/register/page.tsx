"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function OwnerRegistration() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", middleName: "", email: "", password: "", confirmPassword: "",
    country: "Nigeria", state: "", streetAddress: "", phoneCountryCode: "+234", phoneNumber: "",
    nin: "", nokFirstName: "", nokLastName: "", nokRelationship: "", nokPhone: "",
    bankName: "", bankCode: "", accountNumber: "", preferredAssetClass: "", intendedVolume: ""
  });

  // Mock Bank List 
  const banks = [
    { name: "Access Bank", code: "044" },
    { name: "Guaranty Trust Bank", code: "058" },
    { name: "Zenith Bank", code: "057" },
    { name: "First Bank of Nigeria", code: "011" },
    { name: "United Bank for Africa", code: "033" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    setErrorMsg("");
    if (step === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.password)) {
      setErrorMsg("Please complete all required identity fields.");
      return;
    }
    if (step === 1 && formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/owner/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- SUCCESS STATE ----------------
  if (success) {
    return (
      <main className="min-h-screen bg-void-navy flex items-center justify-center p-4 sm:p-6 text-crisp-white">
        <div className="max-w-lg w-full bg-void-light/5 border border-cobalt/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl backdrop-blur-sm">
          <div className="w-20 h-20 bg-cobalt/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cobalt/30">
            <ShieldCheck className="w-10 h-10 text-signal-red" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-4 uppercase tracking-wider">Application Received</h2>
          <p className="text-slate-light text-sm sm:text-base leading-relaxed mb-8">
            Your asset owner application has been securely logged. Our administration team is currently running mandatory KYC verification on your details. You will be notified via email once your portal access is granted.
          </p>
          <Link href="/owner/login" className="inline-flex items-center justify-center w-full px-8 py-4 bg-signal-red hover:bg-signal-red/90 text-crisp-white font-bold rounded-xl transition-all tracking-wide uppercase text-sm">
            Proceed to Login Portal
          </Link>
        </div>
      </main>
    );
  }

  // Common Input Style for the premium look
  const inputStyle = "w-full bg-void-light/5 border border-cobalt/30 rounded-lg px-4 py-3 sm:py-3.5 text-crisp-white text-sm sm:text-base focus:outline-none focus:border-signal-red focus:bg-void-light/10 transition-all placeholder:text-slate-light/30";
  const labelStyle = "block text-[10px] sm:text-xs font-bold text-slate-light/70 uppercase tracking-widest mb-1.5 sm:mb-2";

  return (
    <main className="min-h-screen bg-void-navy flex flex-col lg:flex-row text-crisp-white">
      
      {/* LEFT SIDE: Corporate Branding & Timeline */}
      <div className="lg:w-1/3 xl:w-1/4 bg-void-navy border-b lg:border-b-0 lg:border-r border-cobalt/20 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-void-light/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="text-2xl sm:text-3xl font-black tracking-wider text-crisp-white hover:opacity-80 transition block mb-12 lg:mb-20">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          
          {/* Timeline Process */}
          <div className="hidden sm:block space-y-10 relative border-l border-cobalt/20 ml-2">
            
            {/* Step 1 Indicator */}
            <div className={`relative pl-8 transition-opacity duration-500 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-colors duration-500 ${step === 1 ? 'bg-signal-red shadow-[0_0_10px_rgba(233,69,96,0.8)]' : 'bg-cobalt'}`} />
              <div className="text-[10px] font-bold text-signal-red uppercase tracking-widest mb-1">Phase 01</div>
              <h3 className="font-bold text-sm tracking-wide">Identity & Security</h3>
            </div>
            
            {/* Step 2 Indicator */}
            <div className={`relative pl-8 transition-opacity duration-500 ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-colors duration-500 ${step === 2 ? 'bg-signal-red shadow-[0_0_10px_rgba(233,69,96,0.8)]' : 'bg-cobalt'}`} />
              <div className="text-[10px] font-bold text-signal-red uppercase tracking-widest mb-1">Phase 02</div>
              <h3 className="font-bold text-sm tracking-wide">Location & Succession</h3>
            </div>
            
            {/* Step 3 Indicator */}
            <div className={`relative pl-8 transition-opacity duration-500 ${step === 3 ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-colors duration-500 ${step === 3 ? 'bg-signal-red shadow-[0_0_10px_rgba(233,69,96,0.8)]' : 'bg-cobalt'}`} />
              <div className="text-[10px] font-bold text-signal-red uppercase tracking-widest mb-1">Phase 03</div>
              <h3 className="font-bold text-sm tracking-wide">Financial Routing</h3>
            </div>
            
          </div>

          {/* Mobile Step Indicator */}
          <div className="sm:hidden flex items-center justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-signal-red">Phase 0{step}</span>
            <span className="text-slate-light/50">of 03</span>
          </div>
        </div>

        <div className="hidden lg:block relative z-10 text-[10px] text-slate-light/50 font-bold uppercase tracking-widest mt-12">
          Strict KYC Enforcement <br /> RC-9335611
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-2xl w-full">
          
          <div className="mb-8 sm:mb-12 border-b border-cobalt/20 pb-6 sm:pb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider mb-2 sm:mb-3">Asset Owner Registry</h1>
            <p className="text-sm sm:text-base text-slate-light leading-relaxed">
              Complete your KYC profiling to gain access to the administration portal. All data is securely encrypted.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-signal-red/10 border border-signal-red/50 text-signal-red px-4 py-3 sm:py-4 rounded-lg mb-8 text-sm font-medium flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6 sm:space-y-8">
            
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className={labelStyle}>First Name <span className="text-signal-red">*</span></label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputStyle} placeholder="Legal First Name" required />
                  </div>
                  <div>
                    <label className={labelStyle}>Last Name <span className="text-signal-red">*</span></label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputStyle} placeholder="Legal Last Name" required />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Middle Name (Optional)</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className={inputStyle} placeholder="Middle Name" />
                </div>
                <div>
                  <label className={labelStyle}>National Identity Number (NIN) <span className="text-signal-red">*</span></label>
                  <input type="number" name="nin" value={formData.nin} onChange={handleInputChange} placeholder="11-Digit Government ID" className={inputStyle} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className={labelStyle}>Email Address <span className="text-signal-red">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputStyle} placeholder="name@company.com" required />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1/3">
                      <label className={labelStyle}>Code</label>
                      <input type="text" name="phoneCountryCode" value={formData.phoneCountryCode} onChange={handleInputChange} className={inputStyle} required />
                    </div>
                    <div className="w-2/3">
                      <label className={labelStyle}>WhatsApp No. <span className="text-signal-red">*</span></label>
                      <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={inputStyle} placeholder="801 234 5678" required />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className={labelStyle}>Password <span className="text-signal-red">*</span></label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={inputStyle} placeholder="••••••••" required />
                  </div>
                  <div>
                    <label className={labelStyle}>Confirm Password <span className="text-signal-red">*</span></label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={inputStyle} placeholder="••••••••" required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION & NOK */}
            {step === 2 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className={labelStyle}>Country of Residence <span className="text-signal-red">*</span></label>
                    <select name="country" value={formData.country} onChange={handleInputChange} className={`${inputStyle} appearance-none`} required>
                      <option value="Nigeria">Nigeria</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="UAE">UAE</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>State / Province <span className="text-signal-red">*</span></label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputStyle} placeholder="e.g., Lagos" required />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Full Street Address <span className="text-signal-red">*</span></label>
                  <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} className={inputStyle} placeholder="Unit, House Number, Street Name" required />
                </div>
                
                <div className="pt-6 pb-2">
                  <h4 className="text-base sm:text-lg font-bold border-b border-cobalt/20 pb-3">Asset Succession (Next of Kin)</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className={labelStyle}>NOK First Name <span className="text-signal-red">*</span></label>
                    <input type="text" name="nokFirstName" value={formData.nokFirstName} onChange={handleInputChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>NOK Last Name <span className="text-signal-red">*</span></label>
                    <input type="text" name="nokLastName" value={formData.nokLastName} onChange={handleInputChange} className={inputStyle} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className={labelStyle}>Relationship <span className="text-signal-red">*</span></label>
                    <select name="nokRelationship" value={formData.nokRelationship} onChange={handleInputChange} className={`${inputStyle} appearance-none`} required>
                      <option value="">Select...</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Phone Number <span className="text-signal-red">*</span></label>
                    <input type="tel" name="nokPhone" value={formData.nokPhone} onChange={handleInputChange} className={inputStyle} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: FINANCIAL & INTENT */}
            {step === 3 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-void-light/5 border border-cobalt/30 p-5 rounded-xl mb-6">
                  <p className="text-xs sm:text-sm text-slate-light leading-relaxed">
                    <strong className="text-signal-red uppercase tracking-wider block mb-1">Remittance Routing</strong> 
                    This bank account will receive your weekly collections. It will be verified directly against the NUBAN database to ensure the account name matches your registered identity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className={labelStyle}>Bank Name <span className="text-signal-red">*</span></label>
                    <select 
                      name="bankCode" 
                      value={formData.bankCode} 
                      onChange={(e) => {
                        const selectedBank = banks.find(b => b.code === e.target.value);
                        setFormData({ ...formData, bankCode: e.target.value, bankName: selectedBank?.name || "" });
                      }} 
                      className={`${inputStyle} appearance-none`}
                      required
                    >
                      <option value="">Select Bank...</option>
                      {banks.map(bank => (
                        <option key={bank.code} value={bank.code}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Account Number <span className="text-signal-red">*</span></label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} maxLength={10} placeholder="10 Digits" className={inputStyle} required />
                  </div>
                </div>

                <div className="pt-6 pb-2">
                  <h4 className="text-base sm:text-lg font-bold border-b border-cobalt/20 pb-3">Administration Intent</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className={labelStyle}>Target Asset Class</label>
                    <select name="preferredAssetClass" value={formData.preferredAssetClass} onChange={handleInputChange} className={`${inputStyle} appearance-none`} required>
                      <option value="">Select...</option>
                      <option value="Tricycle">Tricycle (Keke)</option>
                      <option value="Uber Sedan">Uber/Bolt Sedan</option>
                      <option value="Mini-Bus">Mini-Bus (Korope)</option>
                      <option value="Tipper Truck">Tipper Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Intended Volume</label>
                    <select name="intendedVolume" value={formData.intendedVolume} onChange={handleInputChange} className={`${inputStyle} appearance-none`} required>
                      <option value="">Select...</option>
                      <option value="1 Vehicle">1 Vehicle</option>
                      <option value="2-5 Vehicles">2-5 Vehicles</option>
                      <option value="6+ Fleet">6+ Fleet</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* FORM CONTROLS */}
            <div className="pt-8 flex items-center justify-between mt-8">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-light hover:text-crisp-white transition py-2">
                  <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Go Back
                </button>
              ) : <div></div>}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 sm:px-10 py-3.5 sm:py-4 bg-signal-red text-crisp-white text-xs sm:text-sm font-bold uppercase tracking-wide rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin sm:w-5 sm:h-5" /> Processing</>
                ) : (
                  <>{step === 3 ? "Submit Application" : "Proceed"} {step !== 3 && <ChevronRight size={16} className="sm:w-5 sm:h-5" />}</>
                )}
              </button>
            </div>

          </form>
          
          <div className="mt-12 text-center text-[11px] sm:text-xs font-medium text-slate-light uppercase tracking-widest pt-8 border-t border-cobalt/20">
            Registered Asset Owner? <Link href="/owner/login" className="text-signal-red font-bold hover:text-signal-red/80 ml-1">Access Portal</Link>
          </div>

        </div>
      </div>
    </main>
  );
}
