"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare, Download, ArrowRight, CheckCircle2 } from "lucide-react";

export interface AgreementProps {
  ownerName: string;
  bvn?: string;
  nin?: string;
  ownerAddress?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerId?: string;
  vehicleType?: string;
  makeModel?: string;
  year?: string;
  engineNo?: string;
  chassisNo?: string;
  plateNo?: string;
  startDate?: string;
  endDate?: string;
  targetWeeklyRemittance?: string;
  ownerBank?: string;
  ownerAcctNo?: string;
  grossRemittance?: string;
  adminCharge?: string;
  policyNo?: string;
  poaDate?: string;
}

export default function VirtualAgreement(props: AgreementProps) {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const contractRef = useRef<HTMLDivElement>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [appliedSignature, setAppliedSignature] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const clearSignature = () => sigCanvas.current?.clear();

  const handleAccept = async () => {
    setErrorMsg("");
    if (sigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your signature to proceed.");
    if (!agreed) return setErrorMsg("You must check the agreement box to proceed.");

    setIsSubmitting(true);
    const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null;
    setAppliedSignature(signatureImage);

    try {
      const res = await fetch("/api/owner/agreement/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureImage }),
      });

      if (!res.ok) throw new Error("Failed to process agreement.");
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    setIsDownloading(true);

    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `YUSDAAM_Agreement_${props.ownerName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(contractRef.current).save();
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const LegalDocument = ({ isPdf = false }: { isPdf?: boolean }) => {
    const fallback = "[Pending Admin Input]";
    const textStyle = isPdf ? "text-[11px] leading-relaxed text-black font-serif" : "text-sm text-slate-light leading-relaxed font-sans";
    const headingStyle = isPdf ? "font-bold text-[12px] underline mt-6 mb-2 text-black uppercase" : "font-bold text-crisp-white text-base mt-8 border-b border-cobalt/20 pb-2 uppercase";

    return (
      <div className={textStyle}>
        <div className={`text-center ${isPdf ? "border-b-2 border-[#001232] pb-4 mb-6" : "border-b border-cobalt/30 pb-6 mb-8"}`}>
          <h1 className={`${isPdf ? "text-3xl text-[#001232]" : "text-3xl text-crisp-white"} font-black tracking-widest mb-1`}>
            YUSDAAM<span className="text-[#FFB902]">.</span>
          </h1>
          <p className={`${isPdf ? "text-[10px]" : "text-xs"} font-bold uppercase tracking-widest`}>YUSDAAM Autos Fleet Administrators Nigeria Limited</p>
          <p className={`${isPdf ? "text-[9px]" : "text-[10px] text-slate-light"} mt-1`}>RC: 9335611 | 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos | admin@yusdaamautos.com</p>
        </div>

        <h2 className={`text-center font-black uppercase ${isPdf ? "text-sm mb-6" : "text-lg text-signal-red mb-8"}`}>Hire Purchase Administration Agreement</h2>

        <p className="mb-4">THIS AGREEMENT is made this <strong>{new Date().getDate()}</strong> day of <strong>{new Date().toLocaleString('default', { month: 'long' })}</strong>, <strong>{new Date().getFullYear()}</strong></p>

        <p className="mb-2 font-bold">BETWEEN</p>
        <p className="mb-6"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company incorporated under CAMA with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria, email: admin@yusdaamautos.com (hereinafter called "the Administrator" which expression shall include its successors and assigns) of the one part;</p>

        <p className="mb-2 font-bold">AND</p>
        <p className="mb-8"><strong>{props.ownerName}</strong>, BVN: {props.bvn || fallback}, NIN: {props.nin || fallback}, of {props.ownerAddress || fallback}, email: {props.ownerEmail || fallback}, phone: {props.ownerPhone || fallback} (hereinafter called "the Owner" which expression shall include heirs and assigns) of the other part.</p>

        <p className="mb-2 font-bold">WHEREAS:</p>
        <ul className="list-disc pl-5 mb-8 space-y-2">
          <li>The Owner is the legal owner or intending purchaser of a commercial transport asset including but not limited to tricycles, mini-bus, cars, trucks, tippers, buses, and other commercial vehicles and desires professional administration of the asset under hire purchase.</li>
          <li>The Administrator is engaged in the business of managing hire purchase vehicles on behalf of owners via Power of Attorney, including rider/driver vetting, remittance collection, GPS tracking, enforcement, and repossession.</li>
          <li>The Administrator charges the Owner ₦0 as administration fee. Administrator’s revenue is derived solely from administrative charges paid by riders/drivers.</li>
          <li>Parties have agreed to terms set out herein.</li>
        </ul>

        <p className="mb-4 font-bold">NOW IT IS HEREBY AGREED AS FOLLOWS:</p>

        <h3 className={headingStyle}>1. APPOINTMENT & ASSET DESCRIPTION</h3>
        <p className="mb-2">1.1 The Owner hereby appoints the Administrator via Power of Attorney to manage, operate, monitor, and enforce hire purchase terms for one (1) unit of commercial transport asset described as:</p>
        <div className={`pl-5 mb-2 ${isPdf ? "font-mono" : "font-mono bg-void-navy/50 p-4 rounded-lg"}`}>
          <p>OwnerID: {props.ownerId || fallback}</p>
          <p>Asset Type: {props.vehicleType || fallback}</p>
          <p>Make/Model: {props.makeModel || fallback}</p>
          <p>Year: {props.year || fallback}</p>
          <p>Engine No: {props.engineNo || fallback}</p>
          <p>Chassis No: {props.chassisNo || fallback}</p>
          <p>Plate No: {props.plateNo || fallback}</p>
        </div>
        <p className="mb-6">1.2 Legal and beneficial ownership of the Asset shall remain 100% vested in the Owner until transfer to rider/driver per Clause 8.4. The Administrator has no ownership interest.</p>

        <h3 className={headingStyle}>2. VEHICLE PURCHASE & PAYMENT FLOW</h3>
        <p className="mb-2">2.1 The Owner shall pay the vehicle dealer/supplier directly. The Administrator shall not receive, hold, or disburse Owner’s funds for vehicle purchase.</p>
        <p className="mb-2">2.2 The Administrator shall provide the Owner with a Purchase Facilitation Quote and supplier invoice. Owner approves and pays dealer directly.</p>
        <p className="mb-6">2.3 Proof of payment from Owner to dealer shall be attached as Schedule A. Administrator’s role is limited to facilitation only.</p>

        <h3 className={headingStyle}>3. TENURE & ADMINISTRATION TERMS</h3>
        <p className="mb-2">3.1 This Agreement shall run for a Tenure of [Pending Admin Input] weeks commencing {props.startDate || fallback} and ending {props.endDate || fallback}, unless terminated earlier per Clause 8.</p>
        <p className="mb-2">3.2 Owner’s Target Weekly Remittance: ₦{props.targetWeeklyRemittance || fallback}. This is a target based on current market data for this Asset Type and is NOT guaranteed by the Administrator.</p>
        <p className="mb-6">3.3 All rider/driver payments shall be made directly into Administrator’s designated Client Remittance Account. Administrator shall remit Net Weekly Remittance to Owner’s nominated account: {props.ownerBank || fallback} - {props.ownerAcctNo || fallback} within 48 hours of receipt.</p>

        <h3 className={headingStyle}>4. ADMINISTRATOR’S OBLIGATIONS — ₦0 FEE FROM OWNER</h3>
        <p className="mb-2">4.1 The Administrator shall at no cost to Owner: vet and recruit riders/drivers, execute hire purchase agreements with riders/drivers, install GPS tracker, monitor Asset, collect weekly remittances, enforce payment, conduct repossession if rider/driver defaults, and provide Monthly Operation Reports.</p>
        <p className="mb-2">4.2 The Administrator shall send Weekly Remittance Advice and GPS logs to Owner’s email.</p>
        <p className="mb-6">4.3 The Administrator shall not charge the Owner any fee. Administrator’s income is derived solely from administrative charges paid by riders/drivers.</p>

        <h3 className={headingStyle}>5. REMITTANCE STRUCTURE & DEDUCTIONS</h3>
        <p className="mb-2">5.1 Gross Weekly Remittance is the total sum collected from the rider/driver weekly. Current target: ₦{props.grossRemittance || fallback}.</p>
        <p className="mb-2">5.2 The Administrator shall deduct ₦{props.adminCharge || fallback} weekly as Rider/Driver Administration Fee for services including GPS monitoring, enforcement, reporting, insurance facilitation, and repossession. This fee is earned by Administrator and is not Owner’s income.</p>
        <p className="mb-2">5.3 Net Weekly Remittance = Gross Weekly Remittance less Admin Charge. Administrator shall transfer Net Weekly Remittance to Owner’s nominated bank account within 48 hours of receipt from rider/driver.</p>
        <p className="mb-6">5.4 If rider/driver defaults due to accident, rider/driver sick, or other unforseen situation, Gross Weekly Remittance may be ₦0. Administrator does not guarantee Owner’s Net Weekly Remittance and shall not be liable for shortfalls, but shall enforce recovery via Power of Attorney.</p>

        <h3 className={headingStyle}>6. RISK, INSURANCE & LIABILITY</h3>
        <p className="mb-2">6.1 The Owner bears risk of total loss including, natural disaster, government confiscation, and war. The Rider/Driver bears 100% risk and cost of mechanical failure, accident damage, routine maintenance, and breakdowns occurring during Tenure. The Administrator does not guarantee rider/driver performance or mechanical condition.</p>
        <p className="mb-2">6.2 The Asset shall carry 3rd Party Insurance minimum per NAICOM. Policy No: {props.policyNo || fallback}. Owner pays insurer directly. Comprehensive insurance is recommended but at Owner’s cost and discretion. Copy attached as Schedule B.</p>
        <p className="mb-2">6.3 The Administrator shall enforce repossession via POA if rider/driver defaults on payments or fails to repair Asset per Clause 6.1, but is not liable for loss of Asset, income, or repair costs.</p>
        <p className="mb-6">6.4 Ownership Transfer Mechanism: Upon rider/driver completion of Tenure and full payment of Total Hire Purchase Price, Administrator shall issue Letter of Completion to Owner and Rider. Owner shall sign Change of Ownership Form and provide original purchase receipt to Rider within 14 days. Administrator shall facilitate but is not liable if Owner delays transfer.</p>

        <h3 className={headingStyle}>7. OWNER’S OBLIGATIONS</h3>
        <p className="mb-2">7.1 The Owner shall not interfere with rider/driver selection, route management, or daily enforcement actions carried out under POA.</p>
        <p className="mb-2">7.2 The Owner shall notify the Administrator within 48 hours of change in bank details, address, or next of kin.</p>
        <p className="mb-6">7.3 The Owner warrants that funds used for vehicle purchase are from legitimate sources and not proceeds of crime.</p>

        <h3 className={headingStyle}>8. TERMINATION & REPOSSESSION</h3>
        <p className="mb-2">8.1 The Owner shall not terminate this Agreement within the first 26 weeks of Tenure except for Administrator’s material breach.</p>
        <p className="mb-2">8.2 After Week 26, Owner may terminate with 30 days written notice. Administrator shall hand over all rider/driver agreements, GPS access, and repossession rights.</p>
        <p className="mb-2">8.3 If Administrator fails to enforce remittance for 4 consecutive weeks without Force Majeure, Owner may revoke POA with 7 days notice and take over management.</p>
        <p className="mb-2">8.4 Upon Tenure completion by rider/driver and full payment of Total Hire Purchase Price, the Asset ownership shall transfer from Owner to rider/driver. The Owner shall execute all documents necessary for change of ownership within 14 days of Administrator’s written confirmation of completion. POA granted to Administrator expires upon completion and transfer.</p>
        <p className="mb-6">8.5 If rider/driver fails to complete Tenure or defaults permanently, Asset reverts to Owner’s full control. Administrator shall hand over Asset, keys, documents, and repossession report to Owner within 7 days of termination.</p>

        <h3 className={headingStyle}>9. FORCE MAJEURE</h3>
        <p className="mb-2">9.1 Neither party is liable for failure due to acts of God, war, nationwide strike, government ban on specific vehicle types, pandemic lockdown, or natural disaster.</p>
        <p className="mb-6">9.2 Administration shall be suspended during Force Majeure and resume when resolved. Tenure shall be extended by same period.</p>

        <h3 className={headingStyle}>10. ANTI-MONEY LAUNDERING & DATA PRIVACY</h3>
        <p className="mb-2">10.1 Parties shall keep terms confidential except for legal/tax/regulatory purposes.</p>
        <p className="mb-2">10.2 Administrator shall comply with ML(P)A 2022 and NDPA 2023. Owner’s KYC docs attached as Schedule C. BVN/NIN stored in encrypted drive with access limited to compliance staff.</p>
        <p className="mb-6">10.3 Administrator shall report suspicious transactions to NFIU per law.</p>

        <h3 className={headingStyle}>11. DISPUTE RESOLUTION & GOVERNING LAW</h3>
        <p className="mb-2">11.1 This Agreement is governed by Laws of the Federal Republic of Nigeria.</p>
        <p className="mb-2">11.2 Any dispute shall first be referred to mediation at Lagos Multi-Door Courthouse. Failing settlement, it shall be resolved by arbitration in Lagos under Arbitration and Mediation Act 2023 by a single arbitrator.</p>
        <p className="mb-6">11.3 Courts of Lagos State shall have exclusive jurisdiction for enforcement.</p>

        <h3 className={headingStyle}>12. GENERAL</h3>
        <p className="mb-2">12.1 This Agreement + Schedules A, B, C, D constitute the entire agreement. Any amendment must be in writing, signed by both parties.</p>
        <p className="mb-2">12.2 Power of Attorney dated {props.poaDate || fallback} is attached as Schedule D and forms part of this Agreement.</p>
        <p className="mb-2">12.3 Notices shall be sent to emails stated above and deemed received 24 hours after sending.</p>
        <p className="mb-6">12.4 If any clause is void, the rest remains valid. Stamp duty shall be paid by Administrator.</p>

        <p className="mb-8 font-bold italic">IN WITNESS WHEREOF parties have executed this Agreement the day and year first above written.</p>

        <div className={`grid grid-cols-2 gap-8 mt-12 ${isPdf ? "pt-8 border-t border-gray-300" : ""}`}>
          <div>
            <p className="font-bold mb-6">SIGNED by the within-named ADMINISTRATOR</p>
            <div className="h-16 mb-2">
               <div className={`w-32 border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
            </div>
            <p className="font-bold">Yussuf Dare Orelaja</p>
            <p className={isPdf ? "text-xs" : "text-xs text-slate-light"}>Managing Director</p>
            <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {new Date().toLocaleDateString()}</p>
            
            <p className="mt-8 font-bold text-xs">WITNESS (for Administrator)</p>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Name: ______________________</p>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Signature: ___________________</p>
          </div>

          <div>
            <p className="font-bold mb-6">SIGNED by the within-named OWNER</p>
            <div className="h-16 mb-2">
              {appliedSignature ? (
                <img src={appliedSignature} alt="Owner Signature" className="h-full object-contain" />
              ) : (
                <div className={`w-32 border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
              )}
            </div>
            <p className="font-bold">{props.ownerName}</p>
            <p className={isPdf ? "text-xs" : "text-xs text-slate-light"}>Asset Owner</p>
            <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {new Date().toLocaleDateString()}</p>

            <p className="mt-8 font-bold text-xs">WITNESS (for Owner)</p>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Name: ______________________</p>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Signature: ___________________</p>
          </div>
        </div>

        <div className={`mt-16 pt-8 ${isPdf ? "text-[10px]" : "text-xs text-slate-light"}`}>
          <p><strong>SCHEDULE A:</strong> Dealer Invoice + Proof of Payment by Owner</p>
          <p><strong>SCHEDULE B:</strong> Insurance Certificate</p>
          <p><strong>SCHEDULE C:</strong> Owner KYC Documents</p>
          <p><strong>SCHEDULE D:</strong> Power of Attorney</p>
        </div>
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-void-light/5 border border-emerald-500/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-wider text-crisp-white mb-2">Agreement Executed</h2>
        <p className="text-slate-light leading-relaxed mb-10">
          Your signature has been permanently attached to your profile. A copy of the finalized agreement has been automatically dispatched to your registered email address.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center justify-center gap-2 px-8 py-4 bg-void-navy border border-cobalt/30 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/10 transition disabled:opacity-50">
            {isDownloading ? <><Loader2 size={16} className="animate-spin" /> Generating</> : <><Download size={16} /> Download PDF</>}
          </button>
          
          <button onClick={() => router.refresh()} className="flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition shadow-lg">
            Access Dashboard <ArrowRight size={16} />
          </button>
        </div>

        <div className="hidden">
          <div ref={contractRef} className="bg-white p-12 w-[800px]">
            <LegalDocument isPdf={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
      <div className="h-[500px] overflow-y-auto p-8 sm:p-12 bg-void-navy/50 custom-scrollbar">
        <LegalDocument isPdf={false} />
      </div>

      <div className="p-8 border-t border-cobalt/30 bg-void-navy">
        {errorMsg && <p className="text-signal-red text-sm font-bold mb-4">{errorMsg}</p>}
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-light uppercase tracking-widest mb-3"><PenTool size={14} /> Draw Signature</label>
          <div className="bg-crisp-white rounded-lg border-2 border-cobalt/30 overflow-hidden">
            <SignatureCanvas ref={sigCanvas} penColor="#001232" canvasProps={{ className: "w-full h-40 cursor-crosshair" }} />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={clearSignature} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Canvas</button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <input type="checkbox" className="mt-1 w-4 h-4 accent-signal-red cursor-pointer" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">I, {props.ownerName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.</span>
        </label>

        <button onClick={handleAccept} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition disabled:opacity-50">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing Agreement</> : <><CheckSquare size={16} /> Sign & Accept Allocation</>}
        </button>
      </div>
    </div>
  );
}
