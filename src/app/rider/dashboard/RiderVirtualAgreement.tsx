"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ShieldCheck, Loader2, XCircle, AlertTriangle } from "lucide-react";

export default function RiderVirtualAgreement({ rider, vehicle, contract, guarantors }: { rider: any, vehicle: any, contract: any, guarantors: any[] }) {
  const router = useRouter();
  const agreementRef = useRef<HTMLDivElement>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handover Note State
  const [handoverData, setHandoverData] = useState({
    fuelLevel: "Empty",
    acStatus: "N/A",
    keys: false,
    spareTire: false,
    jack: false,
    cCaution: false,
    extinguisher: false,
    documents: false,
  });

  const handleCheckbox = (field: string) => {
    setHandoverData(prev => ({ ...prev, [field]: !(prev as any)[field] }));
  };

  const handleSign = async () => {
    setErrorMsg("");
    if (sigCanvas.current?.isEmpty()) {
      return setErrorMsg("You must provide your digital signature to proceed.");
    }

    setIsSubmitting(true);
    try {
      // 1. Generate PDF
      const element = agreementRef.current;
      if (!element) throw new Error("Document reference not found");

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      // 2. Send to API
      const res = await fetch("/api/rider/sign-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64 })
      });

      if (!res.ok) throw new Error("Failed to save agreement");

      router.refresh(); // This will reload the dashboard and remove the modal since status is now ACTIVE
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  const g1 = guarantors[0];
  const g2 = guarantors[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy/90 backdrop-blur-sm p-4 sm:p-8">
      <div className="bg-void-dark w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-signal-red/30 overflow-hidden">
        
        {/* Header */}
        <div className="bg-signal-red/10 p-6 border-b border-signal-red/30 flex items-center gap-4 shrink-0">
          <ShieldCheck size={32} className="text-signal-red" />
          <div>
            <h2 className="text-xl font-black text-signal-red uppercase tracking-wider">Pending Legal Execution</h2>
            <p className="text-xs text-slate-light font-bold">Fleet allocation confirmed. Please review, complete the handover note, and sign.</p>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-crisp-white text-void-navy relative">
          
          {errorMsg && (
            <div className="sticky top-0 z-10 bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-bold flex items-center gap-2 shadow-lg">
              <XCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* The Document to be PDF'd */}
          <div ref={agreementRef} className="space-y-8 font-serif bg-crisp-white p-4">
            
            <div className="text-center border-b-2 border-void-navy pb-6">
              <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Hire Purchase Agreement</h1>
              <p className="text-sm font-bold uppercase tracking-widest">Yusdaam Autos Fleet Administrators Nigeria Limited</p>
              <p className="text-xs mt-2">Executed on: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <p><strong>BETWEEN</strong><br/>
              <strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong> (RC: 9335611), having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos (hereinafter referred to as the <strong>“Administrator”</strong>);</p>
              
              <p><strong>AND</strong><br/>
              <strong>{rider.firstName} {rider.lastName}</strong>, NIN: {rider.nin}, residing at {rider.streetAddress}, Phone: {rider.phoneNumber} (hereinafter referred to as the <strong>“Rider”</strong>);</p>
              
              <p><strong>AND</strong><br/>
              <strong>THE GUARANTORS</strong>, whose names and details are expressly set out in Clause 9 of this Agreement, having already executed their sworn attestations digitally.</p>

              <h3 className="font-bold text-base mt-6 border-b border-void-navy/20 pb-1">1. THE ASSET</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Asset Type:</strong> {vehicle?.type}</li>
                <li><strong>Make/Model:</strong> {vehicle?.makeModel || "Assigned Fleet Vehicle"}</li>
                <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber}</li>
              </ul>

              <h3 className="font-bold text-base mt-6 border-b border-void-navy/20 pb-1">2. FINANCIAL TERMS</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Total Hire Purchase Price:</strong> ₦{contract?.totalPrice?.toLocaleString() || "---"}</li>
                <li><strong>Weekly Remittance:</strong> ₦{contract?.weeklyRemittance?.toLocaleString() || "---"}</li>
                <li><strong>Tenure:</strong> {contract?.agreedDurationMonths} Months</li>
              </ul>

              <h3 className="font-bold text-base mt-6 border-b border-void-navy/20 pb-1">3. RIDER’S OBLIGATIONS & REPOSSESSION</h3>
              <p>The Rider assumes <strong>100% financial and operational risk</strong>. The Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance, and breakdowns. The Administrator reserves the right to forcefully repossess the Asset without prior court order if the Rider defaults on the Weekly Remittance, tampers with the GPS tracker, or uses the Asset for illegal activity.</p>

              <h3 className="font-bold text-base mt-6 border-b border-void-navy/20 pb-1">9. GUARANTORS' EXECUTION</h3>
              <div className="p-4 bg-void-light/5 border border-void-light/20 rounded">
                <p className="mb-4 text-xs font-bold text-signal-red uppercase">Note: The Guarantors listed below have already executed their Sworn Guarantor Attestations digitally. Their IP addresses, identity details, and digital signatures are permanently attached to this Agreement and held in the Administrator’s legal vault.</p>
                
                <p><strong>Primary Guarantor:</strong> {g1?.firstName} {g1?.lastName} <br/>
                <strong>NIN:</strong> {g1?.nin} | <strong>Phone:</strong> {g1?.phone} <br/>
                <strong>Status:</strong> Digitally Signed on {new Date(g1?.signedAt).toLocaleDateString()}</p>
                
                <p className="mt-4"><strong>Secondary Guarantor:</strong> {g2?.firstName} {g2?.lastName} <br/>
                <strong>NIN:</strong> {g2?.nin} | <strong>Phone:</strong> {g2?.phone} <br/>
                <strong>Status:</strong> Digitally Signed on {new Date(g2?.signedAt).toLocaleDateString()}</p>
              </div>

              {/* --- VEHICLE HANDOVER NOTE --- */}
              <div className="mt-12 border-t-2 border-void-navy pt-6 break-inside-avoid">
                <h2 className="text-xl font-black uppercase tracking-widest text-center mb-6">Vehicle Handover & Condition Note</h2>
                
                <div className="space-y-6">
                  <div>
                    <p className="font-bold mb-2">1. Fuel Level at Handover</p>
                    <div className="flex gap-4">
                      {["Empty", "Quarter", "Half", "Full"].map(level => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="fuel" checked={handoverData.fuelLevel === level} onChange={() => setHandoverData({...handoverData, fuelLevel: level})} className="accent-signal-red" /> {level}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold mb-2">2. Air Conditioning (Select N/A for Keke/Korope)</p>
                    <div className="flex gap-4">
                      {["Working", "Not Working", "N/A"].map(status => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="ac" checked={handoverData.acStatus === status} onChange={() => setHandoverData({...handoverData, acStatus: status})} className="accent-signal-red" /> {status}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold mb-2">3. Accessories & Tools Received (Check if received)</p>
                    <div className="grid grid-cols-2 gap-3 bg-void-light/5 p-4 rounded border border-void-light/20">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.keys} onChange={() => handleCheckbox("keys")} className="w-4 h-4 accent-signal-red" /> Vehicle Keys</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.spareTire} onChange={() => handleCheckbox("spareTire")} className="w-4 h-4 accent-signal-red" /> Spare Tire (Uncheck for Keke)</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.jack} onChange={() => handleCheckbox("jack")} className="w-4 h-4 accent-signal-red" /> Car Jack & Spanner</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.cCaution} onChange={() => handleCheckbox("cCaution")} className="w-4 h-4 accent-signal-red" /> C-Caution Triangle</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.extinguisher} onChange={() => handleCheckbox("extinguisher")} className="w-4 h-4 accent-signal-red" /> Fire Extinguisher</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.documents} onChange={() => handleCheckbox("documents")} className="w-4 h-4 accent-signal-red" /> Original Particulars/Copies</label>
                    </div>
                  </div>

                  <div className="p-4 bg-signal-red/10 text-signal-red font-bold text-xs uppercase tracking-widest rounded border border-signal-red/30">
                    <AlertTriangle size={16} className="inline mb-1 mr-1" />
                    GPS Tracker installed, tested, and confirmed active by Administrator.
                  </div>
                </div>
              </div>

              {/* RIDER SIGNATURE BLOCK */}
              <div className="mt-8 pt-6 border-t border-void-navy/20 break-inside-avoid">
                <p className="font-bold mb-4">I, {rider.firstName} {rider.lastName}, hereby confirm that I have physically inspected the vehicle. I acknowledge that I am receiving the vehicle and the checked accessories in the exact condition stated in this document, and agree to be bound by the Hire Purchase terms.</p>
                <label className="block text-xs font-bold text-signal-red uppercase tracking-widest mb-2">Draw Your Signature Below *</label>
                <div className="border-2 border-void-navy/40 rounded-lg overflow-hidden w-full sm:w-96 bg-void-light/5">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ className: "w-full h-32 cursor-crosshair" }}
                  />
                </div>
                <button type="button" onClick={() => sigCanvas.current?.clear()} className="text-[10px] font-bold uppercase tracking-widest text-signal-red mt-2 hover:underline">
                  Clear Signature
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-void-dark p-6 border-t border-signal-red/30 flex justify-end shrink-0">
          <button 
            onClick={handleSign}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-4 bg-signal-red text-crisp-white font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Securing Document...</> : "Sign & Accept Vehicle"}
          </button>
        </div>

      </div>
    </div>
  );
}
