"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare } from "lucide-react";

interface AgreementProps {
  ownerName: string;
}

export default function VirtualAgreement({ ownerName }: AgreementProps) {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleAccept = async () => {
    setErrorMsg("");
    
    if (sigCanvas.current?.isEmpty()) {
      return setErrorMsg("Please provide your signature to proceed.");
    }
    if (!agreed) {
      return setErrorMsg("You must check the agreement box to proceed.");
    }

    setIsSubmitting(true);
    
    // Extract the signature as a base64 image string
    const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

    try {
      // We will build this API route next to handle the database update
      const res = await fetch("/api/owner/agreement/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureImage }),
      });

      if (!res.ok) throw new Error("Failed to process agreement.");
      
      // Refresh the page to trigger the ACTIVE dashboard state
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="bg-void-navy border-b border-cobalt/30 p-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider text-signal-red">Hire Purchase Administration Agreement</h2>
        <p className="text-slate-light text-sm mt-2">Asset Allocation Contract</p>
      </div>

      {/* Contract Body */}
      <div className="p-8 sm:p-12 space-y-6 text-sm text-slate-light leading-relaxed h-[400px] overflow-y-auto bg-void-navy/50">
        <p>
          This Agreement is made this <strong>{new Date().toLocaleDateString()}</strong> between <strong>YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD</strong> and <strong>{ownerName}</strong> (hereinafter referred to as "The Owner").
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">1. THE ASSET</h3>
        <p>
          The Owner has committed funds for the procurement and administration of One (1) Commercial Vehicle. 
          <br /><br />
          <strong>Asset Type:</strong> [Pending Admin Input]<br />
          <strong>Chassis No:</strong> [Pending Admin Input]<br />
          <strong>Vehicle Value:</strong> [Pending Admin Input]
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">2. REMITTANCE SCHEDULE</h3>
        <p>
          YUSDAAM AUTOS agrees to administer the asset and remit the agreed weekly sum to the Owner’s registered bank account every week for the agreed total duration. Upon completion of the tenure, the ownership of the asset transfers to the designated rider.
        </p>
        
        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">3. SUCCESSION</h3>
        <p>
          In the event of the Owner's incapacitation or death, all administrative rights and remittance instructions shall immediately transfer to the registered Next of Kin on file.
        </p>
      </div>

      {/* Signature Section */}
      <div className="p-8 border-t border-cobalt/30 bg-void-navy">
        {errorMsg && <p className="text-signal-red text-sm font-bold mb-4">{errorMsg}</p>}
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-light uppercase tracking-widest mb-3">
            <PenTool size={14} /> Draw Signature
          </label>
          <div className="bg-crisp-white rounded-lg border-2 border-cobalt/30 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="#001232"
              canvasProps={{ className: "w-full h-40 cursor-crosshair" }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={clearSignature} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Canvas</button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <input 
            type="checkbox" 
            className="mt-1 w-4 h-4 accent-signal-red cursor-pointer"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">
            I, {ownerName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.
          </span>
        </label>

        <button 
          onClick={handleAccept}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition disabled:opacity-50"
        >
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing Agreement</> : <><CheckSquare size={16} /> Sign & Accept Allocation</>}
        </button>
      </div>
    </div>
  );
}"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare } from "lucide-react";

interface AgreementProps {
  ownerName: string;
}

export default function VirtualAgreement({ ownerName }: AgreementProps) {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleAccept = async () => {
    setErrorMsg("");
    
    if (sigCanvas.current?.isEmpty()) {
      return setErrorMsg("Please provide your signature to proceed.");
    }
    if (!agreed) {
      return setErrorMsg("You must check the agreement box to proceed.");
    }

    setIsSubmitting(true);
    
    // Extract the signature as a base64 image string
    const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

    try {
      // We will build this API route next to handle the database update
      const res = await fetch("/api/owner/agreement/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureImage }),
      });

      if (!res.ok) throw new Error("Failed to process agreement.");
      
      // Refresh the page to trigger the ACTIVE dashboard state
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="bg-void-navy border-b border-cobalt/30 p-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider text-signal-red">Hire Purchase Administration Agreement</h2>
        <p className="text-slate-light text-sm mt-2">Asset Allocation Contract</p>
      </div>

      {/* Contract Body */}
      <div className="p-8 sm:p-12 space-y-6 text-sm text-slate-light leading-relaxed h-[400px] overflow-y-auto bg-void-navy/50">
        <p>
          This Agreement is made this <strong>{new Date().toLocaleDateString()}</strong> between <strong>YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD</strong> and <strong>{ownerName}</strong> (hereinafter referred to as "The Owner").
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">1. THE ASSET</h3>
        <p>
          The Owner has committed funds for the procurement and administration of One (1) Commercial Vehicle. 
          <br /><br />
          <strong>Asset Type:</strong> [Pending Admin Input]<br />
          <strong>Chassis No:</strong> [Pending Admin Input]<br />
          <strong>Vehicle Value:</strong> [Pending Admin Input]
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">2. REMITTANCE SCHEDULE</h3>
        <p>
          YUSDAAM AUTOS agrees to administer the asset and remit the agreed weekly sum to the Owner’s registered bank account every week for the agreed total duration. Upon completion of the tenure, the ownership of the asset transfers to the designated rider.
        </p>
        
        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">3. SUCCESSION</h3>
        <p>
          In the event of the Owner's incapacitation or death, all administrative rights and remittance instructions shall immediately transfer to the registered Next of Kin on file.
        </p>
      </div>

      {/* Signature Section */}
      <div className="p-8 border-t border-cobalt/30 bg-void-navy">
        {errorMsg && <p className="text-signal-red text-sm font-bold mb-4">{errorMsg}</p>}
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-light uppercase tracking-widest mb-3">
            <PenTool size={14} /> Draw Signature
          </label>
          <div className="bg-crisp-white rounded-lg border-2 border-cobalt/30 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="#001232"
              canvasProps={{ className: "w-full h-40 cursor-crosshair" }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={clearSignature} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Canvas</button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <input 
            type="checkbox" 
            className="mt-1 w-4 h-4 accent-signal-red cursor-pointer"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">
            I, {ownerName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.
          </span>
        </label>

        <button 
          onClick={handleAccept}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition disabled:opacity-50"
        >
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing Agreement</> : <><CheckSquare size={16} /> Sign & Accept Allocation</>}
        </button>
      </div>
    </div>
  );
}"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare } from "lucide-react";

interface AgreementProps {
  ownerName: string;
}

export default function VirtualAgreement({ ownerName }: AgreementProps) {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleAccept = async () => {
    setErrorMsg("");
    
    if (sigCanvas.current?.isEmpty()) {
      return setErrorMsg("Please provide your signature to proceed.");
    }
    if (!agreed) {
      return setErrorMsg("You must check the agreement box to proceed.");
    }

    setIsSubmitting(true);
    
    // Extract the signature as a base64 image string
    const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

    try {
      // We will build this API route next to handle the database update
      const res = await fetch("/api/owner/agreement/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureImage }),
      });

      if (!res.ok) throw new Error("Failed to process agreement.");
      
      // Refresh the page to trigger the ACTIVE dashboard state
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="bg-void-navy border-b border-cobalt/30 p-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider text-signal-red">Hire Purchase Administration Agreement</h2>
        <p className="text-slate-light text-sm mt-2">Asset Allocation Contract</p>
      </div>

      {/* Contract Body */}
      <div className="p-8 sm:p-12 space-y-6 text-sm text-slate-light leading-relaxed h-[400px] overflow-y-auto bg-void-navy/50">
        <p>
          This Agreement is made this <strong>{new Date().toLocaleDateString()}</strong> between <strong>YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD</strong> and <strong>{ownerName}</strong> (hereinafter referred to as "The Owner").
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">1. THE ASSET</h3>
        <p>
          The Owner has committed funds for the procurement and administration of One (1) Commercial Vehicle. 
          <br /><br />
          <strong>Asset Type:</strong> [Pending Admin Input]<br />
          <strong>Chassis No:</strong> [Pending Admin Input]<br />
          <strong>Vehicle Value:</strong> [Pending Admin Input]
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">2. REMITTANCE SCHEDULE</h3>
        <p>
          YUSDAAM AUTOS agrees to administer the asset and remit the agreed weekly sum to the Owner’s registered bank account every week for the agreed total duration. Upon completion of the tenure, the ownership of the asset transfers to the designated rider.
        </p>
        
        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">3. SUCCESSION</h3>
        <p>
          In the event of the Owner's incapacitation or death, all administrative rights and remittance instructions shall immediately transfer to the registered Next of Kin on file.
        </p>
      </div>

      {/* Signature Section */}
      <div className="p-8 border-t border-cobalt/30 bg-void-navy">
        {errorMsg && <p className="text-signal-red text-sm font-bold mb-4">{errorMsg}</p>}
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-light uppercase tracking-widest mb-3">
            <PenTool size={14} /> Draw Signature
          </label>
          <div className="bg-crisp-white rounded-lg border-2 border-cobalt/30 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="#001232"
              canvasProps={{ className: "w-full h-40 cursor-crosshair" }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={clearSignature} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Canvas</button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <input 
            type="checkbox" 
            className="mt-1 w-4 h-4 accent-signal-red cursor-pointer"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">
            I, {ownerName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.
          </span>
        </label>

        <button 
          onClick={handleAccept}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition disabled:opacity-50"
        >
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing Agreement</> : <><CheckSquare size={16} /> Sign & Accept Allocation</>}
        </button>
      </div>
    </div>
  );
}"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare } from "lucide-react";

interface AgreementProps {
  ownerName: string;
}

export default function VirtualAgreement({ ownerName }: AgreementProps) {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleAccept = async () => {
    setErrorMsg("");
    
    if (sigCanvas.current?.isEmpty()) {
      return setErrorMsg("Please provide your signature to proceed.");
    }
    if (!agreed) {
      return setErrorMsg("You must check the agreement box to proceed.");
    }

    setIsSubmitting(true);
    
    // Extract the signature as a base64 image string
    const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

    try {
      // We will build this API route next to handle the database update
      const res = await fetch("/api/owner/agreement/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureImage }),
      });

      if (!res.ok) throw new Error("Failed to process agreement.");
      
      // Refresh the page to trigger the ACTIVE dashboard state
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="bg-void-navy border-b border-cobalt/30 p-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider text-signal-red">Hire Purchase Administration Agreement</h2>
        <p className="text-slate-light text-sm mt-2">Asset Allocation Contract</p>
      </div>

      {/* Contract Body */}
      <div className="p-8 sm:p-12 space-y-6 text-sm text-slate-light leading-relaxed h-[400px] overflow-y-auto bg-void-navy/50">
        <p>
          This Agreement is made this <strong>{new Date().toLocaleDateString()}</strong> between <strong>YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD</strong> and <strong>{ownerName}</strong> (hereinafter referred to as "The Owner").
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">1. THE ASSET</h3>
        <p>
          The Owner has committed funds for the procurement and administration of One (1) Commercial Vehicle. 
          <br /><br />
          <strong>Asset Type:</strong> [Pending Admin Input]<br />
          <strong>Chassis No:</strong> [Pending Admin Input]<br />
          <strong>Vehicle Value:</strong> [Pending Admin Input]
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">2. REMITTANCE SCHEDULE</h3>
        <p>
          YUSDAAM AUTOS agrees to administer the asset and remit the agreed weekly sum to the Owner’s registered bank account every week for the agreed total duration. Upon completion of the tenure, the ownership of the asset transfers to the designated rider.
        </p>
        
        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">3. SUCCESSION</h3>
        <p>
          In the event of the Owner's incapacitation or death, all administrative rights and remittance instructions shall immediately transfer to the registered Next of Kin on file.
        </p>
      </div>

      {/* Signature Section */}
      <div className="p-8 border-t border-cobalt/30 bg-void-navy">
        {errorMsg && <p className="text-signal-red text-sm font-bold mb-4">{errorMsg}</p>}
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-light uppercase tracking-widest mb-3">
            <PenTool size={14} /> Draw Signature
          </label>
          <div className="bg-crisp-white rounded-lg border-2 border-cobalt/30 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="#001232"
              canvasProps={{ className: "w-full h-40 cursor-crosshair" }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={clearSignature} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Canvas</button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <input 
            type="checkbox" 
            className="mt-1 w-4 h-4 accent-signal-red cursor-pointer"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">
            I, {ownerName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.
          </span>
        </label>

        <button 
          onClick={handleAccept}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition disabled:opacity-50"
        >
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing Agreement</> : <><CheckSquare size={16} /> Sign & Accept Allocation</>}
        </button>
      </div>
    </div>
  );
}"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare } from "lucide-react";

interface AgreementProps {
  ownerName: string;
}

export default function VirtualAgreement({ ownerName }: AgreementProps) {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleAccept = async () => {
    setErrorMsg("");
    
    if (sigCanvas.current?.isEmpty()) {
      return setErrorMsg("Please provide your signature to proceed.");
    }
    if (!agreed) {
      return setErrorMsg("You must check the agreement box to proceed.");
    }

    setIsSubmitting(true);
    
    // Extract the signature as a base64 image string
    const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

    try {
      // We will build this API route next to handle the database update
      const res = await fetch("/api/owner/agreement/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureImage }),
      });

      if (!res.ok) throw new Error("Failed to process agreement.");
      
      // Refresh the page to trigger the ACTIVE dashboard state
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="bg-void-navy border-b border-cobalt/30 p-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider text-signal-red">Hire Purchase Administration Agreement</h2>
        <p className="text-slate-light text-sm mt-2">Asset Allocation Contract</p>
      </div>

      {/* Contract Body */}
      <div className="p-8 sm:p-12 space-y-6 text-sm text-slate-light leading-relaxed h-[400px] overflow-y-auto bg-void-navy/50">
        <p>
          This Agreement is made this <strong>{new Date().toLocaleDateString()}</strong> between <strong>YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD</strong> and <strong>{ownerName}</strong> (hereinafter referred to as "The Owner").
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">1. THE ASSET</h3>
        <p>
          The Owner has committed funds for the procurement and administration of One (1) Commercial Vehicle. 
          <br /><br />
          <strong>Asset Type:</strong> [Pending Admin Input]<br />
          <strong>Chassis No:</strong> [Pending Admin Input]<br />
          <strong>Vehicle Value:</strong> [Pending Admin Input]
        </p>

        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">2. REMITTANCE SCHEDULE</h3>
        <p>
          YUSDAAM AUTOS agrees to administer the asset and remit the agreed weekly sum to the Owner’s registered bank account every week for the agreed total duration. Upon completion of the tenure, the ownership of the asset transfers to the designated rider.
        </p>
        
        <h3 className="font-bold text-crisp-white text-base mt-6 border-b border-cobalt/20 pb-2">3. SUCCESSION</h3>
        <p>
          In the event of the Owner's incapacitation or death, all administrative rights and remittance instructions shall immediately transfer to the registered Next of Kin on file.
        </p>
      </div>

      {/* Signature Section */}
      <div className="p-8 border-t border-cobalt/30 bg-void-navy">
        {errorMsg && <p className="text-signal-red text-sm font-bold mb-4">{errorMsg}</p>}
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-light uppercase tracking-widest mb-3">
            <PenTool size={14} /> Draw Signature
          </label>
          <div className="bg-crisp-white rounded-lg border-2 border-cobalt/30 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="#001232"
              canvasProps={{ className: "w-full h-40 cursor-crosshair" }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={clearSignature} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Canvas</button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <input 
            type="checkbox" 
            className="mt-1 w-4 h-4 accent-signal-red cursor-pointer"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">
            I, {ownerName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.
          </span>
        </label>

        <button 
          onClick={handleAccept}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition disabled:opacity-50"
        >
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing Agreement</> : <><CheckSquare size={16} /> Sign & Accept Allocation</>}
        </button>
      </div>
    </div>
  );
}
