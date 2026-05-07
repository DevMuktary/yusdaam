"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, XCircle, Check, X, Eye, EyeOff, UploadCloud, HelpCircle, Copy } from "lucide-react";
import { Country, State } from "country-state-city";

const NIGERIA_LGAS: Record<string, string[]> = {
  "Abia": ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umunneochi"],
  "Adamawa": ["Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
  "Akwa Ibom": ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"],
  "Anambra": ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
  "Bauchi": ["Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"],
  "Bayelsa": ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
  "Benue": ["Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Otukpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"],
  "Borno": ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
  "Cross River": ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"],
  "Delta": ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"],
  "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"],
  "Edo": ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"],
  "Ekiti": ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"],
  "Enugu": ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"],
  "Federal Capital Territory": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  "Gombe": ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"],
  "Imo": ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"],
  "Jigawa": ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Kaugama", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
  "Kaduna": ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"],
  "Kano": ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"],
  "Katsina": ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"],
  "Kebbi": ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"],
  "Kogi": ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
  "Kwara": ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"],
  "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  "Nasarawa": ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"],
  "Niger": ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Moya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"],
  "Ogun": ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"],
  "Ondo": ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"],
  "Osun": ["Aiyedire", "Atakunmosa East", "Atakunmosa West", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central", "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"],
  "Oyo": ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo", "Oyo East", "Saki East", "Saki West", "Surulere"],
  "Plateau": ["Bokkos", "Barkin Ladi", "Bassa", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"],
  "Rivers": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"],
  "Sokoto": ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"],
  "Taraba": ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kumi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"],
  "Yobe": ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"],
  "Zamfara": ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"]
};

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
  const topRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
  // State to hold generated URLs from the backend
  const [guarantorLinks, setGuarantorLinks] = useState<{g1Name: string, g1Link: string, g2Name: string, g2Link: string} | null>(null);
  const [copiedObj, setCopiedObj] = useState<number | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passportRef = useRef<HTMLInputElement>(null);
  const utilityRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    phoneCountryCode: "+234", phoneNumber: "", nin: "", bvn: "", 
    
    // File Base64 & Names
    passportBase64: "", passportName: "",
    utilityBillBase64: "", utilityBillName: "",
    driversLicenseBase64: "", driversLicenseName: "",
    
    countryIso: "NG", countryName: "Nigeria", state: "", lga: "", streetAddress: "", 
    driversLicenseNo: "", lasdriNo: "", 
    
    preferredAssetClass: "", preferredAssetClassOther: "",
    drivingExperienceYears: "", rideHailingActive: "false", previousHPExperience: "false",
    
    g1FirstName: "", g1LastName: "", g1Phone: "", g1Relationship: "", g1RelationshipOther: "",
    g2FirstName: "", g2LastName: "", g2Phone: "", g2Relationship: "", g2RelationshipOther: ""
  });

  const [availableLgas, setAvailableLgas] = useState<string[]>([]);

  // Prevent iOS Safari auto-zoom on input focus
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const availableStates = useMemo(() => State.getStatesOfCountry("NG"), []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumberOnlyChange = (e: React.ChangeEvent<HTMLInputElement>, maxLength: number) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setFormData({ ...formData, [e.target.name]: numericValue });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    const cleanStateName = selectedStateName.replace(" State", ""); 
    const lgas = NIGERIA_LGAS[cleanStateName] || NIGERIA_LGAS[selectedStateName] || [];
    
    setAvailableLgas(lgas);
    setFormData({ ...formData, state: selectedStateName, lga: "" });
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

  const passwordCriteria = [
    { label: "8+ Char", met: formData.password.length >= 8 },
    { label: "Upper", met: /[A-Z]/.test(formData.password) },
    { label: "Lower", met: /[a-z]/.test(formData.password) },
    { label: "Number", met: /[0-9]/.test(formData.password) }
  ];
  const passScore = passwordCriteria.filter(c => c.met).length;
  const isPasswordMatch = formData.password === formData.confirmPassword;

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedObj(index);
    setTimeout(() => setCopiedObj(null), 2000);
  };

  const nextStep = () => {
    setErrorMsg("");
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.nin || !formData.bvn || !formData.phoneNumber) return setErrorMsg("Please fill all required identity fields.");
      if (formData.nin.length !== 11) return setErrorMsg("NIN must be exactly 11 digits.");
      if (formData.bvn.length !== 11) return setErrorMsg("BVN must be exactly 11 digits.");
      if (!formData.passportBase64) return setErrorMsg("You must upload a clear Passport Photograph.");
      if (passScore < 4) return setErrorMsg("Password does not meet security requirements.");
      if (!isPasswordMatch) return setErrorMsg("Passwords do not match.");
    }
    if (step === 2) {
      if (!formData.state || !formData.lga || !formData.streetAddress) return setErrorMsg("Please complete your address details.");
      if (!formData.utilityBillBase64) return setErrorMsg("You must upload a valid Utility Bill.");
      if (!formData.driversLicenseNo || !formData.driversLicenseBase64) return setErrorMsg("Driver's License details and upload are mandatory.");
    }
    if (step === 3) {
      if (!formData.preferredAssetClass || !formData.drivingExperienceYears) return setErrorMsg("Please select your operational preferences.");
      if (formData.preferredAssetClass === "Others" && !formData.preferredAssetClassOther) return setErrorMsg("Please specify your preferred asset.");
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
    
    if (!formData.g1FirstName || !formData.g1Phone || !formData.g2FirstName || !formData.g2Phone || !formData.g1Relationship || !formData.g2Relationship) {
      return setErrorMsg("Please complete basic details for BOTH Guarantors.");
    }
    if (formData.g1Relationship === "Others" && !formData.g1RelationshipOther) return setErrorMsg("Please specify the relationship for Guarantor 1.");
    if (formData.g2Relationship === "Others" && !formData.g2RelationshipOther) return setErrorMsg("Please specify the relationship for Guarantor 2.");

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        preferredAssetClass: formData.preferredAssetClass === "Others" ? formData.preferredAssetClassOther : formData.preferredAssetClass,
        g1Relationship: formData.g1Relationship === "Others" ? formData.g1RelationshipOther : formData.g1Relationship,
        g2Relationship: formData.g2Relationship === "Others" ? formData.g2RelationshipOther : formData.g2Relationship,
      };

      const res = await fetch("/api/rider/auth/register", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      
      // Build the URLs based on the current domain
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setGuarantorLinks({
        g1Name: data.tokens.g1Name,
        g1Link: `${baseUrl}/guarantor/${data.tokens.g1Token}`,
        g2Name: data.tokens.g2Name,
        g2Link: `${baseUrl}/guarantor/${data.tokens.g2Token}`,
      });
      
      scrollToTop();
      setSuccess(true);
    } catch (err: any) { 
      setErrorMsg(err.message); 
      scrollToTop();
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (success && guarantorLinks) {
    return (
      <main className="min-h-screen bg-void-navy flex flex-col items-center justify-center p-4 sm:p-8 text-crisp-white">
        <div className="max-w-xl w-full bg-void-light/5 border border-cobalt/30 p-8 sm:p-12 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black mb-2 uppercase tracking-wider">Profile Locked</h2>
            <p className="text-sm text-slate-light leading-relaxed">
              Your foundational Rider profile is secure. To activate your account and proceed to fleet assignment, <strong className="text-crisp-white">you must send the links below to your nominated guarantors</strong> for them to complete their legal attestations.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {/* Guarantor 1 Link Box */}
            <div className="bg-void-navy/80 border border-signal-red/30 p-5 rounded-xl flex items-center justify-between">
              <div className="pr-4 overflow-hidden">
                <p className="text-[10px] font-bold text-signal-red uppercase tracking-widest mb-1">Guarantor 1: {guarantorLinks.g1Name}</p>
                <p className="text-sm text-slate-light font-mono truncate">{guarantorLinks.g1Link}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(guarantorLinks.g1Link, 1)} 
                className="shrink-0 p-3 bg-void-light/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition"
              >
                {copiedObj === 1 ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>

            {/* Guarantor 2 Link Box */}
            <div className="bg-void-navy/80 border border-signal-red/30 p-5 rounded-xl flex items-center justify-between">
              <div className="pr-4 overflow-hidden">
                <p className="text-[10px] font-bold text-signal-red uppercase tracking-widest mb-1">Guarantor 2: {guarantorLinks.g2Name}</p>
                <p className="text-sm text-slate-light font-mono truncate">{guarantorLinks.g2Link}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(guarantorLinks.g2Link, 2)} 
                className="shrink-0 p-3 bg-void-light/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition"
              >
                {copiedObj === 2 ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <Link href="/rider/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-signal-red hover:bg-signal-red/90 font-bold rounded-xl w-full text-sm uppercase tracking-wider transition">
            Proceed to Login <ChevronRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  // THE RESTORED RED GLOW INPUT STYLE
  const inputStyle = "w-full bg-void-light/5 border border-signal-red/60 rounded-lg px-4 py-3.5 text-base text-crisp-white focus:outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/40 transition-all placeholder:text-slate-light/40 shadow-[0_0_10px_rgba(233,69,96,0.05)]";
  const labelStyle = "flex items-center text-[10px] sm:text-xs font-bold text-slate-light/70 uppercase tracking-widest mb-1.5 sm:mb-2";

  return (
    <main className="min-h-screen bg-void-navy flex flex-col lg:flex-row text-crisp-white">
      
      {/* LEFT SIDE: Branding & Desktop Timeline */}
      <div className="lg:w-1/3 xl:w-1/4 bg-void-navy border-b lg:border-b-0 lg:border-r border-cobalt/20 p-5 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div>
          <Link href="/" className="text-xl sm:text-3xl font-black tracking-wider hover:opacity-80 transition block mb-4 lg:mb-12">YUSDAAM<span className="text-signal-red">.</span></Link>
          <div className="hidden sm:block space-y-10 border-l border-cobalt/20 ml-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`relative pl-8 transition-opacity duration-500 ${step === s ? 'opacity-100' : 'opacity-40'}`}>
                {/* The Red Dot Timeline Indicator */}
                <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${step === s ? 'bg-signal-red shadow-[0_0_10px_rgba(233,69,96,0.8)]' : 'bg-cobalt'}`} />
                <div className="text-[10px] font-bold text-signal-red uppercase mb-1">Phase 0{s}</div>
                <h3 className="font-bold text-sm">{s === 1 ? 'Core Identity' : s === 2 ? 'Licensing & Docs' : s === 3 ? 'Operations' : 'Guarantors'}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-4 sm:p-8 lg:p-16 overflow-y-auto relative">
        <div ref={topRef} className="absolute top-0 left-0 w-full h-1" />

        <div className="max-w-2xl w-full pt-4 sm:pt-0">
          
          <div className="sm:hidden flex items-center justify-between mb-8 px-1">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 mx-1 rounded-full ${step >= s ? 'bg-signal-red shadow-[0_0_8px_rgba(233,69,96,0.6)]' : 'bg-void-light/10'}`} />
            ))}
          </div>

          <div className="mb-6 sm:mb-12 border-b border-cobalt/20 pb-4 sm:pb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase mb-2">Rider Application</h1>
            <p className="text-xs sm:text-base text-slate-light">Complete your KYC to access commercial fleet assignments.</p>
          </div>

          {errorMsg && (
            <div className="bg-signal-red/10 border border-signal-red text-signal-red px-4 py-3 rounded-lg mb-8 text-sm font-medium flex gap-2 items-start animate-in fade-in slide-in-from-top-2">
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
                    <div className="w-2/3"><label className={labelStyle}>Phone Number *</label><input type="text" inputMode="numeric" name="phoneNumber" value={formData.phoneNumber} onChange={(e) => handleNumberOnlyChange(e, 11)} placeholder="080..." className={inputStyle} required /></div>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Passport Photograph * <Tooltip text="A clear, recent photograph of your face for your driver profile." /></label>
                  <input type="file" accept="image/*" className="hidden" ref={passportRef} onChange={(e) => handleFileConvert(e, "passport")} />
                  <div onClick={() => passportRef.current?.click()} className={`w-full h-24 sm:h-32 border-2 ${formData.passportBase64 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red'} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer`}>
                    {formData.passportBase64 ? (
                      <><CheckCircle2 size={32} className="mb-2 text-emerald-400" /><span className="text-xs font-bold uppercase tracking-widest text-emerald-400 truncate max-w-[80%]">{formData.passportName || "Attached"}</span></>
                    ) : (
                      <><UploadCloud size={32} className="mb-2 text-cobalt" /><span className="text-xs font-bold uppercase tracking-widest text-slate-light">Click to upload image</span></>
                    )}
                  </div>
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
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleTextChange} className={`${inputStyle} ${!isPasswordMatch && formData.confirmPassword.length > 0 ? 'border-signal-red/60 focus:ring-signal-red/40' : ''}`} required />
                    
                    {!isPasswordMatch && formData.confirmPassword.length > 0 && (
                      <p className="text-[10px] text-signal-red mt-2 font-bold uppercase tracking-wider flex items-center gap-1.5 animate-in slide-in-from-top-1"><XCircle size={12}/> Passwords do not match</p>
                    )}
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
                    <select name="state" value={formData.state} onChange={handleStateChange} className={`${inputStyle} appearance-none cursor-pointer`} required>
                      <option value="" className="bg-void-navy text-slate-light">Select State...</option>
                      {availableStates.map(s => <option key={s.isoCode} value={s.name} className="bg-void-navy text-crisp-white">{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Local Government Area *</label>
                    <select name="lga" value={formData.lga} onChange={handleTextChange} className={`${inputStyle} appearance-none cursor-pointer`} required disabled={availableLgas.length === 0}>
                      <option value="" className="bg-void-navy text-slate-light">{availableLgas.length > 0 ? "Select LGA..." : "Select State First"}</option>
                      {availableLgas.map(lga => <option key={lga} value={lga} className="bg-void-navy text-crisp-white">{lga}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Full Street Address *</label>
                  <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleTextChange} className={inputStyle} placeholder="Unit, House No, Street" required />
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
                    <label className={labelStyle}>License Upload * <Tooltip text="Upload a clear picture of your valid Driver's License." /></label>
                    <input type="file" accept="image/*,application/pdf" className="hidden" ref={licenseRef} onChange={(e) => handleFileConvert(e, "driversLicense")} />
                    <div onClick={() => licenseRef.current?.click()} className={`w-full h-24 border-2 ${formData.driversLicenseBase64 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red'} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer`}>
                      {formData.driversLicenseBase64 ? <span className="text-xs font-bold text-emerald-400 truncate px-4">{formData.driversLicenseName}</span> : <span className="text-xs font-bold text-slate-light">Upload License</span>}
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Utility Bill Upload * <Tooltip text="Must be a recent PHCN, LAWMA, or Water bill showing your address." /></label>
                    <input type="file" accept="image/*,application/pdf" className="hidden" ref={utilityRef} onChange={(e) => handleFileConvert(e, "utilityBill")} />
                    <div onClick={() => utilityRef.current?.click()} className={`w-full h-24 border-2 ${formData.utilityBillBase64 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-dashed border-cobalt/40 bg-void-light/5 hover:border-signal-red'} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer`}>
                      {formData.utilityBillBase64 ? <span className="text-xs font-bold text-emerald-400 truncate px-4">{formData.utilityBillName}</span> : <span className="text-xs font-bold text-slate-light">Upload Bill</span>}
                    </div>
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
                      <label className={labelStyle}>Commercial Experience *</label>
                      <select name="drivingExperienceYears" value={formData.drivingExperienceYears} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="0-2 Years" className="bg-void-navy text-crisp-white">0 - 2 Years</option>
                        <option value="3-5 Years" className="bg-void-navy text-crisp-white">3 - 5 Years</option>
                        <option value="5+ Years" className="bg-void-navy text-crisp-white">5+ Years</option>
                      </select>
                    </div>
                  )}

                  {formData.preferredAssetClass === "Others" && (
                    <div className="sm:col-span-2">
                      <label className={labelStyle}>Commercial Experience *</label>
                      <select name="drivingExperienceYears" value={formData.drivingExperienceYears} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="0-2 Years" className="bg-void-navy text-crisp-white">0 - 2 Years</option>
                        <option value="3-5 Years" className="bg-void-navy text-crisp-white">3 - 5 Years</option>
                        <option value="5+ Years" className="bg-void-navy text-crisp-white">5+ Years</option>
                      </select>
                    </div>
                  )}
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
                <div className="p-5 border border-cobalt/30 rounded-xl bg-void-navy/50 space-y-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-cobalt/20 pb-2">Primary Guarantor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelStyle}>First Name *</label><input type="text" name="g1FirstName" value={formData.g1FirstName} onChange={handleTextChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Last Name *</label><input type="text" name="g1LastName" value={formData.g1LastName} onChange={handleTextChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Phone Number *</label><input type="text" inputMode="numeric" name="g1Phone" value={formData.g1Phone} onChange={(e) => handleNumberOnlyChange(e, 11)} placeholder="080..." className={inputStyle} required /></div>
                    <div>
                      <label className={labelStyle}>Relationship *</label>
                      <select name="g1Relationship" value={formData.g1Relationship} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="Parent" className="bg-void-navy text-crisp-white">Parent</option>
                        <option value="Sibling" className="bg-void-navy text-crisp-white">Sibling</option>
                        <option value="Spouse" className="bg-void-navy text-crisp-white">Spouse</option>
                        <option value="Uncle/Aunt" className="bg-void-navy text-crisp-white">Uncle / Aunt</option>
                        <option value="Community Leader" className="bg-void-navy text-crisp-white">Community/Religious Leader</option>
                        <option value="Others" className="bg-void-navy text-crisp-white">Others (Specify)</option>
                      </select>
                    </div>
                    {formData.g1Relationship === "Others" && (
                      <div className="sm:col-span-2 animate-in slide-in-from-top-2 duration-300">
                        <label className={labelStyle}>Specify Relationship *</label>
                        <input type="text" name="g1RelationshipOther" value={formData.g1RelationshipOther} onChange={handleTextChange} className={inputStyle} placeholder="e.g. Mentor, Cousin" required />
                      </div>
                    )}
                  </div>
                </div>

                {/* Guarantor 2 */}
                <div className="p-5 border border-cobalt/30 rounded-xl bg-void-navy/50 space-y-4">
                  <h4 className="text-xs font-bold text-cobalt uppercase tracking-widest border-b border-cobalt/20 pb-2">Secondary Guarantor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelStyle}>First Name *</label><input type="text" name="g2FirstName" value={formData.g2FirstName} onChange={handleTextChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Last Name *</label><input type="text" name="g2LastName" value={formData.g2LastName} onChange={handleTextChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Phone Number *</label><input type="text" inputMode="numeric" name="g2Phone" value={formData.g2Phone} onChange={(e) => handleNumberOnlyChange(e, 11)} placeholder="080..." className={inputStyle} required /></div>
                    <div>
                      <label className={labelStyle}>Relationship *</label>
                      <select name="g2Relationship" value={formData.g2Relationship} onChange={handleTextChange} className={`${inputStyle} appearance-none`} required>
                        <option value="" className="bg-void-navy">Select...</option>
                        <option value="Parent" className="bg-void-navy text-crisp-white">Parent</option>
                        <option value="Sibling" className="bg-void-navy text-crisp-white">Sibling</option>
                        <option value="Spouse" className="bg-void-navy text-crisp-white">Spouse</option>
                        <option value="Uncle/Aunt" className="bg-void-navy text-crisp-white">Uncle / Aunt</option>
                        <option value="Community Leader" className="bg-void-navy text-crisp-white">Community/Religious Leader</option>
                        <option value="Others" className="bg-void-navy text-crisp-white">Others (Specify)</option>
                      </select>
                    </div>
                    {formData.g2Relationship === "Others" && (
                      <div className="sm:col-span-2 animate-in slide-in-from-top-2 duration-300">
                        <label className={labelStyle}>Specify Relationship *</label>
                        <input type="text" name="g2RelationshipOther" value={formData.g2RelationshipOther} onChange={handleTextChange} className={inputStyle} placeholder="e.g. Mentor, Cousin" required />
                      </div>
                    )}
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
