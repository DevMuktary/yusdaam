"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, XCircle, Check, X, Eye, EyeOff, HelpCircle, UploadCloud } from "lucide-react";
import { Country, State } from "country-state-city";
import { CldUploadWidget } from "next-cloudinary";

// --- REUSABLE TOOLTIP COMPONENT ---
const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex ml-2 cursor-help">
    <HelpCircle size={14} className="text-cobalt hover:text-signal-red transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-void-navy border border-cobalt/30 text-[10px] text-slate-light leading-relaxed rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-void-navy" />
    </div>
  </div>
);

export default function OwnerRegistration() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [banks, setBanks] = useState<{name: string, code: string}[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const [bankError, setBankError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    countryIso: "NG", countryName: "Nigeria", state: "", streetAddress: "", phoneCountryCode: "+234", phoneNumber: "",
    nin: "", bvn: "", passportUrl: "", utilityBillUrl: "",
    bankName: "", bankCode: "", accountNumber: "", preferredAssetClass: "", preferredAssetClassOther: "", intendedVolume: "",
    nokFirstName: "", nokLastName: "", nokRelationship: "", nokRelationshipOther: "", nokPhone: "", nokAddress: "", nokIdNumber: ""
  });

  const countries = useMemo(() => Country.getAllCountries(), []);
  const availableStates = useMemo(() => State.getStatesOfCountry(formData.countryIso), [formData.countryIso]);

  // --- FETCH BANKS VIA INTERNAL API ---
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch("/api/owner/banks"); // Updated to use our secure backend route
        const data = await res.json();
        if (data.status) {
          setBanks(data.data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        console.error("Failed to load banks");
      } finally { 
        setIsLoadingBanks(false); 
      }
    };
    fetchBanks();
  }, []);

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
    { label: "Number", met: /[0-9]/.test(formData.password) },
    { label: "Special", met: /[^A-Za-z0-9]/.test(formData.password) }
  ];
  const passScore = passwordCriteria.filter(c => c.met).length;

  useEffect(() => {
    const verifyAccount = async () => {
      if (formData.accountNumber.length === 10 && formData.bankCode) {
        setIsVerifyingBank(true); setBankError(""); setVerifiedAccountName("");
        try {
          const res = await fetch("/api/owner/verify-bank", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountNumber: formData.accountNumber, bankCode: formData.bankCode })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setVerifiedAccountName(data.accountName);
        } catch (err: any) { setBankError(err.message); } finally { setIsVerifyingBank(false); }
      } else { setVerifiedAccountName(""); setBankError(""); }
    };
    const debounce = setTimeout(() => verifyAccount(), 500); 
    return () => clearTimeout(debounce);
  }, [formData.accountNumber, formData.bankCode]);

  const nextStep = () => {
    setErrorMsg("");
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.nin || !formData.bvn || !formData.phoneNumber) return setErrorMsg("Please fill all required identity fields.");
      if (formData.nin.length !== 11) return setErrorMsg("NIN must be exactly 11 digits.");
      if (formData.bvn.length !== 11) return setErrorMsg("BVN must be exactly 11 digits.");
      if (!formData.passportUrl) return setErrorMsg("You must upload a clear Passport Photograph.");
      if (passScore < 5) return setErrorMsg("Password does not meet security requirements.");
      if (formData.password !== formData.confirmPassword) return setErrorMsg("Passwords do not match.");
    }
    if (step === 2) {
      if (!formData.state || !formData.streetAddress) return setErrorMsg("Please complete your address details.");
      if (!formData.utilityBillUrl) return setErrorMsg("You must upload a valid Utility Bill.");
    }
    if (step === 3) {
      if (!verifiedAccountName) return setErrorMsg("Please provide a verified bank account.");
      if (formData.preferredAssetClass === "Others" && !formData.preferredAssetClassOther) return setErrorMsg("Please specify your preferred asset class.");
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!formData.nokFirstName || !formData.nokAddress || !formData.nokIdNumber) {
      return setErrorMsg("Please complete all Next of Kin details.");
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData, country: formData.countryName,
        nokRelationship: formData.nokRelationship === "Others" ? formData.nokRelationshipOther : formData.nokRelationship,
        preferredAssetClass: formData.preferredAssetClass === "Others" ? formData.preferredAssetClassOther : formData.preferredAssetClass
      }; 
      const res = await fetch("/api/owner/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsSubmitting(false); }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-void-navy flex items-center justify-center p-4 text-crisp-white">
        <div className="max-w-lg w-full bg-void-light/5 border border-cobalt/30 p-12 rounded-2xl text-center shadow-2xl">
          <ShieldCheck className="w-16 h-16 text-signal-red mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 uppercase tracking-wider">Profile Secured</h2>
          <p className="text-slate-light leading-relaxed mb-8">
            Your profile is currently locked. Our administration team is running mandatory KYC and Document checks. You will receive an email once your portal is activated.
          </p>
          <Link href="/owner/login" className="inline-block px-8 py-4 bg-signal-red hover:bg-signal-red/90 font-bold rounded-xl w-full text-sm uppercase">Proceed to Login</Link>
        </div>
      </main>
    );
  }

  const inputStyle = "w-full bg-void-light/5 border border-signal-red/60 rounded-lg px-4 py-3.5 text-[16px] text-crisp-white focus:outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/40 transition-all placeholder:text-slate-light/40 shadow-[0_0_10px_rgba(233,69,96,0.05)]";
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
                <h3 className="font-bold text-sm">{s === 1 ? 'Identity' : s === 2 ? 'Location & Docs' : s === 3 ? 'Financials' : 'Succession'}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-4 sm:p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-2xl w-full">
          
          <div className="mb-6 sm:mb-12 border-b border-cobalt/20 pb-4 sm:pb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase mb-2">Asset Owner Registry</h1>
            <p className="text-xs sm:text-base text-slate-light">Complete KYC profiling for portal access.</p>
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
                    <label className={labelStyle}>NIN * <Tooltip text="National Identity Number is required by the Federal Government for financial asset tracking." /></label>
                    <input type="text" inputMode="numeric" name="nin" value={formData.nin} onChange={(e) => handleNumberOnlyChange(e, 11)} placeholder="11 Digits" className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>BVN * <Tooltip text="Bank Verification Number ensures the identity matches the financial remittance account you will provide." /></label>
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

                {/* CLOUDINARY: Passport Upload */}
                <div>
                  <label className={labelStyle}>Passport Photograph * <Tooltip text="A clear, recent photograph of your face for profile identification." /></label>
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={(result: any) => setFormData({ ...formData, passportUrl: result.info.secure_url })}
                  >
                    {({ open }) => (
                      <div 
                        onClick={() => open()} 
                        className={`w-full h-24 sm:h-32 border-2 ${formData.passportUrl ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red hover:bg-void-light/10'} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer`}
                      >
                        {formData.passportUrl ? (
                          <>
                            <CheckCircle2 size={32} className="mb-2 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Passport Attached</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={32} className="mb-2 text-cobalt" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-light">Click to upload image</span>
                          </>
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
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light/50 hover:text-crisp-white transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-3 space-y-1.5 bg-void-light/5 border border-cobalt/20 p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-slate-light/60 uppercase tracking-widest mb-2 border-b border-cobalt/20 pb-1">Security Requirements</p>
                        {passwordCriteria.map((req, i) => (
                          <div key={i} className={`flex items-center gap-2 text-xs font-medium transition-colors ${req.met ? 'text-emerald-400' : 'text-slate-light/50'}`}>
                            {req.met ? <Check size={14} /> : <X size={14} />}
                            {req.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className={labelStyle}>Confirm Password *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleTextChange} className={`${inputStyle} pr-12`} required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light/50 hover:text-crisp-white transition-colors">
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION & DOCS */}
            {step === 2 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Country *</label>
                    <select value={formData.countryIso} onChange={handleCountryChange} className={`${inputStyle} appearance-none cursor-pointer`} required>
                      {countries.map(c => <option key={c.isoCode} value={c.isoCode} className="bg-void-navy text-crisp-white">{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>State / Province *</label>
                    <select name="state" value={formData.state} onChange={handleTextChange} className={`${inputStyle} appearance-none cursor-pointer`} required>
                      <option value="" className="bg-void-navy text-slate-light">Select State...</option>
                      {availableStates.map(s => <option key={s.isoCode} value={s.name} className="bg-void-navy text-crisp-white">{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Full Street Address *</label>
                  <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleTextChange} className={inputStyle} placeholder="Unit, House No, Street" required />
                </div>
                
                {/* CLOUDINARY: Utility Bill Upload */}
                <div className="pt-4 border-t border-cobalt/20">
                  <label className={labelStyle}>Utility Bill Upload * <Tooltip text="Must be a recent PHCN, LAWMA, or Water bill showing your name and address for KYC compliance." /></label>
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={(result: any) => setFormData({ ...formData, utilityBillUrl: result.info.secure_url })}
                  >
                    {({ open }) => (
                      <div 
                        onClick={() => open()} 
                        className={`w-full h-24 sm:h-32 border-2 ${formData.utilityBillUrl ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red hover:bg-void-light/10'} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer`}
                      >
                        {formData.utilityBillUrl ? (
                          <>
                            <CheckCircle2 size={32} className="mb-2 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Utility Bill Attached</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={32} className="mb-2 text-cobalt" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-light">Upload Document (PDF/JPG)</span>
                          </>
                        )}
                      </div>
                    )}
                  </CldUploadWidget>
                </div>
              </div>
            )}

            {/* STEP 3: FINANCIALS */}
            {step === 3 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Bank Name *</label>
                    <select name="bankCode" value={formData.bankCode} onChange={(e) => {
                        const selectedBank = banks.find(b => b.code === e.target.value);
                        setFormData({ ...formData, bankCode: e.target.value, bankName: selectedBank?.name || "" });
                      }} className={`${inputStyle} appearance-none cursor-pointer`} required disabled={isLoadingBanks}>
                      <option value="" className="bg-void-navy text-slate-light">{isLoadingBanks ? "Loading Banks..." : "Select Bank..."}</option>
                      {banks.map(b => <option key={b.code} value={b.code} className="bg-void-navy text-crisp-white">{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Account Number *</label>
                    <input type="text" inputMode="numeric" name="accountNumber" value={formData.accountNumber} onChange={(e) => handleNumberOnlyChange(e, 10)} placeholder="10 Digits" className={inputStyle} required />
                  </div>
                </div>

                <div className="h-12 flex items-center bg-void-navy/50 px-4 rounded-lg border border-cobalt/20">
                  {isVerifyingBank && <p className="text-sm text-slate-light flex items-center gap-2"><Loader2 size={16} className="animate-spin text-cobalt" /> Resolving Account...</p>}
                  {bankError && <p className="text-sm text-signal-red flex items-center gap-2 font-bold"><XCircle size={16} /> {bankError}</p>}
                  {verifiedAccountName && <p className="text-sm text-emerald-400 font-bold flex items-center gap-2"><CheckCircle2 size={16} /> Verified: {verifiedAccountName}</p>}
                  {!isVerifyingBank && !bankError && !verifiedAccountName && <p className="text-[10px] uppercase tracking-widest text-slate-light/40">Awaiting 10-Digit Account Number...</p>}
                </div>

                <div className="pt-4 pb-2"><h4 className="text-base font-bold border-b border-cobalt/20 pb-3">Administration Intent</h4></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Target Asset Class</label>
                    <select name="preferredAssetClass" value={formData.preferredAssetClass} onChange={handleTextChange} className={`${inputStyle} appearance-none cursor-pointer`} required>
                      <option value="" className="bg-void-navy">Select...</option>
                      <option value="Tricycle" className="bg-void-navy text-crisp-white">Tricycle (Keke)</option>
                      <option value="Uber Sedan" className="bg-void-navy text-crisp-white">Uber/Bolt Sedan</option>
                      <option value="Mini-Bus" className="bg-void-navy text-crisp-white">Mini-Bus (Korope)</option>
                      <option value="Tipper Truck" className="bg-void-navy text-crisp-white">Tipper Truck</option>
                      <option value="Others" className="bg-void-navy text-crisp-white">Others (Specify)</option>
                    </select>
                  </div>
                  
                  {formData.preferredAssetClass === "Others" ? (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <label className={labelStyle}>Specify Asset *</label>
                      <input type="text" name="preferredAssetClassOther" value={formData.preferredAssetClassOther} onChange={handleTextChange} className={inputStyle} placeholder="e.g. Delivery Van" required />
                    </div>
                  ) : (
                    <div>
                      <label className={labelStyle}>Intended Volume</label>
                      <select name="intendedVolume" value={formData.intendedVolume} onChange={handleTextChange} className={`${inputStyle} appearance-none cursor-pointer`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="1 Vehicle" className="bg-void-navy text-crisp-white">1 Vehicle</option>
                        <option value="2-5 Vehicles" className="bg-void-navy text-crisp-white">2-5 Vehicles</option>
                        <option value="6+ Fleet" className="bg-void-navy text-crisp-white">6+ Fleet</option>
                        <option value="Undecided" className="bg-void-navy text-crisp-white">Undecided</option>
                      </select>
                    </div>
                  )}

                  {/* If 'Others' took up the slot, shift Volume down */}
                  {formData.preferredAssetClass === "Others" && (
                    <div className="sm:col-span-2">
                      <label className={labelStyle}>Intended Volume</label>
                      <select name="intendedVolume" value={formData.intendedVolume} onChange={handleTextChange} className={`${inputStyle} appearance-none cursor-pointer`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="1 Vehicle" className="bg-void-navy text-crisp-white">1 Vehicle</option>
                        <option value="2-5 Vehicles" className="bg-void-navy text-crisp-white">2-5 Vehicles</option>
                        <option value="6+ Fleet" className="bg-void-navy text-crisp-white">6+ Fleet</option>
                        <option value="Undecided" className="bg-void-navy text-crisp-white">Undecided</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESSION (NEXT OF KIN) */}
            {step === 4 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="bg-signal-red/10 border border-signal-red/30 p-4 rounded-xl mb-6">
                  <p className="text-[11px] sm:text-xs text-slate-light leading-relaxed">
                    <strong className="text-signal-red uppercase tracking-wider block mb-1">Asset Succession Warning</strong> 
                    The person nominated below will inherit all administrative rights, rider payment instructions, and repossession benefits of your assets in the event of death or permanent incapacitation. This overrides all other claims except a valid court order.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className={labelStyle}>NOK First Name *</label><input type="text" name="nokFirstName" value={formData.nokFirstName} onChange={handleTextChange} className={inputStyle} required /></div>
                  <div><label className={labelStyle}>NOK Last Name *</label><input type="text" name="nokLastName" value={formData.nokLastName} onChange={handleTextChange} className={inputStyle} required /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>NOK NIN or BVN * <Tooltip text="Required to legally verify your Next of Kin before asset handover." /></label>
                    <input type="text" inputMode="numeric" name="nokIdNumber" value={formData.nokIdNumber} onChange={(e) => handleNumberOnlyChange(e, 11)} className={inputStyle} placeholder="11 Digits" required />
                  </div>
                  <div>
                    <label className={labelStyle}>Relationship *</label>
                    <select name="nokRelationship" value={formData.nokRelationship} onChange={handleTextChange} className={`${inputStyle} appearance-none cursor-pointer`} required>
                      <option value="" className="bg-void-navy">Select...</option>
                      <option value="Spouse" className="bg-void-navy text-crisp-white">Spouse</option>
                      <option value="Child" className="bg-void-navy text-crisp-white">Child</option>
                      <option value="Sibling" className="bg-void-navy text-crisp-white">Sibling</option>
                      <option value="Parent" className="bg-void-navy text-crisp-white">Parent</option>
                      <option value="Others" className="bg-void-navy text-crisp-white">Others (Specify)</option>
                    </select>
                  </div>
                  
                  {formData.nokRelationship === "Others" ? (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <label className={labelStyle}>Specify Relationship *</label>
                      <input type="text" name="nokRelationshipOther" value={formData.nokRelationshipOther} onChange={handleTextChange} className={inputStyle} placeholder="e.g. Uncle, Cousin" required />
                    </div>
                  ) : (
                    <div>
                      <label className={labelStyle}>Phone Number *</label>
                      <input type="text" inputMode="numeric" name="nokPhone" value={formData.nokPhone} onChange={(e) => handleNumberOnlyChange(e, 15)} className={inputStyle} required />
                    </div>
                  )}

                  {formData.nokRelationship === "Others" && (
                    <div className="sm:col-span-2">
                      <label className={labelStyle}>Phone Number *</label>
                      <input type="text" inputMode="numeric" name="nokPhone" value={formData.nokPhone} onChange={(e) => handleNumberOnlyChange(e, 15)} className={inputStyle} required />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className={labelStyle}>Full Address *</label>
                  <input type="text" name="nokAddress" value={formData.nokAddress} onChange={handleTextChange} className={inputStyle} placeholder="Full Home Address of Next of Kin" required />
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
              
              <button type="submit" disabled={isSubmitting || (step === 3 && (!verifiedAccountName || isVerifyingBank))} className="flex items-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing</> : <>{step === 4 ? "Submit Registration" : "Proceed"} {step !== 4 && <ChevronRight size={16} />}</>}
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </main>
  );
}
