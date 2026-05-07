"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, XCircle, UploadCloud, AlertTriangle, Scale } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

export default function GuarantorExecutionPage() {
  const params = useParams();
  const topRef = useRef<HTMLDivElement>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [guarantorData, setGuarantorData] = useState<any>(null);
  const [riderData, setRiderData] = useState<any>(null);

  const [step, setStep] = useState(0); // 0 = Intro, 1 = Traceability, 2 = Capacity, 3 = The Trap
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Contract Checkboxes
  const [checkLiability, setCheckLiability] = useState(false);
  const [checkLawEnforcement, setCheckLawEnforcement] = useState(false);
  const [checkDigitalExecution, setCheckDigitalExecution] = useState(false);

  const passportRef = useRef<HTMLInputElement>(null);
  const utilityRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: "", altPhone: "", nin: "", address: "", residentialStatus: "",
    employmentStatus: "", employerName: "", officeAddress: "",
    passportBase64: "", passportName: "",
    utilityBillBase64: "", utilityBillName: "",
  });

  // Prevent iOS Safari auto-zoom
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  // Fetch initial link data
  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        const res = await fetch(`/api/guarantor/${params.token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setGuarantorData(data.guarantor);
        setRiderData(data.guarantor.rider);
      } catch (err: any) {
        setLoadError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.token) fetchLinkData();
  }, [params.token]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumberOnlyChange = (e: React.ChangeEvent<HTMLInputElement>, maxLength: number) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setFormData({ ...formData, [e.target.name]: numericValue });
  };

  const handleFileConvert = (e: React.ChangeEvent<HTMLInputElement>, fieldPrefix: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1]; 
        setFormData(prev => ({
          ...prev, 
          [`${fieldPrefix}Base64`]: base64Data,
          [`${fieldPrefix}Name`]: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: 'smooth' });
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextStep = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.nin || !formData.address || !formData.residentialStatus) return setErrorMsg("Please complete all required traceability fields.");
      if (formData.nin.length !== 11) return setErrorMsg("NIN must be exactly 11 digits.");
      if (!formData.passportBase64 || !formData.utilityBillBase64) return setErrorMsg("Both Passport and Utility Bill uploads are required.");
    }
    if (step === 2) {
      if (!formData.employmentStatus || !formData.employerName || !formData.officeAddress) return setErrorMsg("Please complete all occupational fields.");
    }
    setStep(step + 1);
    scrollToTop();
  };

  const prevStep = () => {
    setStep(step - 1);
    scrollToTop();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!checkLiability || !checkLawEnforcement || !checkDigitalExecution) {
      return setErrorMsg("You must explicitly consent to all legal declarations.");
    }

    if (sigCanvas.current?.isEmpty()) {
      return setErrorMsg("You must provide your digital signature to execute this deed.");
    }

    setIsSubmitting(true);
    try {
      // Extract signature without the prefix
      const signatureDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
      const signatureBase64 = signatureDataUrl?.split(',')[1];

      const payload = { ...formData, signatureBase64 };

      const res = await fetch(`/api/guarantor/${params.token}`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      
      scrollToTop();
      setSuccess(true);
    } catch (err: any) { 
      setErrorMsg(err.message); 
      scrollToTop();
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (isLoading) {
    return <main className="min-h-screen bg-void-navy flex items-center justify-center text-crisp-white"><Loader2 size={48} className="animate-spin text-cobalt" /></main>;
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-void-navy flex items-center justify-center p-4 text-crisp-white">
        <div className="max-w-lg w-full bg-void-light/5 border border-signal-red/30 p-12 rounded-2xl text-center shadow-2xl">
          <XCircle className="w-16 h-16 text-signal-red mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 uppercase tracking-wider text-signal-red">Access Denied</h2>
          <p className="text-slate-light leading-relaxed mb-8">{loadError}</p>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-void-navy flex items-center justify-center p-4 text-crisp-white">
        <div className="max-w-lg w-full bg-void-light/5 border border-emerald-500/30 p-12 rounded-2xl text-center shadow-2xl">
          <Scale className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 uppercase tracking-wider">Deed Executed</h2>
          <p className="text-slate-light leading-relaxed mb-8">
            You have successfully completed your legal attestation. Your digital signature and submitted documents have been permanently secured in our legal vault. We will notify the rider.
          </p>
          <p className="text-[10px] font-mono text-slate-light/50 uppercase tracking-widest">You may safely close this window.</p>
        </div>
      </main>
    );
  }

  const inputStyle = "w-full bg-void-light/5 border border-cobalt/30 rounded-lg px-4 py-3.5 text-base text-crisp-white focus:outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/40 transition-all placeholder:text-slate-light/40";
  const labelStyle = "flex items-center text-[10px] sm:text-xs font-bold text-slate-light/70 uppercase tracking-widest mb-1.5 sm:mb-2";

  return (
    <main className="min-h-screen bg-void-navy text-crisp-white flex justify-center py-8 sm:py-16 px-4 relative overflow-y-auto">
      <div ref={topRef} className="absolute top-0 left-0 w-full h-1" />
      
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider block mb-2">YUSDAAM<span className="text-signal-red">.</span></h1>
          <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest">Guarantor Administration Portal</p>
        </div>

        <div className="bg-void-navy border border-cobalt/30 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-void-dark/80 p-6 border-b border-cobalt/30 text-center">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-2">Deed of Guarantee</h2>
            <p className="text-sm text-slate-light">Nominated by <strong className="text-crisp-white">{riderData.firstName} {riderData.lastName}</strong></p>
          </div>

          <div className="p-6 sm:p-10">
            {errorMsg && (
              <div className="bg-signal-red/10 border border-signal-red text-signal-red px-4 py-3 rounded-lg mb-8 text-sm font-medium flex gap-2 items-start animate-in fade-in slide-in-from-top-2">
                <XCircle size={18} className="shrink-0 mt-0.5" /> <p>{errorMsg}</p>
              </div>
            )}

            {/* STEP 0: INTRO */}
            {step === 0 && (
              <div className="space-y-6 animate-in fade-in duration-500 text-center">
                <Scale size={48} className="text-signal-red mx-auto mb-6" />
                <h3 className="text-xl font-bold uppercase tracking-wider text-signal-red">Legal Liability Warning</h3>
                <p className="text-sm text-slate-light leading-relaxed max-w-lg mx-auto">
                  You have been nominated by <strong>{riderData.firstName} {riderData.lastName}</strong> to act as a Primary Guarantor for the commercial deployment of a <strong>{riderData.preferredAssetClass.replace("_", " ")}</strong>. 
                </p>
                <div className="bg-signal-red/10 border border-signal-red/30 p-5 rounded-xl max-w-lg mx-auto text-left">
                  <p className="text-xs text-slate-light leading-relaxed font-bold">
                    By proceeding, you understand that you are stepping in as the ultimate financial security for an asset worth millions of Naira. If the rider absconds, damages the asset, or defaults on payment, you will be held legally and financially accountable.
                  </p>
                </div>
                <div className="pt-8">
                  <button onClick={() => { setStep(1); scrollToTop(); }} className="px-8 py-4 bg-signal-red hover:bg-signal-red/90 text-crisp-white font-bold uppercase tracking-wider rounded-xl transition">
                    Acknowledge & Proceed
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              
              {/* STEP 1: TRACEABILITY */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="text-lg font-bold border-b border-cobalt/20 pb-2 mb-4 uppercase tracking-wider">Part 1: Personal Traceability</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className={labelStyle}>Email Address</label><input type="email" name="email" value={formData.email} onChange={handleTextChange} className={inputStyle} /></div>
                    <div><label className={labelStyle}>Alternate Phone No.</label><input type="text" inputMode="numeric" name="altPhone" value={formData.altPhone} onChange={(e) => handleNumberOnlyChange(e, 11)} className={inputStyle} placeholder="Optional" /></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelStyle}>Your NIN *</label>
                      <input type="text" inputMode="numeric" name="nin" value={formData.nin} onChange={(e) => handleNumberOnlyChange(e, 11)} className={inputStyle} placeholder="Strictly 11 Digits" required />
                    </div>
                    <div>
                      <label className={labelStyle}>Residential Status *</label>
                      <select name="residentialStatus" value={formData.residentialStatus} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="Landlord/Owner" className="bg-void-navy">Landlord / Owner</option>
                        <option value="Renting (Alone)" className="bg-void-navy">Renting (Alone)</option>
                        <option value="Living with Family" className="bg-void-navy">Living with Family</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Full Residential Address *</label>
                    <input type="text" name="address" value={formData.address} onChange={handleTextChange} className={inputStyle} placeholder="House Number, Street, City, State" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className={labelStyle}>Upload Passport *</label>
                      <input type="file" accept="image/*" className="hidden" ref={passportRef} onChange={(e) => handleFileConvert(e, "passport")} />
                      <div onClick={() => passportRef.current?.click()} className={`w-full h-20 border-2 ${formData.passportBase64 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red'} rounded-xl flex items-center justify-center transition-all cursor-pointer`}>
                        {formData.passportBase64 ? <span className="text-xs font-bold text-emerald-400">Attached: {formData.passportName}</span> : <span className="text-xs font-bold text-slate-light flex items-center gap-2"><UploadCloud size={16}/> Select Image</span>}
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>Upload Utility Bill *</label>
                      <input type="file" accept="image/*,application/pdf" className="hidden" ref={utilityRef} onChange={(e) => handleFileConvert(e, "utilityBill")} />
                      <div onClick={() => utilityRef.current?.click()} className={`w-full h-20 border-2 ${formData.utilityBillBase64 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red'} rounded-xl flex items-center justify-center transition-all cursor-pointer`}>
                        {formData.utilityBillBase64 ? <span className="text-xs font-bold text-emerald-400 truncate px-2">Attached: {formData.utilityBillName}</span> : <span className="text-xs font-bold text-slate-light flex items-center gap-2"><UploadCloud size={16}/> Select Document</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CAPACITY */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="text-lg font-bold border-b border-cobalt/20 pb-2 mb-4 uppercase tracking-wider">Part 2: Occupational Capacity</h3>
                  
                  <div>
                    <label className={labelStyle}>Employment Status *</label>
                    <select name="employmentStatus" value={formData.employmentStatus} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                      <option value="" className="bg-void-navy">Select...</option>
                      <option value="Employed (Corporate)" className="bg-void-navy">Employed (Corporate / Private Sector)</option>
                      <option value="Civil Servant" className="bg-void-navy">Civil Servant</option>
                      <option value="Business Owner" className="bg-void-navy">Business Owner / Entrepreneur</option>
                      <option value="Self-Employed" className="bg-void-navy">Self-Employed / Freelance</option>
                      <option value="Retired" className="bg-void-navy">Retired</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Employer / Business Name *</label>
                    <input type="text" name="employerName" value={formData.employerName} onChange={handleTextChange} className={inputStyle} placeholder="Where do you work or what is your business called?" required />
                  </div>

                  <div>
                    <label className={labelStyle}>Office / Business Address *</label>
                    <input type="text" name="officeAddress" value={formData.officeAddress} onChange={handleTextChange} className={inputStyle} placeholder="Full address of your workplace or business" required />
                  </div>
                </div>
              )}

              {/* STEP 3: THE TRAP (LEGAL ATTESTATION) */}
              {step === 3 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 border-b border-signal-red/30 pb-4">
                    <Scale size={28} className="text-signal-red" />
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-wider text-signal-red">Sworn Guarantor Attestation</h3>
                      <p className="text-xs text-slate-light font-bold">Please read carefully. By checking these boxes, you enter a legally binding commitment.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-4 p-4 border border-cobalt/30 rounded-xl bg-void-dark hover:bg-void-light/5 transition cursor-pointer">
                      <input type="checkbox" checked={checkLiability} onChange={(e) => setCheckLiability(e.target.checked)} className="mt-1 w-5 h-5 accent-signal-red" />
                      <div className="text-sm text-slate-light leading-relaxed">
                        <strong className="text-crisp-white block mb-1">Unconditional Assumption of Liability</strong>
                        I acknowledge that the aforementioned rider is being entrusted with a commercial transport asset by YUSDAAM Autos. I hereby unconditionally accept primary financial and legal responsibility. Should the rider abscond, commit theft, cause malicious damage, or default, I agree to indemnify YUSDAAM Autos and be held fully liable for the outstanding Total Hire Purchase Price.
                      </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 border border-cobalt/30 rounded-xl bg-void-dark hover:bg-void-light/5 transition cursor-pointer">
                      <input type="checkbox" checked={checkLawEnforcement} onChange={(e) => setCheckLawEnforcement(e.target.checked)} className="mt-1 w-5 h-5 accent-signal-red" />
                      <div className="text-sm text-slate-light leading-relaxed">
                        <strong className="text-crisp-white block mb-1">Law Enforcement & Credit Bureau Consent</strong>
                        I explicitly authorize YUSDAAM Autos and its recovery agents to engage the Nigerian Police Force, the NFIU, and National Credit Bureaus to recover any financial losses directly from me, my accounts, or my estate should I fail to produce the rider or the asset upon demand.
                      </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 border border-signal-red/50 rounded-xl bg-signal-red/5 transition cursor-pointer">
                      <input type="checkbox" checked={checkDigitalExecution} onChange={(e) => setCheckDigitalExecution(e.target.checked)} className="mt-1 w-5 h-5 accent-signal-red" />
                      <div className="text-sm text-slate-light leading-relaxed">
                        <strong className="text-signal-red uppercase tracking-widest block mb-1">Digital Execution Consent</strong>
                        I fully understand and agree that by checking this box and affixing my digital signature below, I am legally executing this document. In accordance with the Nigerian Evidence Act 2011, I acknowledge that this electronic signature carries the exact same legal weight, validity, and binding authority as my physical, handwritten signature on a paper deed.
                      </div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <label className="block text-xs font-bold text-signal-red uppercase tracking-widest mb-3">Draw Your Signature Below *</label>
                    <div className="border border-signal-red/60 rounded-xl bg-crisp-white overflow-hidden shadow-[0_0_15px_rgba(233,69,96,0.15)]">
                      <SignatureCanvas 
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{ className: "w-full h-40 cursor-crosshair" }}
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button type="button" onClick={() => sigCanvas.current?.clear()} className="text-[10px] font-bold uppercase tracking-widest text-slate-light hover:text-crisp-white transition">
                        Clear Canvas
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM CONTROLS */}
              {step > 0 && (
                <div className="pt-8 flex items-center justify-between mt-8 border-t border-cobalt/20">
                  <button type="button" onClick={prevStep} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-light hover:text-crisp-white transition">
                    <ArrowLeft size={14} /> Back
                  </button>
                  
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50">
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Executing...</> : <>{step === 3 ? "Execute Deed" : "Proceed"} {step !== 3 && <ChevronRight size={16} />}</>}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
