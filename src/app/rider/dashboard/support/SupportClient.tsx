"use client";

import { useState } from "react";
import { MessageCircle, Phone, Mail, ShieldAlert, ChevronDown, ChevronUp, LifeBuoy, FileText } from "lucide-react";

export default function SupportClient({ rider }: { rider: any }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What happens if my vehicle breaks down?",
      answer: "As per your Hire Purchase Agreement, you assume 100% operational risk. You are solely responsible for the cost of all mechanical repairs, routine maintenance, servicing, and breakdowns. Ensure you service your vehicle regularly to avoid downtime."
    },
    {
      question: "Can I skip a weekly remittance if I am sick or the vehicle is faulty?",
      answer: "No. Mechanical failure, illness, traffic delays, or vehicle impoundment do not exempt you from your obligation to pay the Weekly Remittance as and when due. Shortfalls will accrue as debt and may lead to repossession."
    },
    {
      question: "What should I do if I have an accident?",
      answer: "Ensure your safety first, then immediately report the incident using the Emergency Operations line on this page. Note that you and your guarantors bear the absolute financial burden of repairing or replacing the Asset in the event of severe damage or a crash."
    },
    {
      question: "When do I take full ownership of the vehicle?",
      answer: "Ownership is transferred only upon the complete and timely payment of your Total Hire Purchase Price. Once cleared, Administration will issue a Letter of Completion and facilitate your Change of Ownership documents."
    },
    {
      question: "Can I repair or replace the GPS tracker?",
      answer: "Absolutely not. Tampering with, disconnecting, obscuring, or damaging the GPS tracker is considered an act of theft. This will result in immediate engine shutdown, repossession, and criminal prosecution."
    }
  ];

  const adminPhone = "+2348000000000"; // Replace with your actual company number
  const adminEmail = "admin@yusdaamautos.com";
  const whatsappLink = `https://wa.me/2348000000000?text=${encodeURIComponent(`Hello YUSDAAM Admin, my name is ${rider.firstName} ${rider.lastName}. I need assistance regarding my fleet assignment.`)}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2">Support & Operations</h1>
        <p className="text-sm text-slate-light">Get immediate help, report emergencies, and review fleet policies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CONTACT CARDS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Emergency Card */}
          <div className="bg-signal-red/10 border border-signal-red/30 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold border-b border-signal-red/20 pb-3 mb-4 uppercase tracking-wider flex items-center gap-2 text-signal-red">
              <LifeBuoy size={18} /> Emergency Response
            </h3>
            <p className="text-xs text-slate-light mb-6 leading-relaxed">
              Use this line strictly for severe accidents, theft, police impoundment, or critical emergencies.
            </p>
            <a 
              href={`tel:${adminPhone}`}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-signal-red hover:bg-signal-red/90 text-crisp-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(233,69,96,0.3)]"
            >
              <Phone size={16} /> Call Operations
            </a>
          </div>

          {/* Regular Contact */}
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-4 uppercase tracking-wider flex items-center gap-2 text-cobalt">
              <MessageCircle size={18} /> Direct Support
            </h3>
            <p className="text-xs text-slate-light mb-6 leading-relaxed">
              For payment disputes, dashboard issues, or general inquiries, reach out to our admin desk.
            </p>
            
            <div className="space-y-3">
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
              >
                <MessageCircle size={16} /> WhatsApp Admin
              </a>
              <a 
                href={`mailto:${adminEmail}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-void-light/5 hover:bg-void-light/10 border border-cobalt/30 text-crisp-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
              >
                <Mail size={16} className="text-cobalt" /> Email Us
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FAQ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 sm:p-8 shadow-lg h-full">
            <div className="flex items-center gap-3 border-b border-cobalt/20 pb-4 mb-6">
              <div className="p-3 bg-cobalt/10 rounded-xl">
                <FileText size={24} className="text-cobalt" />
              </div>
              <div>
                <h2 className="text-lg font-black text-crisp-white uppercase tracking-wide">Operational Guidelines</h2>
                <p className="text-xs text-slate-light font-medium">Frequently asked questions regarding your contract.</p>
              </div>
            </div>

            <div className="divide-y divide-cobalt/10">
              {faqs.map((faq, index) => (
                <div key={index} className="py-4">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 text-left group outline-none"
                  >
                    <span className={`font-bold text-sm uppercase tracking-wide transition-colors ${openFaq === index ? "text-cobalt" : "text-crisp-white group-hover:text-cobalt"}`}>
                      {faq.question}
                    </span>
                    <div className={`p-1 rounded-full shrink-0 transition-colors ${openFaq === index ? "bg-cobalt/20 text-cobalt" : "bg-void-light/5 text-slate-light group-hover:text-cobalt"}`}>
                      {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  
                  {openFaq === index && (
                    <div className="mt-4 pr-8 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-slate-light leading-relaxed pl-4 border-l-2 border-cobalt/30">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-cobalt/20 flex gap-4 items-start bg-signal-red/5 p-4 rounded-xl border-signal-red/10">
              <ShieldAlert size={20} className="text-signal-red shrink-0 mt-0.5" />
              <p className="text-xs text-slate-light leading-relaxed">
                <strong className="text-signal-red uppercase tracking-wider block mb-1">Compliance Warning</strong>
                Ignorance of the contractual terms is not an excuse. Always refer to your signed Hire Purchase Agreement in the Legal Vault for exact legal definitions and obligations.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
