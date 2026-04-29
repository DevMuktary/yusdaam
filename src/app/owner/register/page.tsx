"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Country, State } from "country-state-city";

export default function OwnerRegistration() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Bank Verification States
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const [bankError, setBankError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", middleName: "", email: "", password: "", confirmPassword: "",
    countryIso: "NG", countryName: "Nigeria", state: "", streetAddress: "", phoneCountryCode: "+234", phoneNumber: "",
    nin: "", nokFirstName: "", nokLastName: "", nokRelationship: "", nokPhone: "",
    bankName: "", bankCode: "", accountNumber: "", preferredAssetClass: "", intendedVolume: ""
  });

  // Derived Data for Dropdowns
  const countries = useMemo(() => Country.getAllCountries(), []);
  const availableStates = useMemo(() => State.getStatesOfCountry(formData.countryIso), [formData.countryIso]);

  // Mock Bank List (To be replaced by Paystack bank list API in production)
  const banks = [
    { name: "Access Bank", code: "044" },
    { name: "Guaranty Trust Bank", code: "058" },
    { name: "Zenith Bank", code: "057" },
    { name: "First Bank of Nigeria", code: "011" },
    { name: "United Bank for Africa", code: "033" },
    { name: "Moniepoint MFB", code: "50515" },
    { name: "Opay", code: "999992" }
  ];

  // --- STRICT INPUT HANDLERS ---
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
    setFormData({ 
      ...formData, 
      countryIso: selectedIso, 
      countryName: countryData?.name || "", 
      phoneCountryCode: `+${countryData?.phonecode || ""}`,
      state: "" // Reset state when country changes
    });
  };

  // --- PASSWORD STRENGTH VALIDATOR ---
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 5
  };
  const passScore = getPasswordStrength(formData.password);

  // --- AUTO BANK VERIFICATION ---
  useEffect(() => {
    const verifyAccount = async () => {
      if (formData.accountNumber.length === 10 && formData.bankCode) {
        setIsVerifyingBank(true);
        setBankError("");
        setVerifiedAccountName("");

        try {
          const res = await fetch("/api/owner/verify-bank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountNumber: formData.accountNumber, bankCode: formData.bankCode })
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error);
          
          setVerifiedAccountName(data.accountName);
        } catch (err: any) {
          setBankError(err.message);
        } finally {
          setIsVerifyingBank(false);
        }
      } else {
        setVerifiedAccountName("");
        setBankError("");
      }
    };

    const debounce = setTimeout(() => verifyAccount(), 500); // 500ms delay to stop spamming API
    return () => clearTimeout(debounce);
  }, [formData.accountNumber, formData.bankCode]);

  // --- STEP NAVIGATION & VALIDATION ---
  const nextStep = () => {
    setErrorMsg("");
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.nin || !formData.phoneNumber) {
        return setErrorMsg("Please fill in all required identity fields.");
      }
      if (formData.nin.length !== 11) return setErrorMsg("NIN must be exactly 11 digits.");
      if (passScore < 4) return setErrorMsg("Password is too weak. Please meet the security criteria.");
      if (formData.password !== formData.confirmPassword) return setErrorMsg("Passwords do not match.");
    }

    if (step === 2) {
      if (!formData.state || !formData.streetAddress || !formData.nokFirstName || !formData.nokLastName || !formData.nokRelationship || !formData.nokPhone) {
        return setErrorMsg("Please complete your address and Next of Kin details.");
      }
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  // --- SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!verifiedAccountName) {
      return setErrorMsg("Please provide a valid, verified bank account before submitting.");
    }

    setIsSubmitting(true);
    try {
      // Pass the fully constructed payload
      const payload = { ...formData, country: formData.countryName }; 
      const res = await fetch("/api/owner/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  // --- SUCCESS RENDER ---
  if (success) {
    return (
      <main className="min-h-screen bg-void-navy flex items-center justify-center p-4 sm:p-6 text-crisp-white">
        <div className="max-w-lg w-full bg-void-light/5 border border-cobalt/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl">
          <ShieldCheck className="w-16 h-16 text-signal-red mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-black mb-4 uppercase tracking-wider">Application Received</h2>
          <p className="text-slate-light leading-relaxed mb-8">
            Your application is locked and secured. Our team is running mandatory KYC checks. You will receive an email once your portal is activated.
          </p>
          <Link href="/owner/login" className="inline-block px-8 py-4 bg-signal-red hover:bg-signal-red/90 font-bold rounded-xl w-full text-sm uppercase">
            Proceed to Login
          </Link>
        </div>
      </main>
    );
  }

  // NOTE: text-[16px] specifically added to inputs to prevent iOS Safari Pinch-Zoom
  const inputStyle = "w-full bg-void-light/5 border border-cobalt/30 rounded-lg px-4 py-3 sm:py-3.5 text-[16px] text-crisp-white focus:outline-none focus:border-signal-red transition-all placeholder:text-slate-light/30";
  const labelStyle = "block text-[10px] sm:text-xs font-bold text-slate-light/70 uppercase tracking-widest mb-1.5 sm:mb-2";

  return (
    <main className="min-h-screen bg-void-navy flex flex-col lg:flex-row text-crisp-white">
      
      {/* LEFT SIDE: Branding */}
      <div className="lg:w-1/3 xl:w-1/4 bg-void-navy border-b lg:border-b-0 lg:border-r border-cobalt/20 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div>
          <Link href="/" className="text-2xl sm:text-3xl font-black tracking-wider hover:opacity-80 transition block mb-12">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <div className="hidden sm:block space-y-10 border-l border-cobalt/20 ml-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`relative pl-8 transition-opacity duration-500 ${step === s ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${step === s ? 'bg-signal-red shadow-[0_0_10px_rgba(233,69,96,0.8)]' : 'bg-cobalt'}`} />
                <div className="text-[10px] font-bold text-signal-red uppercase mb-1">Phase 0{s}</div>
                <h3 className="font-bold text-sm">{s === 1 ? 'Identity' : s === 2 ? 'Location & NOK' : 'Financial Routing'}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-4 sm:p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-2xl w-full">
          
          <div className="mb-8 sm:mb-12 border-b border-cobalt/20 pb-6 sm:pb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase mb-2">Asset Owner Registry</h1>
            <p className="text-sm sm:text-base text-slate-light">Complete KYC profiling for portal access.</p>
          </div>

          {errorMsg && (
            <div className="bg-signal-red/10 border border-signal-red text-signal-red px-4 py-3 rounded-lg mb-8 text-sm font-medium flex gap-2">
              <XCircle size={18} /> {errorMsg}
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6 sm:space-y-8">
            
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleTextChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleTextChange} className={inputStyle} required />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>National Identity Number (NIN) *</label>
                  <input type="text" inputMode="numeric" name="nin" value={formData.nin} onChange={(e) => handleNumberOnlyChange(e, 11)} placeholder="11 Digits Only" className={inputStyle} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleTextChange} className={inputStyle} required />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/3">
                      <label className={labelStyle}>Code</label>
                      <input type="text" value={formData.phoneCountryCode} readOnly className={`${inputStyle} bg-void-navy text-slate-light cursor-not-allowed`} />
                    </div>
                    <div className="w-2/3">
                      <label className={labelStyle}>Phone No. *</label>
                      <input type="text" inputMode="numeric" name="phoneNumber" value={formData.phoneNumber} onChange={(e) => handleNumberOnlyChange(e, 15)} className={inputStyle} required />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Password *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleTextChange} className={inputStyle} required />
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-2 flex gap-1 h-1.5 w-full bg-void-light/20 rounded-full overflow-hidden">
                        {[1, 2, 3, 4, 5].map(level => (
                          <div key={level} className={`flex-1 ${passScore >= level ? (passScore > 3 ? 'bg-emerald-500' : 'bg-signal-red') : 'bg-transparent'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelStyle}>Confirm Password *</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleTextChange} className={inputStyle} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION & NOK */}
            {step === 2 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Country *</label>
                    <select value={formData.countryIso} onChange={handleCountryChange} className={`${inputStyle} appearance-none`} required>
                      {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>State / Province *</label>
                    <select name="state" value={formData.state} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                      <option value="">Select State...</option>
                      {availableStates.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Full Street Address *</label>
                  <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleTextChange} className={inputStyle} required />
                </div>
                
                <div className="pt-6 pb-2"><h4 className="text-base font-bold border-b border-cobalt/20 pb-3">Next of Kin (Succession)</h4></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>First Name *</label>
                    <input type="text" name="nokFirstName" value={formData.nokFirstName} onChange={handleTextChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>Last Name *</label>
                    <input type="text" name="nokLastName" value={formData.nokLastName} onChange={handleTextChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>Relationship *</label>
                    <select name="nokRelationship" value={formData.nokRelationship} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                      <option value="">Select...</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Phone Number *</label>
                    <input type="text" inputMode="numeric" name="nokPhone" value={formData.nokPhone} onChange={(e) => handleNumberOnlyChange(e, 15)} className={inputStyle} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: FINANCIAL & INTENT */}
            {step === 3 && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Bank Name *</label>
                    <select name="bankCode" value={formData.bankCode} onChange={(e) => {
                        const selectedBank = banks.find(b => b.code === e.target.value);
                        setFormData({ ...formData, bankCode: e.target.value, bankName: selectedBank?.name || "" });
                      }} className={`${inputStyle} appearance-none`} required>
                      <option value="">Select Bank...</option>
                      {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Account Number *</label>
                    <input type="text" inputMode="numeric" name="accountNumber" value={formData.accountNumber} onChange={(e) => handleNumberOnlyChange(e, 10)} placeholder="10 Digits" className={inputStyle} required />
                  </div>
                </div>

                {/* Live Account Verification Feedback */}
                <div className="h-12 flex items-center">
                  {isVerifyingBank && <p className="text-sm text-slate-light flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Resolving Account...</p>}
                  {bankError && <p className="text-sm text-signal-red flex items-center gap-2"><XCircle size={16} /> {bankError}</p>}
                  {verifiedAccountName && <p className="text-sm text-emerald-400 font-bold flex items-center gap-2"><CheckCircle2 size={16} /> Verified: {verifiedAccountName}</p>}
                </div>

                <div className="pt-2 pb-2"><h4 className="text-base font-bold border-b border-cobalt/20 pb-3">Administration Intent</h4></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Target Asset Class</label>
                    <select name="preferredAssetClass" value={formData.preferredAssetClass} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                      <option value="">Select...</option>
                      <option value="Tricycle">Tricycle (Keke)</option>
                      <option value="Uber Sedan">Uber/Bolt Sedan</option>
                      <option value="Mini-Bus">Mini-Bus (Korope)</option>
                      <option value="Tipper Truck">Tipper Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Intended Volume</label>
                    <select name="intendedVolume" value={formData.intendedVolume} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
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
                <button type="button" onClick={prevStep} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-light hover:text-crisp-white transition">
                  <ArrowLeft size={14} /> Back
                </button>
              ) : <div />}
              
              <button type="submit" disabled={isSubmitting || (step === 3 && (!verifiedAccountName || isVerifyingBank))} className="flex items-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing</> : <>{step === 3 ? "Submit Application" : "Proceed"} {step !== 3 && <ChevronRight size={16} />}</>}
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </main>
  );
}
