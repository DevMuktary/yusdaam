"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ShieldCheck, Loader2, XCircle, AlertTriangle, Download } from "lucide-react";

export default function RiderVirtualAgreement({ rider, vehicle, contract, guarantors }: { rider: any, vehicle: any, contract: any, guarantors: any[] }) {
  const router = useRouter();
  const agreementRef = useRef<HTMLDivElement>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const generatePDF = async () => {
    const element = agreementRef.current;
    if (!element) throw new Error("Document reference not found");

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // If the document is longer than one A4 page, it will span down. 
    // For a single continuous scroll, we just draw it on a long page or let it scale.
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    
    return pdf;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const pdf = await generatePDF();
      pdf.save(`YUSDAAM_HPA_${rider.firstName}_${rider.lastName}.pdf`);
    } catch (err: any) {
      setErrorMsg("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSign = async () => {
    setErrorMsg("");
    if (sigCanvas.current?.isEmpty()) {
      return setErrorMsg("You must provide your digital signature to proceed.");
    }

    setIsSubmitting(true);
    try {
      const pdf = await generatePDF();
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      const res = await fetch("/api/rider/sign-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64 })
      });

      if (!res.ok) throw new Error("Failed to save agreement");

      router.refresh(); 
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  const g1 = guarantors[0];
  const g2 = guarantors[1];

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy/90 backdrop-blur-sm p-4 sm:p-8">
      <div className="bg-void-dark w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-signal-red/30 overflow-hidden">
        
        {/* Header with Download Button */}
        <div className="bg-signal-red/10 p-4 sm:p-6 border-b border-signal-red/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <ShieldCheck size={32} className="text-signal-red shrink-0" />
            <div>
              <h2 className="text-xl font-black text-signal-red uppercase tracking-wider">Pending Legal Execution</h2>
              <p className="text-xs text-slate-light font-bold">Fleet allocation confirmed. Please review the full agreement below.</p>
            </div>
          </div>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-void-light/10 hover:bg-void-light/20 border border-cobalt/30 text-crisp-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
          >
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PDF
          </button>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-crisp-white text-black relative">
          
          {errorMsg && (
            <div className="sticky top-0 z-10 bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-bold flex items-center gap-2 shadow-lg">
              <XCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* THE EXACT LEGAL DOCUMENT TO BE PDF'd */}
          <div ref={agreementRef} className="bg-crisp-white p-4 sm:p-8 font-serif text-sm leading-relaxed max-w-4xl mx-auto">
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black uppercase underline mb-2">RIDER/DRIVER HIRE PURCHASE AGREEMENT</h1>
            </div>

            <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDate}</strong>.</p>
            
            <p className="mb-4"><strong>BETWEEN</strong></p>
            <p className="mb-4"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>, acting as the lawful Attorney for the Asset Owner), of the first part;</p>
            
            <p className="mb-4"><strong>AND</strong></p>
            <p className="mb-4"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: <strong>{rider?.nin}</strong>, residing at <strong>{rider?.streetAddress}</strong>, Email: <strong>{rider?.email || "N/A"}</strong>, Phone: <strong>{rider?.phoneNumber}</strong> (hereinafter referred to as the <strong>“Rider”</strong> or <strong>"Driver"</strong>), of the second part;</p>
            
            <p className="mb-4"><strong>AND</strong></p>
            <p className="mb-8"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 9 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

            <h3 className="text-lg font-bold underline mb-2">RECITALS</h3>
            <p className="mb-1"><strong>WHEREAS:</strong></p>
            <ol className="list-[upper-alpha] pl-8 mb-8 space-y-2">
              <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
              <li>The Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
              <li>The Guarantors have agreed to stand as full financial and legal sureties for the Rider, guaranteeing the Rider’s performance, payments, and good conduct under this Agreement.</li>
              <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
            </ol>

            <p className="mb-6 font-bold">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

            <h3 className="text-base font-bold mb-2">1. THE ASSET</h3>
            <p className="mb-2"><strong>1.1</strong> The Administrator hereby agrees to let, and the Rider agrees to hire, the following commercial transport vehicle (the <strong>"Asset"</strong>):</p>
            <ul className="list-disc pl-8 mb-6 space-y-1">
              <li><strong>Asset Type:</strong> {vehicle?.type || "___________________"}</li>
              <li><strong>Make/Model:</strong> {vehicle?.makeModel || "___________________"}</li>
              <li><strong>Year of Manufacture:</strong> {vehicle?.year || "___________________"}</li>
              <li><strong>Engine Number:</strong> {vehicle?.engineNumber || "___________________"}</li>
              <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___________________"}</li>
              <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber || "___________________"}</li>
            </ul>

            <h3 className="text-base font-bold mb-2">2. FINANCIAL TERMS AND REMITTANCE</h3>
            <p className="mb-2"><strong>2.1 Total Hire Purchase Price:</strong> The total sum payable by the Rider to acquire ownership of the Asset is <strong>₦{contract?.totalPrice?.toLocaleString() || "_____________"}</strong>.</p>
            <p className="mb-2"><strong>2.2 Initial Deposit (If Applicable):</strong> The Rider has paid a non-refundable initial commitment deposit of <strong>₦{contract?.initialDeposit?.toLocaleString() || "0"}</strong>.</p>
            <p className="mb-2"><strong>2.3 Weekly Remittance:</strong> The Rider shall pay a fixed sum of <strong>₦{contract?.weeklyRemittance?.toLocaleString() || "_____________"}</strong> every week (the "Gross Weekly Remittance") directly into the Administrator’s designated Client Remittance Account in their dashboard.</p>
            <p className="mb-2"><strong>2.4 Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "_____________"}</strong> of every week. Cash payments to unauthorized staff are strictly prohibited and will not be recognized.</p>
            <p className="mb-6"><strong>2.5 Tenure:</strong> The expected duration of this hire purchase arrangement is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "_____"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

            <h3 className="text-base font-bold mb-2">3. RIDER’S OBLIGATIONS AND RISK</h3>
            <p className="mb-2"><strong>3.1 Risk and Maintenance:</strong> The Rider assumes <strong>100% financial and operational risk</strong> for the Asset from the moment of handover. The Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance (e.g., oil changes, tire replacement), and breakdowns.</p>
            <p className="mb-2"><strong>3.2 Accident Damage:</strong> In the event of an accident, the Rider and/or their Guarantors shall bear the full cost of repairing the Asset.</p>
            <p className="mb-2"><strong>3.3 Uninterrupted Remittance:</strong> Mechanical failure, illness, or traffic delays shall not exempt the Rider from their obligation to pay the Weekly Remittance.</p>
            <p className="mb-2"><strong>3.4 Compliance with Laws:</strong> The Rider shall possess a valid driver’s/rider’s license and comply with all state and federal traffic laws. Any fines, impoundment fees, or penalties incurred due to traffic violations shall be paid entirely by the Rider.</p>
            <p className="mb-6"><strong>3.5 GPS Tracker:</strong> The Rider acknowledges that a GPS tracking device is installed on the Asset. Tampering with, disconnecting, or damaging the GPS tracker is a fundamental breach of this Agreement and will result in immediate repossession.</p>

            <h3 className="text-base font-bold mb-2">4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
            <p className="mb-2"><strong>4.1 Ownership:</strong> The Asset remains the absolute property of the Asset Owner (managed by the Administrator) until the Total Hire Purchase Price is fully paid. The Rider is merely a "Hirer" and cannot sell, pawn, rent, or use the Asset as collateral.</p>
            <p className="mb-2"><strong>4.2 Inspection:</strong> The Administrator reserves the right to inspect the Asset at any reasonable time to ensure it is being properly maintained.</p>
            <p className="mb-2"><strong>4.3 Default and Repossession:</strong> The Administrator reserves the right to forcefully repossess the Asset without prior court order or legal notice if:</p>
            <ul className="list-disc pl-8 mb-2 space-y-1">
              <li>The Rider defaults on the Weekly Remittance for <strong>7</strong> consecutive days.</li>
              <li>The Rider tampers with the GPS tracker.</li>
              <li>The Rider uses the Asset for any illegal or criminal activity.</li>
              <li>The Asset is found to be abandoned or grossly poorly maintained.</li>
            </ul>
            <p className="mb-6"><strong>4.4 Forfeiture:</strong> In the event of repossession due to default, all previous payments made by the Rider shall be treated as standard rental fees for the use of the Asset and shall <strong>not</strong> be refunded.</p>

            <h3 className="text-base font-bold mb-2">5. TRANSFER OF OWNERSHIP</h3>
            <p className="mb-2"><strong>5.1</strong> Upon the complete and timely payment of the Total Hire Purchase Price, the Administrator shall issue a <strong>Letter of Completion</strong> to the Rider.</p>
            <p className="mb-6"><strong>5.2</strong> The Administrator shall facilitate the provision of the Change of Ownership Form and the original purchase receipts from the Asset Owner within fourteen (14) days of completion, transferring full legal ownership to the Rider.</p>

            <h3 className="text-base font-bold mb-2">6. GUARANTORS’ UNDERTAKING AND LIABILITY</h3>
            <p className="mb-2"><strong>6.1</strong> The Guarantors unconditionally, jointly, and severally guarantee the strict performance of the Rider under this Agreement.</p>
            <p className="mb-6"><strong>6.2</strong> If the Rider absconds, damages the Asset, defaults on the Weekly Remittance, or abandons the Asset, the Administrator shall have the legal right to pursue the Guarantors for the recovery of the Asset, outstanding monetary balances, and any repair costs incurred.</p>

            <h3 className="text-base font-bold mb-2">7. GENERAL PROVISIONS</h3>
            <p className="mb-2"><strong>7.1 Dispute Resolution:</strong> Any dispute arising from this Agreement shall be resolved via mediation. If unresolved, the Administrator may enforce its rights through the appropriate law enforcement agencies or courts in Lagos State.</p>
            <p className="mb-6"><strong>7.2 Binding Nature:</strong> This Agreement is legally binding upon signature by all Parties, without the requisite presence of legal counsel.</p>

            <h3 className="text-base font-bold mb-2">8. SIGNATURES</h3>
            <p className="mb-4"><strong>SIGNED by the ADMINISTRATOR</strong><br/>
            <strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong><br/>
            <strong>Authorized Signature:</strong> ____________________<br/>
            <strong>Date:</strong> ___________________</p>

            <p className="mb-2"><strong>SIGNED by the RIDER/DRIVER</strong><br/>
            I confirm that I have read, understood, and agreed to be bound by the terms of this Hire Purchase Agreement.</p>
            <p className="mb-6">
            <strong>Name:</strong> {rider?.firstName} {rider?.lastName}<br/>
            <strong>Signature:</strong> [Will be affixed below digitally]<br/>
            <strong>Date:</strong> {currentDate}
            </p>

            {/* GUARANTOR INJECTION */}
            <h3 className="text-base font-bold mb-4">9. GUARANTORS' EXECUTION</h3>
            <div className="mb-6 p-4 border border-black bg-gray-50">
              <p className="text-sm font-bold italic mb-4 text-gray-700">Note: The Guarantors below have previously executed Sworn Guarantor Attestations digitally. Their IP addresses, identity documents, and digital signatures are verified and held by the Administrator.</p>
              
              <p className="mb-2"><strong>FIRST GUARANTOR</strong><br/>
              I hereby undertake to be jointly and severally liable for any default, debt, or damage caused by the Rider during the pendency of this Agreement.</p>
              <ul className="list-disc pl-8 mb-4 space-y-1">
                <li><strong>Full Name:</strong> {g1?.firstName || "_____"} {g1?.lastName || "_____"}</li>
                <li><strong>NIN:</strong> {g1?.nin || "_____"}</li>
                <li><strong>Residential Address:</strong> {g1?.address || "_____"}</li>
                <li><strong>Phone Number:</strong> {g1?.phone || "_____"}</li>
              </ul>
              <p className="mb-6 text-sm text-green-700 font-bold">✓ Digitally Signed on: {g1?.signedAt ? new Date(g1.signedAt).toLocaleDateString() : "_____"} (Signature on file)</p>

              <p className="mb-2"><strong>SECOND GUARANTOR</strong><br/>
              I hereby undertake to be jointly and severally liable for any default, debt, or damage caused by the Rider during the pendency of this Agreement.</p>
              <ul className="list-disc pl-8 mb-4 space-y-1">
                <li><strong>Full Name:</strong> {g2?.firstName || "_____"} {g2?.lastName || "_____"}</li>
                <li><strong>NIN:</strong> {g2?.nin || "_____"}</li>
                <li><strong>Residential Address:</strong> {g2?.address || "_____"}</li>
                <li><strong>Phone Number:</strong> {g2?.phone || "_____"}</li>
              </ul>
              <p className="mb-4 text-sm text-green-700 font-bold">✓ Digitally Signed on: {g2?.signedAt ? new Date(g2.signedAt).toLocaleDateString() : "_____"} (Signature on file)</p>
            </div>

            <p className="mb-8"><strong>IN THE PRESENCE OF INDEPENDENT WITNESS:</strong><br/>
            <strong>Name:</strong> _________________________________________<br/>
            <strong>Address:</strong> _______________________________________<br/>
            <strong>Signature:</strong> _____________________________________<br/>
            <strong>Date:</strong> ___________________</p>

            {/* --- VEHICLE HANDOVER NOTE --- */}
            <div className="mt-12 pt-6 border-t-2 border-black break-inside-avoid">
              <h2 className="text-lg font-black uppercase text-center mb-6">VEHICLE HANDOVER AND CONDITION NOTE</h2>
              <p className="mb-6"><strong>Date of Handover:</strong> {currentDate} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Time of Handover:</strong> ___________________</p>
              
              <h3 className="font-bold mb-2">1. VEHICLE DETAILS</h3>
              <p className="mb-6">
                Asset Type: {vehicle?.type || "___________________"}<br/>
                Make & Model: {vehicle?.makeModel || "___________________"}<br/>
                Registration/Plate No: {vehicle?.registrationNumber || "___________________"}<br/>
                Chassis Number: {vehicle?.chassisNumber || "___________________"}
              </p>

              <h3 className="font-bold mb-2">2. CURRENT STATUS AT HANDOVER</h3>
              <p className="mb-2">Odometer/Mileage Reading: _______________ km</p>
              <div className="flex gap-4 mb-6">
                <span className="font-bold">Fuel Level:</span>
                {["Empty", "Quarter", "Half", "Full"].map(level => (
                  <label key={level} className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="fuel" checked={handoverData.fuelLevel === level} onChange={() => setHandoverData({...handoverData, fuelLevel: level})} className="w-3 h-3" /> {level}
                  </label>
                ))}
              </div>

              <h3 className="font-bold mb-2">3. EXTERIOR & INTERIOR CONDITION</h3>
              <p className="italic text-xs mb-2">(Please inspect carefully. Mark 'OK' if good, or describe any existing damage like scratches, dents, or broken glass).</p>
              <ul className="mb-4 space-y-2">
                <li>Front Bumper & Grille: ___________________________________</li>
                <li>Rear Bumper & Trunk: ____________________________________</li>
                <li>Left Side (Doors/Panels): _________________________________</li>
                <li>Right Side (Doors/Panels): ________________________________</li>
                <li>Windshield & Mirrors: ___________________________________</li>
                <li>Interior Seats & Dashboard: _______________________________</li>
              </ul>
              <div className="flex gap-4 mb-6">
                <span className="font-bold">Air Conditioning (If applicable):</span>
                {["Working", "Not Working", "N/A"].map(status => (
                  <label key={status} className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="ac" checked={handoverData.acStatus === status} onChange={() => setHandoverData({...handoverData, acStatus: status})} className="w-3 h-3" /> {status}
                  </label>
                ))}
              </div>

              <h3 className="font-bold mb-2">4. ACCESSORIES & TOOLS INCLUDED</h3>
              <p className="italic text-xs mb-2">(Check all items physically handed over to the Rider)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-sm">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.keys} onChange={() => handleCheckbox("keys")} className="w-4 h-4" /> Vehicle Ignition Keys</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.spareTire} onChange={() => handleCheckbox("spareTire")} className="w-4 h-4" /> Spare Tire (Uncheck if Keke/Korope)</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.jack} onChange={() => handleCheckbox("jack")} className="w-4 h-4" /> Car Jack & Wheel Spanner</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.cCaution} onChange={() => handleCheckbox("cCaution")} className="w-4 h-4" /> C-Caution (Warning Triangle)</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.extinguisher} onChange={() => handleCheckbox("extinguisher")} className="w-4 h-4" /> Fire Extinguisher</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.documents} onChange={() => handleCheckbox("documents")} className="w-4 h-4" /> Vehicle Particulars (Copies)</label>
              </div>

              <h3 className="font-bold mb-2">5. GPS CONFIRMATION</h3>
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 font-bold text-xs uppercase rounded mb-6">
                <AlertTriangle size={16} className="inline mb-1 mr-1" />
                [✓] GPS Tracker installed, tested, and confirmed active by Administrator.
              </div>

              <h3 className="font-bold mb-2">RIDER’S DECLARATION</h3>
              <p className="mb-4 text-justify">I, <strong>{rider.firstName} {rider.lastName}</strong>, hereby confirm that I have physically inspected the vehicle described above. I acknowledge that I am receiving the vehicle and the checked accessories in the exact condition stated in this document. I agree that I am fully responsible for maintaining this condition and replacing any missing tools or accessories as stipulated in my Hire Purchase Agreement.</p>
              
              <p className="mb-8"><strong>HANDED OVER BY (For Yusdaam Autos):</strong><br/>
              <strong>Name of Admin Officer:</strong> ________________________<br/>
              <strong>Signature:</strong> __________________________<br/>
              <strong>Date:</strong> ___________________</p>

              {/* RIDER SIGNATURE CANVAS FOR THE PDF */}
              <div className="border border-black p-4 bg-gray-50">
                <label className="block text-sm font-bold uppercase mb-2 text-center text-red-600">RIDER'S SIGNATURE</label>
                <div className="border-2 border-dashed border-gray-400 bg-white mx-auto w-full sm:w-[400px] h-32">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="blue"
                    canvasProps={{ className: "w-full h-full cursor-crosshair" }}
                  />
                </div>
                <div className="text-center mt-2">
                  <button type="button" onClick={() => sigCanvas.current?.clear()} className="text-[10px] font-bold text-gray-500 hover:text-black">
                    CLEAR SIGNATURE
                  </button>
                </div>
                <p className="text-center text-xs mt-2 font-bold">Date: {currentDate}</p>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-void-dark p-4 sm:p-6 border-t border-signal-red/30 flex justify-end shrink-0">
          <button 
            onClick={handleSign}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-signal-red text-crisp-white font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Securing Contract...</> : "Sign & Accept Vehicle"}
          </button>
        </div>

      </div>
    </div>
  );
}
