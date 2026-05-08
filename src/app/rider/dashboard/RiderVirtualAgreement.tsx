"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, Download, ArrowRight, CheckCircle2, ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function RiderVirtualAgreement({ rider, vehicle, contract, guarantors }: { rider: any, vehicle: any, contract: any, guarantors: any[] }) {
  const router = useRouter();
  
  // HARD LOCK for iOS Safari pinch-zoom & rubber-band scroll
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    document.head.appendChild(meta);
    
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none"; 
    
    return () => { 
      document.head.removeChild(meta); 
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  const [step, setStep] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const riderSigCanvas = useRef<SignatureCanvas>(null);
  const witnessSigCanvas = useRef<SignatureCanvas>(null);
  const contractRef = useRef<HTMLDivElement>(null);
  
  const [witnessName, setWitnessName] = useState("");
  const [witnessAddress, setWitnessAddress] = useState("");

  const [handoverData, setHandoverData] = useState({
    fuelLevel: "",
    frontBumper: "",
    rearBumper: "",
    leftSide: "",
    rightSide: "",
    windshield: "",
    interior: "",
    acStatus: "",
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

  const handleRadio = (field: string, value: string) => {
    setHandoverData(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  const formattedDate = today.toLocaleDateString('en-GB');

  const g1 = guarantors[0] || {};
  const g2 = guarantors[1] || {};

  const generatePDF = async () => {
    const element = contractRef.current;
    if (!element) throw new Error("Document reference not found");

    element.classList.add("pdf-mode");
    // Scale 1.5 is faster than 2 but maintains excellent text clarity
    const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, windowWidth: 800 });
    element.classList.remove("pdf-mode");

    const imgData = canvas.toDataURL("image/jpeg", 0.9);
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!witnessName || !witnessAddress) return setErrorMsg("Please provide your witness's name and address.");
    if (riderSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your Driver/Rider signature.");
    if (witnessSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your witness signature.");
    if (!handoverData.fuelLevel) return setErrorMsg("Please select the fuel level.");

    setIsSubmitting(true);

    try {
      setLoadingText("Compiling PDF Document...");
      const pdf = await generatePDF();
      
      // Save the generated PDF instantly into memory so Step 2 can download it immediately
      const blob = pdf.output('blob');
      setPdfBlobUrl(URL.createObjectURL(blob));

      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      setLoadingText("Uploading to Secure Vault...");
      const res = await fetch("/api/rider/sign-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64 })
      });

      if (!res.ok) throw new Error("Failed to process agreement.");
      
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  const handleInstantDownload = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `YUSDAAM_HPA_${rider.firstName}_${rider.lastName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- SUCCESS VIEW (STEP 2) ---
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy/95 backdrop-blur-md p-4 h-[100dvh] w-screen overscroll-none">
        <div className="max-w-3xl mx-auto bg-void-light/5 border border-emerald-500/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-500 w-full">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-crisp-white mb-2">Agreement Executed</h2>
          <p className="text-slate-light leading-relaxed mb-10">
            Your digital signature and handover condition note have been permanently secured. Your dashboard has been unlocked and your fleet assignment is now active.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleInstantDownload} className="flex items-center justify-center gap-2 px-6 py-4 bg-void-navy border border-cobalt/30 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/10 transition">
              <Download size={16} /> Download Copy
            </button>
            <button onClick={() => router.refresh()} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition shadow-lg">
              Access Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 1: HPA SIGNING VIEW ---
  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] w-screen flex items-center justify-center bg-void-navy/95 backdrop-blur-md p-0 sm:p-6 overscroll-none">
      
      {/* CSS to hide borders and clear buttons during PDF generation */}
      <style dangerouslySetInnerHTML={{__html: `
        .pdf-mode .hide-on-pdf { display: none !important; }
        .pdf-mode input[type="text"] { border: none !important; border-bottom: 1px solid black !important; background: transparent !important; padding: 0 !important; }
        .pdf-mode .canvas-container { border: none !important; }
      `}} />

      <div className="bg-void-dark w-full max-w-4xl h-full sm:max-h-[95dvh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col border-0 sm:border border-signal-red/30 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-signal-red/10 p-4 border-b border-signal-red/30 flex items-center gap-4 shrink-0">
          <ShieldCheck size={32} className="text-signal-red shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-signal-red uppercase tracking-wider">Pending Legal Execution</h2>
            <p className="text-[10px] sm:text-xs text-slate-light font-bold uppercase tracking-widest">Read, complete handover note, and sign below.</p>
          </div>
        </div>

        {/* Scrollable Document Area (Touch-pan-y allows inner scrolling while body is locked) */}
        <div className="flex-1 overflow-y-auto overscroll-none touch-pan-y bg-gray-200 p-2 sm:p-8">
          
          {errorMsg && (
            <div className="sticky top-0 z-10 bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-bold flex items-center gap-2 shadow-lg">
              <XCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* THE EXACT LEGAL DOCUMENT TO BE PDF'd */}
          <div ref={contractRef} className="bg-white p-6 sm:p-12 text-black font-serif text-[13px] leading-relaxed shadow-xl mx-auto w-full max-w-3xl">
            
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-black uppercase underline mb-2">DRIVER/RIDER HIRE PURCHASE AGREEMENT</h1>
            </div>

            <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDay}</strong> day of <strong>{currentMonth}</strong>, <strong>{currentYear}</strong>.</p>
            
            <p className="mb-4"><strong>BETWEEN</strong></p>
            <p className="mb-4"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>, acting as the lawful Attorney for the Asset Owner), of the first part;</p>
            
            <p className="mb-4"><strong>AND</strong></p>
            <p className="mb-4"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: <strong>{rider?.nin}</strong>, residing at <strong>{rider?.streetAddress}</strong>, Email: <strong>{rider?.email || "N/A"}</strong>, Phone: <strong>{rider?.phoneNumber}</strong> (hereinafter referred to as the <strong>“Driver/Rider”</strong>), of the second part;</p>
            
            <p className="mb-4"><strong>AND</strong></p>
            <p className="mb-8"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 9 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

            <h3 className="text-base font-bold underline mb-2">RECITALS</h3>
            <p className="mb-1"><strong>WHEREAS:</strong></p>
            <ol className="list-[upper-alpha] pl-8 mb-8 space-y-2">
              <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
              <li>The Driver/Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
              <li>The Guarantors have agreed to stand as full financial and legal sureties for the Driver/Rider, guaranteeing the Driver/Rider’s performance, payments, and good conduct under this Agreement.</li>
              <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
            </ol>

            <p className="mb-6 font-bold uppercase">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

            <h3 className="text-sm font-bold mb-2">1. THE ASSET</h3>
            <p className="mb-2"><strong>1.1</strong> The Administrator hereby agrees to let, and the Driver/Rider agrees to hire, the following commercial transport vehicle (the <strong>"Asset"</strong>):</p>
            <ul className="list-disc pl-8 mb-6 space-y-1">
              <li><strong>Asset Type:</strong> {vehicle?.type || "___________________"}</li>
              <li><strong>Make/Model:</strong> {vehicle?.makeModel || "___________________"}</li>
              <li><strong>Year of Manufacture:</strong> {vehicle?.year || "___________________"}</li>
              <li><strong>Engine Number:</strong> {vehicle?.engineNumber || "___________________"}</li>
              <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___________________"}</li>
              <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber || "___________________"}</li>
            </ul>

            <h3 className="text-sm font-bold mb-2">2. FINANCIAL TERMS AND REMITTANCE</h3>
            <p className="mb-2"><strong>2.1 Total Hire Purchase Price:</strong> The total sum payable by the Driver/Rider to acquire ownership of the Asset is <strong>₦{contract?.totalPrice?.toLocaleString() || "_____________"}</strong>.</p>
            <p className="mb-2"><strong>2.2 Initial Deposit (If Applicable):</strong> The Driver/Rider has paid a non-refundable initial commitment deposit of <strong>₦{contract?.initialDeposit?.toLocaleString() || "0"}</strong>.</p>
            <p className="mb-2"><strong>2.3 Weekly Remittance:</strong> The Driver/Rider shall pay a fixed sum of <strong>₦{contract?.weeklyRemittance?.toLocaleString() || "_____________"}</strong> every week (the "Gross Weekly Remittance") directly into the Administrator’s designated Client Remittance Account in their dashboard.</p>
            <p className="mb-2"><strong>2.4 Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "Friday 11:59 PM"}</strong> of every week. Cash payments to unauthorized staff are strictly prohibited and will not be recognized.</p>
            <p className="mb-6"><strong>2.5 Tenure:</strong> The expected duration of this hire purchase arrangement is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "_____"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

            <h3 className="text-sm font-bold mb-2">3. DRIVER/RIDER’S OBLIGATIONS AND RISK</h3>
            <p className="mb-2"><strong>3.1 Risk and Maintenance:</strong> The Driver/Rider assumes <strong>100% financial and operational risk</strong> for the Asset from the moment of handover. The Driver/Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance (e.g., oil changes, tire replacement), and breakdowns.</p>
            <p className="mb-2"><strong>3.2 Accident Damage:</strong> In the event of an accident, the Driver/Rider and/or their Guarantors shall bear the full cost of repairing the Asset.</p>
            <p className="mb-2"><strong>3.3 Uninterrupted Remittance:</strong> Mechanical failure, illness, or traffic delays shall not exempt the Driver/Rider from their obligation to pay the Weekly Remittance.</p>
            <p className="mb-2"><strong>3.4 Compliance with Laws:</strong> The Driver/Rider shall possess a valid driver’s/rider’s license and comply with all state and federal traffic laws. Any fines, impoundment fees, or penalties incurred due to traffic violations shall be paid entirely by the Driver/Rider.</p>
            <p className="mb-6"><strong>3.5 GPS Tracker:</strong> The Driver/Rider acknowledges that a GPS tracking device is installed on the Asset. Tampering with, disconnecting, or damaging the GPS tracker is a fundamental breach of this Agreement and will result in immediate repossession.</p>

            <h3 className="text-sm font-bold mb-2">4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
            <p className="mb-2"><strong>4.1 Ownership:</strong> The Asset remains the absolute property of the Asset Owner (managed by the Administrator) until the Total Hire Purchase Price is fully paid. The Driver/Rider is merely a "Hirer" and cannot sell, pawn, rent, or use the Asset as collateral.</p>
            <p className="mb-2"><strong>4.2 Inspection:</strong> The Administrator reserves the right to inspect the Asset at any reasonable time to ensure it is being properly maintained.</p>
            <p className="mb-2"><strong>4.3 Default and Repossession:</strong> The Administrator reserves the right to forcefully repossess the Asset without prior court order or legal notice if:</p>
            <ul className="list-disc pl-8 mb-2 space-y-1">
              <li>The Driver/Rider defaults on the Weekly Remittance for <strong>7</strong> consecutive days.</li>
              <li>The Driver/Rider tampers with the GPS tracker.</li>
              <li>The Driver/Rider uses the Asset for any illegal or criminal activity.</li>
              <li>The Asset is found to be abandoned or grossly poorly maintained.</li>
            </ul>
            <p className="mb-6"><strong>4.4 Forfeiture:</strong> In the event of repossession due to default, all previous payments made by the Driver/Rider shall be treated as standard rental fees for the use of the Asset and shall <strong>not</strong> be refunded.</p>

            <h3 className="text-sm font-bold mb-2">5. TRANSFER OF OWNERSHIP</h3>
            <p className="mb-2"><strong>5.1</strong> Upon the complete and timely payment of the Total Hire Purchase Price, the Administrator shall issue a <strong>Letter of Completion</strong> to the Driver/Rider.</p>
            <p className="mb-6"><strong>5.2</strong> The Administrator shall facilitate the provision of the Change of Ownership Form and the original purchase receipts from the Asset Owner within fourteen (14) days of completion, transferring full legal ownership to the Driver/Rider.</p>

            <h3 className="text-sm font-bold mb-2">6. GUARANTORS’ UNDERTAKING AND LIABILITY</h3>
            <p className="mb-2"><strong>6.1</strong> The Guarantors unconditionally, jointly, and severally guarantee the strict performance of the Driver/Rider under this Agreement.</p>
            <p className="mb-6"><strong>6.2</strong> If the Driver/Rider absconds, damages the Asset, defaults on the Weekly Remittance, or abandons the Asset, the Administrator shall have the legal right to pursue the Guarantors for the recovery of the Asset, outstanding monetary balances, and any repair costs incurred.</p>

            <h3 className="text-sm font-bold mb-2">7. GENERAL PROVISIONS</h3>
            <p className="mb-2"><strong>7.1 Dispute Resolution:</strong> Any dispute arising from this Agreement shall be resolved via mediation. If unresolved, the Administrator may enforce its rights through the appropriate law enforcement agencies or courts in Lagos State.</p>
            <p className="mb-6"><strong>7.2 Binding Nature:</strong> This Agreement is legally binding upon signature by all Parties, without the requisite presence of legal counsel.</p>

            <h3 className="text-sm font-bold mb-6">8. SIGNATURES</h3>
            
            <div className="mb-8">
              <p className="mb-4"><strong>SIGNED by the ADMINISTRATOR</strong><br/>
              <strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong></p>
              <div className="relative h-20 w-48 mb-2">
                <img src="/images/stamp.png" alt="Company Stamp" className="absolute left-0 bottom-0 h-24 object-contain opacity-90" />
              </div>
              <p><strong>Authorized Signature:</strong> Yussuf Dare Orelaja (MD)</p>
              <p><strong>Date:</strong> {formattedDate}</p>
            </div>

            <div className="mb-8">
              <p className="mb-4"><strong>SIGNED by the DRIVER/Rider</strong><br/>
              I confirm that I have read, understood, and agreed to be bound by the terms of this Hire Purchase Agreement.</p>
              <p><strong>Name:</strong> {rider?.firstName} {rider?.lastName}</p>
              
              <div className="mt-4 mb-2">
                <span className="font-bold">Signature:</span>
                <div className="canvas-container border-2 border-dashed border-gray-400 mt-2 bg-gray-50 w-full sm:w-[400px] h-32 relative">
                  <SignatureCanvas 
                    ref={riderSigCanvas}
                    penColor="black"
                    canvasProps={{ className: "w-full h-full cursor-crosshair absolute top-0 left-0" }}
                  />
                  <button type="button" onClick={() => riderSigCanvas.current?.clear()} className="hide-on-pdf absolute -bottom-6 right-0 text-[10px] font-bold text-red-500 uppercase tracking-widest">
                    Clear Canvas
                  </button>
                </div>
              </div>
              <p className="mt-8"><strong>Date:</strong> {formattedDate}</p>
            </div>

            <h3 className="text-sm font-bold mb-4">9. GUARANTORS' EXECUTION</h3>
            <div className="mb-6 p-4 border border-black bg-gray-50">
              <p className="text-xs font-bold italic mb-4 text-gray-700">Note: The Guarantors below have previously executed Sworn Guarantor Attestations digitally. Their IP addresses, identity documents, and digital signatures are verified and held by the Administrator. Their signatures are automatically attached below.</p>
              
              <p className="mb-2"><strong>FIRST GUARANTOR</strong><br/>
              I hereby undertake to be jointly and severally liable for any default, debt, theft, or damage caused by the Driver/Rider during the pendency of this Agreement.</p>
              <ul className="list-disc pl-8 mb-4 space-y-1">
                <li><strong>Full Name:</strong> {g1?.firstName || "_____"} {g1?.lastName || "_____"}</li>
                <li><strong>NIN:</strong> {g1?.nin || "_____"}</li>
                <li><strong>Residential Address:</strong> {g1?.address || "_____"}</li>
                <li><strong>Phone Number:</strong> {g1?.phone || "_____"}</li>
              </ul>
              <div className="flex items-end gap-2 mb-2">
                <strong>Signature:</strong> 
                {g1?.signatureUrl ? <img src={g1.signatureUrl} alt="G1 Sig" className="h-12 object-contain mix-blend-multiply" /> : "____________________"}
              </div>
              <p className="mb-8"><strong>Date:</strong> {g1?.signedAt ? new Date(g1.signedAt).toLocaleDateString('en-GB') : "_____"}</p>

              <p className="mb-2"><strong>SECOND GUARANTOR</strong><br/>
              I hereby undertake to be jointly and severally liable for any default, debt, theft, or damage caused by the Driver/Rider during the pendency of this Agreement.</p>
              <ul className="list-disc pl-8 mb-4 space-y-1">
                <li><strong>Full Name:</strong> {g2?.firstName || "_____"} {g2?.lastName || "_____"}</li>
                <li><strong>NIN:</strong> {g2?.nin || "_____"}</li>
                <li><strong>Residential Address:</strong> {g2?.address || "_____"}</li>
                <li><strong>Phone Number:</strong> {g2?.phone || "_____"}</li>
              </ul>
              <div className="flex items-end gap-2 mb-2">
                <strong>Signature:</strong> 
                {g2?.signatureUrl ? <img src={g2.signatureUrl} alt="G2 Sig" className="h-12 object-contain mix-blend-multiply" /> : "____________________"}
              </div>
              <p className="mb-4"><strong>Date:</strong> {g2?.signedAt ? new Date(g2.signedAt).toLocaleDateString('en-GB') : "_____"}</p>
            </div>

            <div className="mb-8">
              <p className="font-bold mb-4">IN THE PRESENCE OF INDEPENDENT WITNESS:</p>
              <p className="flex items-center gap-2 mb-2"><strong>Name:</strong> <input type="text" value={witnessName} onChange={(e) => setWitnessName(e.target.value)} className="flex-1 border border-gray-300 p-1 text-sm bg-gray-50" placeholder="Type Witness Name..." /></p>
              <p className="flex items-center gap-2 mb-4"><strong>Address:</strong> <input type="text" value={witnessAddress} onChange={(e) => setWitnessAddress(e.target.value)} className="flex-1 border border-gray-300 p-1 text-sm bg-gray-50" placeholder="Type Witness Address..." /></p>
              
              <div className="mt-4 mb-2">
                <span className="font-bold">Signature:</span>
                <div className="canvas-container border-2 border-dashed border-gray-400 mt-2 bg-gray-50 w-full sm:w-[400px] h-24 relative">
                  <SignatureCanvas 
                    ref={witnessSigCanvas}
                    penColor="black"
                    canvasProps={{ className: "w-full h-full cursor-crosshair absolute top-0 left-0" }}
                  />
                  <button type="button" onClick={() => witnessSigCanvas.current?.clear()} className="hide-on-pdf absolute -bottom-6 right-0 text-[10px] font-bold text-red-500 uppercase tracking-widest">
                    Clear Canvas
                  </button>
                </div>
              </div>
              <p className="mt-8"><strong>Date:</strong> {formattedDate}</p>
            </div>

            {/* --- INTERACTIVE VEHICLE HANDOVER NOTE --- */}
            <div className="mt-12 pt-6 border-t-4 border-black">
              <h2 className="text-xl font-black uppercase text-center mb-6">VEHICLE HANDOVER AND CONDITION NOTE</h2>
              <p className="mb-6"><strong>Date of Handover:</strong> {formattedDate} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Time of Handover:</strong> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              
              <h3 className="font-bold mb-2">1. VEHICLE DETAILS</h3>
              <p className="mb-6 leading-relaxed">
                <strong>Asset Type:</strong> {vehicle?.type || "___________________"}<br/>
                <strong>Make & Model:</strong> {vehicle?.makeModel || "___________________"}<br/>
                <strong>Registration/Plate No:</strong> {vehicle?.registrationNumber || "___________________"}<br/>
                <strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___________________"}
              </p>

              <h3 className="font-bold mb-2">2. CURRENT STATUS AT HANDOVER</h3>
              <p className="mb-4"><strong>Odometer/Mileage Reading:</strong> _______________ km <em className="text-xs text-gray-500 hide-on-pdf">(To be filled by Administrator if applicable)</em></p>
              
              <div className="flex flex-wrap gap-4 mb-6 items-center">
                <span className="font-bold">Fuel Level:</span>
                {["Empty", "Quarter", "Half", "Full"].map(level => (
                  <label key={level} className="flex items-center gap-1 cursor-pointer select-none">
                    <input type="radio" name="fuel" checked={handoverData.fuelLevel === level} onChange={() => handleRadio("fuelLevel", level)} className="w-4 h-4 accent-black" /> {level}
                  </label>
                ))}
              </div>

              <h3 className="font-bold mb-2">3. EXTERIOR & INTERIOR CONDITION</h3>
              <p className="italic text-xs mb-4 text-gray-600 hide-on-pdf">(Select 'OK', 'Damaged', or 'N/A' for Keke/Korope without those features).</p>
              
              <div className="space-y-3 mb-6">
                {[
                  { label: "Front Bumper & Grille", key: "frontBumper" },
                  { label: "Rear Bumper & Trunk", key: "rearBumper" },
                  { label: "Left Side (Doors/Panels)", key: "leftSide" },
                  { label: "Right Side (Doors/Panels)", key: "rightSide" },
                  { label: "Windshield & Mirrors", key: "windshield" },
                  { label: "Interior Seats & Dashboard", key: "interior" },
                ].map((item) => (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-2">
                    <span className="w-64 font-medium">{item.label}:</span>
                    <div className="flex gap-4 mt-2 sm:mt-0">
                      {["OK", "Damaged", "N/A"].map(opt => (
                        <label key={opt} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name={item.key} checked={(handoverData as any)[item.key] === opt} onChange={() => handleRadio(item.key, opt)} className="w-4 h-4 accent-black" /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mb-8 items-center border-b border-gray-200 pb-4">
                <span className="font-bold">Air Conditioning:</span>
                {["Working", "Not Working", "N/A"].map(status => (
                  <label key={status} className="flex items-center gap-1 cursor-pointer select-none">
                    <input type="radio" name="ac" checked={handoverData.acStatus === status} onChange={() => handleRadio("acStatus", status)} className="w-4 h-4 accent-black" /> {status}
                  </label>
                ))}
              </div>

              <h3 className="font-bold mb-2">4. ACCESSORIES & TOOLS INCLUDED</h3>
              <p className="italic text-xs mb-4 text-gray-600 hide-on-pdf">(Check all items physically handed over to the Driver/Rider)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50"><input type="checkbox" checked={handoverData.keys} onChange={() => handleCheckbox("keys")} className="w-5 h-5 accent-black" /> Vehicle Ignition Keys</label>
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50"><input type="checkbox" checked={handoverData.spareTire} onChange={() => handleCheckbox("spareTire")} className="w-5 h-5 accent-black" /> Spare Tire</label>
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50"><input type="checkbox" checked={handoverData.jack} onChange={() => handleCheckbox("jack")} className="w-5 h-5 accent-black" /> Car Jack & Wheel Spanner</label>
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50"><input type="checkbox" checked={handoverData.cCaution} onChange={() => handleCheckbox("cCaution")} className="w-5 h-5 accent-black" /> C-Caution (Warning Triangle)</label>
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50"><input type="checkbox" checked={handoverData.extinguisher} onChange={() => handleCheckbox("extinguisher")} className="w-5 h-5 accent-black" /> Fire Extinguisher</label>
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50"><input type="checkbox" checked={handoverData.documents} onChange={() => handleCheckbox("documents")} className="w-5 h-5 accent-black" /> Original Insurance & Particulars (Copies)</label>
              </div>

              <h3 className="font-bold mb-2">5. GPS CONFIRMATION</h3>
              <div className="p-4 bg-gray-100 border border-black font-bold text-sm uppercase mb-8 flex items-start gap-2">
                <AlertTriangle size={20} className="shrink-0" />
                <span>[✓] GPS Tracker installed, tested, and confirmed active by Administrator.</span>
              </div>

              <h3 className="font-bold mb-2">DRIVER/RIDER’S DECLARATION</h3>
              <p className="mb-6 text-justify">I, <strong>{rider.firstName} {rider.lastName}</strong>, hereby confirm that I have physically inspected the vehicle described above. I acknowledge that I am receiving the vehicle and the checked accessories in the exact condition stated in this document. I agree that I am fully responsible for maintaining this condition and replacing any missing tools or accessories as stipulated in my Hire Purchase Agreement.</p>
              
              <div className="flex flex-col sm:flex-row justify-between items-end mt-12 pt-8 border-t border-gray-300">
                <div className="w-full sm:w-1/2">
                  <p className="font-bold mb-4">HANDED OVER BY (For Yusdaam Autos):</p>
                  <p><strong>Name of Admin Officer:</strong> Yussuf Dare Orelaja</p>
                  <div className="relative h-16 mt-2 mb-2">
                    <img src="/images/stamp.png" alt="Company Stamp" className="absolute left-0 bottom-0 h-16 object-contain opacity-90 mix-blend-multiply" />
                  </div>
                  <p><strong>Date:</strong> {formattedDate}</p>
                </div>
                <div className="w-full sm:w-1/2 mt-8 sm:mt-0 text-right">
                  <p className="font-bold text-lg text-red-600 uppercase">DRIVER/RIDER'S SIGNATURE AFIXED ABOVE</p>
                  <p className="text-sm mt-2"><strong>Date:</strong> {formattedDate}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-void-dark p-4 border-t border-signal-red/30 flex flex-col sm:flex-row justify-end items-center gap-4 shrink-0">
          <p className="text-[10px] text-slate-light uppercase tracking-widest text-center sm:text-left">
            By clicking "Execute Agreement", you digitally sign and bind yourself to this contract.
          </p>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-signal-red text-crisp-white font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> {loadingText}</> : "Execute Agreement"}
          </button>
        </div>

      </div>
    </div>
  );
}
