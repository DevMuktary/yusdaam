"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, XCircle, Check, X, Eye, EyeOff, UploadCloud, HelpCircle } from "lucide-react";
import { Country, State } from "country-state-city";
import { CldUploadWidget } from "next-cloudinary";

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex ml-2 cursor-help">
    <HelpCircle size={14} className="text-cobalt hover:text-signal-red transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-void-navy border border-cobalt/30 text-[10px] text-slate-light leading-relaxed rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-void-navy" />
    </div>
  </div>
);

export default function RiderRegistration() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    phoneCountryCode: "+234", phoneNumber: "", nin: "", bvn: "", passportUrl: "",
    
    countryIso: "NG", countryName: "Nigeria", state: "", streetAddress: "", utilityBillUrl: "",
    driversLicenseNo: "", lasdriNo: "", driversLicenseUrl: "",
    
    preferredAssetClass: "", drivingExperienceYears: "", rideHailingActive: "false", previousHPExperience: "false",
    
    g1FirstName: "", g1LastName: "", g1Phone: "", g1Relationship: "",
    g2FirstName: "", g2LastName: "", g2Phone: "", g2Relationship: ""
  });

  // Prevent iOS Safari auto-zoom on input focus
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const availableStates = useMemo(() => State.getStatesOfCountry(formData.countryIso), [formData.countryIso]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumberOnlyChange = (e: React.ChangeEvent<HTMLInputElement>, maxLength: number) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setFormData({ ...formData, [e.target.name]: numericValue });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIso = e.target.value;
    const countryData = Country.getCountryByCode(selectedIso);
    setFormData({ ...formData, countryIso: selectedIso, countryName: countryData?.name || "", phoneCountryCode: `+${countryData?.phonecode || ""}`, state: "" });
  };

  const passwordCriteria = [
    { label: "8+ Char", met: formData.password.length >= 8 },
    { label: "Upper", met: /[A-Z]/.test(formData.password) },
    { label: "Lower", met: /[a-z]/.test(formData.password) },
    { label: "Number", met: /[0-9]/.test(formData.password) }
  ];
  const passScore = passwordCriteria.filter(c => c.met).length;

  const nextStep = () => {
    setErrorMsg("");
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.nin || !formData.bvn || !formData.phoneNumber) return setErrorMsg("Please fill all required identity fields.");
      if (formData.nin.length !== 11) return setErrorMsg("NIN must be exactly 11 digits.");
      if (formData.bvn.length !== 11) return setErrorMsg("BVN must be exactly 11 digits.");
      if (!formData.passportUrl) return setErrorMsg("You must upload a clear Passport Photograph.");
      if (passScore < 4) return setErrorMsg("Password does not meet security requirements.");
      if (formData.password !== formData.confirmPassword) return setErrorMsg("Passwords do not match.");
    }
    if (step === 2) {
      if (!formData.state || !formData.streetAddress) return setErrorMsg("Please complete your address details.");
      if (!formData.utilityBillUrl) return setErrorMsg("You must upload a valid Utility Bill.");
      if (!formData.driversLicenseNo || !formData.driversLicenseUrl) return setErrorMsg("Driver's License details and upload are mandatory.");
    }
    if (step === 3) {
      if (!formData.preferredAssetClass || !formData.drivingExperienceYears) return setErrorMsg("Please select your operational preferences.");
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!formData.g1FirstName || !formData.g1Phone || !formData.g2FirstName || !formData.g2Phone) {
      return setErrorMsg("Please complete basic details for BOTH Guarantors.");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rider/auth/register", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
    } catch (err: any) { 
      setErrorMsg(err.message); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-void-navy flex items-center justify-center p-4 text-crisp-white">
        <div className="max-w-lg w-full bg-void-light/5 border border-cobalt/30 p-12 rounded-2xl text-center shadow-2xl">
          <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 uppercase tracking-wider">Profile Created</h2>
          <p className="text-slate-light leading-relaxed mb-8">
            Your foundational Rider profile is secure. However, your account is locked until both of your nominated guarantors fulfill their legal requirements. Log in to track their progress.
          </p>
          <Link href="/rider/login" className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl w-full text-sm uppercase tracking-wider transition">
            Access Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const inputStyle = "w-full bg-void-light/5 border border-cobalt/30 rounded-lg px-4 py-3.5 text-base text-crisp-white focus:outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/40 transition-all placeholder:text-slate-light/40";
  const labelStyle = "flex items-center text-[10px] sm:text-xs font-bold text-slate-light/70 uppercase tracking-widest mb-1.5 sm:mb-2";

  return (
    <main className="min-h-screen bg-void-navy flex flex-col lg:flex-row text-crisp-white">
      
      {/* LEFT SIDE: Branding */}
      <div className="lg:w-1/3 xl:w-1/4 bg-void-navy border-b lg:border-b-0 lg:border-r border-cobalt/20 p-5 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div>
          <Link href="/" className="text-xl sm:text-3xl font-black tracking-wider hover:opacity-80 transition block mb-4 lg:mb-12">YUSDAAM<span className="text-signal-red">.</span></Link>
          <div className="hidden sm:block space-y-10 border-l border-cobalt/20 ml-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`relative pl-8 transition-opacity duration-500 ${step === s ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${step === s ? 'bg-signal-red shadow-[0_0_10px_rgba(233,69,96,0.8)]' : 'bg-cobalt'}`} />
                <div className="text-[10px] font-bold text-signal-red uppercase mb-1">Phase 0{s}</div>
                <h3 className="font-bold text-sm">{s === 1 ? 'Core Identity' : s === 2 ? 'Licensing & Docs' : s === 3 ? 'Operations' : 'Guarantors'}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-4 sm:p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-2xl w-full">
          
          <div className="mb-6 sm:mb-12 border-b border-cobalt/20 pb-4 sm:pb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase mb-2">Rider Application</h1>
            <p className="text-xs sm:text-base text-slate-light">Complete your KYC to access commercial fleet assignments.</p>
          </div>

          {errorMsg && (
            <div className="bg-signal-red/10 border border-signal-red text-signal-red px-4 py-3 rounded-lg mb-8 text-sm font-medium flex gap-2 items-start">
              <XCircle size={18} className="shrink-0 mt-0.5" /> <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6 sm:space-y-8">
            
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className={labelStyle}>First Name *</label><input type="text" name="firstName" value={formData.firstName} onChange={handleTextChange} className={inputStyle} required /></div>
                  <div><label className={labelStyle}>Last Name *</label><input type="text" name="lastName" value={formData.lastName} onChange={handleTextChange} className={inputStyle} required /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>NIN * <Tooltip text="National Identity Number is strictly required." /></label>
                    <input type="text" inputMode="numeric" name="nin" value={formData.nin} onChange={(e) => handleNumberOnlyChange(e, 11)} placeholder="11 Digits" className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>BVN * <Tooltip text="Bank Verification Number is required to prevent fraud." /></label>
                    <input type="text" inputMode="numeric" name="bvn" value={formData.bvn} onChange={(e) => handleNumberOnlyChange(e, 11)} placeholder="11 Digits" className={inputStyle} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className={labelStyle}>Email Address *</label><input type="email" name="email" value={formData.email} onChange={handleTextChange} className={inputStyle} required /></div>
                  <div className="flex gap-2">
                    <div className="w-1/3"><label className={labelStyle}>Code</label><input type="text" value={formData.phoneCountryCode} readOnly className={`${inputStyle} !bg-void-navy/50 text-slate-light/60 cursor-not-allowed`} /></div>
                    <div className="w-2/3"><label className={labelStyle}>WhatsApp No. *</label><input type="text" inputMode="numeric" name="phoneNumber" value={formData.phoneNumber} onChange={(e) => handleNumberOnlyChange(e, 15)} className={inputStyle} required /></div>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Passport Photograph * <Tooltip text="A clear, recent photograph of your face for your driver profile." /></label>
                  <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(r: any) => setFormData({ ...formData, passportUrl: r.info.secure_url })}>
                    {({ open }) => (
                      <div onClick={() => open()} className={`w-full h-24 sm:h-32 border-2 ${formData.passportUrl ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red'} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer`}>
                        {formData.passportUrl ? (
                          <><CheckCircle2 size={32} className="mb-2 text-emerald-400" /><span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Passport Attached</span></>
                        ) : (
                          <><UploadCloud size={32} className="mb-2 text-cobalt" /><span className="text-xs font-bold uppercase tracking-widest text-slate-light">Click to upload image</span></>
                        )}
                      </div>
                    )}
                  </CldUploadWidget>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-cobalt/20">
                  <div className="relative">
                    <label className={labelStyle}>Password *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleTextChange} className={`${inputStyle} pr-12`} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light/50 hover:text-crisp-white">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-3 space-y-1.5 bg-void-light/5 border border-cobalt/20 p-3 rounded-lg">
                        {passwordCriteria.map((req, i) => (
                          <div key={i} className={`flex items-center gap-2 text-xs font-medium ${req.met ? 'text-emerald-400' : 'text-slate-light/50'}`}>
                            {req.met ? <Check size={14} /> : <X size={14} />} {req.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelStyle}>Confirm Password *</label>
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleTextChange} className={inputStyle} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: LICENSING & DOCS */}
            {step === 2 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>State of Residence *</label>
                    <select name="state" value={formData.state} onChange={handleTextChange} className={`${inputStyle} appearance-none cursor-pointer`} required>
                      <option value="" className="bg-void-navy text-slate-light">Select State...</option>
                      {availableStates.map(s => <option key={s.isoCode} value={s.name} className="bg-void-navy text-crisp-white">{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Full Street Address *</label>
                    <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleTextChange} className={inputStyle} placeholder="Unit, House No, Street" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-cobalt/20">
                  <div>
                    <label className={labelStyle}>Driver's License No. *</label>
                    <input type="text" name="driversLicenseNo" value={formData.driversLicenseNo} onChange={handleTextChange} className={inputStyle} placeholder="Valid License Number" required />
                  </div>
                  <div>
                    <label className={labelStyle}>LASDRI Number <Tooltip text="Required if operating commercially within Lagos State." /></label>
                    <input type="text" name="lasdriNo" value={formData.lasdriNo} onChange={handleTextChange} className={inputStyle} placeholder="Optional for Non-Lagos" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Driver's License Upload *</label>
                    <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(r: any) => setFormData({ ...formData, driversLicenseUrl: r.info.secure_url })}>
                      {({ open }) => (
                        <div onClick={() => open()} className={`w-full h-24 border-2 ${formData.driversLicenseUrl ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red'} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer`}>
                          {formData.driversLicenseUrl ? <span className="text-xs font-bold text-emerald-400">License Attached</span> : <span className="text-xs font-bold text-slate-light">Upload License</span>}
                        </div>
                      )}
                    </CldUploadWidget>
                  </div>
                  <div>
                    <label className={labelStyle}>Utility Bill Upload *</label>
                    <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(r: any) => setFormData({ ...formData, utilityBillUrl: r.info.secure_url })}>
                      {({ open }) => (
                        <div onClick={() => open()} className={`w-full h-24 border-2 ${formData.utilityBillUrl ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red'} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer`}>
                          {formData.utilityBillUrl ? <span className="text-xs font-bold text-emerald-400">Bill Attached</span> : <span className="text-xs font-bold text-slate-light">Upload Bill</span>}
                        </div>
                      )}
                    </CldUploadWidget>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: OPERATIONS */}
            {step === 3 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Preferred Asset *</label>
                    <select name="preferredAssetClass" value={formData.preferredAssetClass} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                      <option value="" className="bg-void-navy">Select...</option>
                      <option value="TRICYCLE" className="bg-void-navy text-crisp-white">Tricycle (Keke)</option>
                      <option value="CAR_UBER" className="bg-void-navy text-crisp-white">Uber/Bolt Sedan</option>
                      <option value="MINIBUS_KOROPE" className="bg-void-navy text-crisp-white">Mini-Bus (Korope)</option>
                      <option value="TIPPER" className="bg-void-navy text-crisp-white">Tipper Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Commercial Experience *</label>
                    <select name="drivingExperienceYears" value={formData.drivingExperienceYears} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                      <option value="" className="bg-void-navy">Select...</option>
                      <option value="0-2 Years" className="bg-void-navy text-crisp-white">0 - 2 Years</option>
                      <option value="3-5 Years" className="bg-void-navy text-crisp-white">3 - 5 Years</option>
                      <option value="5+ Years" className="bg-void-navy text-crisp-white">5+ Years</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-cobalt/20">
                  <div>
                    <label className={labelStyle}>Active on Uber/Bolt/inDrive? *</label>
                    <select name="rideHailingActive" value={formData.rideHailingActive} onChange={handleTextChange} className={`${inputStyle} appearance-none`}>
                      <option value="false" className="bg-void-navy text-crisp-white">No</option>
                      <option value="true" className="bg-void-navy text-crisp-white">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Previous Hire Purchase Exp? *</label>
                    <select name="previousHPExperience" value={formData.previousHPExperience} onChange={handleTextChange} className={`${inputStyle} appearance-none`}>
                      <option value="false" className="bg-void-navy text-crisp-white">No</option>
                      <option value="true" className="bg-void-navy text-crisp-white">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: GUARANTORS */}
            {step === 4 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="bg-signal-red/10 border border-signal-red/30 p-4 rounded-xl mb-4">
                  <p className="text-[11px] sm:text-xs text-slate-light leading-relaxed">
                    <strong className="text-signal-red uppercase tracking-wider block mb-1">Guarantor Protocol</strong> 
                    Enter the basic details of two capable individuals who will guarantee your asset. Once you submit, your dashboard will generate unique links for you to send to them to complete their legal attestations.
                  </p>
                </div>

                {/* Guarantor 1 */}
                <div className="p-5 border border-cobalt/30 rounded-xl bg-void-navy/50">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 border-b border-cobalt/20 pb-2">Primary Guarantor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelStyle}>First Name *</label><input type="text" name="g1FirstName" value={formData.g1FirstName} onChange={handleTextChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Last Name *</label><input type="text" name="g1LastName" value={formData.g1LastName} onChange={handleTextChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Phone Number *</label><input type="text" inputMode="numeric" name="g1Phone" value={formData.g1Phone} onChange={(e) => handleNumberOnlyChange(e, 15)} className={inputStyle} required /></div>
                    <div>
                      <label className={labelStyle}>Relationship *</label>
                      <select name="g1Relationship" value={formData.g1Relationship} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="Parent" className="bg-void-navy text-crisp-white">Parent</option>
                        <option value="Sibling" className="bg-void-navy text-crisp-white">Sibling</option>
                        <option value="Spouse" className="bg-void-navy text-crisp-white">Spouse</option>
                        <option value="Uncle/Aunt" className="bg-void-navy text-crisp-white">Uncle / Aunt</option>
                        <option value="Community Leader" className="bg-void-navy text-crisp-white">Community/Religious Leader</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Guarantor 2 */}
                <div className="p-5 border border-cobalt/30 rounded-xl bg-void-navy/50">
                  <h4 className="text-xs font-bold text-cobalt uppercase tracking-widest mb-4 border-b border-cobalt/20 pb-2">Secondary Guarantor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelStyle}>First Name *</label><input type="text" name="g2FirstName" value={formData.g2FirstName} onChange={handleTextChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Last Name *</label><input type="text" name="g2LastName" value={formData.g2LastName} onChange={handleTextChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Phone Number *</label><input type="text" inputMode="numeric" name="g2Phone" value={formData.g2Phone} onChange={(e) => handleNumberOnlyChange(e, 15)} className={inputStyle} required /></div>
                    <div>
                      <label className={labelStyle}>Relationship *</label>
                      <select name="g2Relationship" value={formData.g2Relationship} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="Parent" className="bg-void-navy text-crisp-white">Parent</option>
                        <option value="Sibling" className="bg-void-navy text-crisp-white">Sibling</option>
                        <option value="Spouse" className="bg-void-navy text-crisp-white">Spouse</option>
                        <option value="Uncle/Aunt" className="bg-void-navy text-crisp-white">Uncle / Aunt</option>
                        <option value="Community Leader" className="bg-void-navy text-crisp-white">Community/Religious Leader</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM CONTROLS */}
            <div className="pt-8 flex items-center justify-between mt-8 border-t border-cobalt/20">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-light hover:text-crisp-white transition">
                  <ArrowLeft size={14} /> Back
                </button>
              ) : <div />}
              
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing</> : <>{step === 4 ? "Complete Profile" : "Proceed"} {step !== 4 && <ChevronRight size={16} />}</>}
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </main>
  );
}
