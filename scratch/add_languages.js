const fs = require('fs');

const languagesList = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' }
];

const baseTranslations = {
  logoTitle: "IndianToolsHub",
  home: "Home",
  about: "About Us",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  searchPlaceholder: "Search for any tool (e.g. Image Compressor, PDF sign, JSON validator)...",
  heroTitle: "All Smart Tools,\nOne Powerful Platform.",
  heroSubtitle: "Fast, easy, secure, and 100% client-side web utility tools for images, documents, calculators, developers, and more.",
  categoriesTitle: "Popular Web Utilities",
  contactUs: "Contact Us",
  useTool: "Use Tool",
  noTools: "No tools found matching your search.",
  noToolsDesc: "Try searching for different keywords or check another category.",
  allUtilities: "All Utilities",
  pancardResizer: "PAN Card Resizer"
};

// Simplified translation values for illustration and functionality
const translationsData = {
  en: baseTranslations,
  hi: {
    logoTitle: "इंडियनटूल्सहब",
    home: "मुख्य पृष्ठ",
    about: "हमारे बारे में",
    privacy: "गोपनीयता नीति",
    terms: "उपयोग की शर्तें",
    searchPlaceholder: "किसी भी उपकरण को खोजें (जैसे कि छवि कंप्रेसर, पीडीएफ हस्ताक्षर, जेएसओएन सत्यापनकर्ता)...",
    heroTitle: "सभी स्मार्ट टूल्स,\nएक शक्तिशाली मंच।",
    heroSubtitle: "छवियों, दस्तावेजों, कैलकुलेटर, डेवलपर्स और बहुत कुछ के लिए तेज़, आसान, सुरक्षित और 100% क्लाइंट-साइड वेब उपयोगिता उपकरण।",
    categoriesTitle: "लोकप्रिय वेब उपयोगिताएँ",
    contactUs: "संपर्क करें",
    useTool: "उपयोग करें",
    noTools: "आपकी खोज से मेल खाता कोई उपकरण नहीं मिला।",
    noToolsDesc: "विभिन्न कीवर्ड खोजने का प्रयास करें या किसी अन्य श्रेणी की जांच करें।",
    allUtilities: "सभी उपयोगिताएँ",
    pancardResizer: "पैन कार्ड रिसाइज़र"
  },
  bn: {
    logoTitle: "ইন্ডিয়ানটুলসহাব",
    home: "হোম",
    about: "আমাদের সম্পর্কে",
    privacy: "গোপনীয়তা নীতি",
    terms: "ব্যবহারের শর্তাবলী",
    searchPlaceholder: "যেকোনো সরঞ্জাম অনুসন্ধান করুন (যেমন ইমেজ কম্প্রেসার, পিডিএফ সাইন, জেসন ভ্যালিডেটর)...",
    heroTitle: "সব স্মার্ট টুলস,\nএক শক্তিশালী প্ল্যাটফর্ম।",
    heroSubtitle: "ছবি, নথি, ক্যালকুলেটর, ডেভেলপার এবং আরও অনেক কিছুর জন্য দ্রুত, সহজ, নিরাপদ এবং ১০০% ক্লায়েন্ট-সাইড ওয়েব ইউটিলিটি টুলস।",
    categoriesTitle: "জনপ্রিয় ওয়েব ইউটিলিটি",
    contactUs: "যোগাযোগ করুন",
    useTool: "ব্যবহার করুন",
    noTools: "আপনার অনুসন্ধানের সাথে মিলতি কোনো সরঞ্জাম পাওয়া যায়নি।",
    noToolsDesc: "অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন বা অন্য বিভাগ পরীক্ষা করুন।",
    allUtilities: "সব ইউটিলিটি",
    pancardResizer: "প্যান কার্ড রিসাইজার"
  },
  mr: {
    logoTitle: "इंडियनटूल्सहब",
    home: "होम",
    about: "आमच्याबद्दल",
    privacy: "गोपनीयता धोरण",
    terms: "वापरण्याच्या अटी",
    searchPlaceholder: "कोणतेही साधन शोधा (उदा. इमेज कॉम्प्रेसर, पीडीएफ स्वाक्षरी, जेएसओएन व्हॅलिडेटर)...",
    heroTitle: "सर्व स्मार्ट साधने,\nएक शक्तिशाली प्लॅटफॉर्म.",
    heroSubtitle: "प्रतिमा, कागदपत्रे, कॅल्क्युलेटर, डेव्हलपर आणि अधिक गोष्टींसाठी वेगवान, सुलभ, सुरक्षित आणि १००% क्लायंट-साइड वेब युटिलिटी टूल्स.",
    categoriesTitle: "लोकप्रिय वेब साधने",
    contactUs: "संपर्क साधा",
    useTool: "वापरा",
    noTools: "तुमच्या शोधाशी जुळणारे कोणतेही साधन आढळले नाही.",
    noToolsDesc: "भिन्न कीवर्ड शोधण्याचा प्रयत्न करा किंवा दुसरी श्रेणी तपासा.",
    allUtilities: "सर्व साधने",
    pancardResizer: "पॅन कार्ड रिसायझर"
  },
  te: {
    logoTitle: "ఇండియన్ టూల్స్ హబ్",
    home: "హోమ్",
    about: "మా గురించి",
    privacy: "గోప్యతా విధానం",
    terms: "ఉపయోగ నిబంధనలు",
    searchPlaceholder: "ఏదైనా సాధనం కోసం శోధించండి (ఉదా. ఇమేజ్ కంప్రెసర్, పిడిఎఫ్ సైన్, జెసన్ వాలిడేటర్)...",
    heroTitle: "అన్ని స్మార్ట్ సాధనాలు,\nఒక శక్తివంతమైన ప్లాట్‌ఫారమ్.",
    heroSubtitle: "చిత్రాలు, పత్రాలు, కాలిక్యులేటర్లు, డెవలపర్లు మరియు మరిన్నింటి కోసం వేగవంతమైన, సులభమైన, సురక్షితమైన మరియు 100% క్లయింట్ వైపు వెబ్ యుటిలిటీ సాధనాలు.",
    categoriesTitle: "ప్రసిద్ధ వెబ్ యుటిలిటీస్",
    contactUs: "సంప్రదించండి",
    useTool: "ఉపయోగించండి",
    noTools: "మీ శోధనకు సరిపోలే సాధనాలు ఏవీ కనుగొనబడలేదు.",
    noToolsDesc: "విభిన్న కీవర్డ్‌లను శోధించడానికి ప్రయత్నించండి లేదా మరొక వర్గాన్ని తనిఖీ చేయండి.",
    allUtilities: "అన్ని యుటిలిటీస్",
    pancardResizer: "పాన్ కార్డ్ రీసైజర్"
  },
  ta: {
    logoTitle: "இந்தியன் டூல்ஸ் ஹப்",
    home: "முகப்பு",
    about: "எங்களைப் பற்றி",
    privacy: "தனியுரிமைக் கொள்கை",
    terms: "பயன்பாட்டு விதிமுறைகள்",
    searchPlaceholder: "ஏதேனும் ஒரு கருவியைத் தேடுங்கள் (எ.கா. பட அமுக்கி, பி.டி.எஃப் கையொப்பம், ஜேசன் சரிபார்ப்புாளர்)...",
    heroTitle: "அனைத்து ஸ்மார்ட் கருவிகள்,\nஒரு சக்திவாய்ந்த தளம்.",
    heroSubtitle: "படங்கள், ஆவணங்கள், கால்குலேட்டர்கள், டெவலப்பர்கள் மற்றும் பலவற்றிற்கான விரைவான, எளிதான, பாதுகாப்பான மற்றும் 100% கிளையன்ட் பக்க வலை பயன்பாட்டு கருவிகள்.",
    categoriesTitle: "பிரபலமான வலை கருவிகள்",
    contactUs: "தொடர்பு கொள்க",
    useTool: "பயன்படுத்து",
    noTools: "உங்கள் தேடலுக்கு பொருத்தமான கருவிகள் எதுவும் கிடைக்கவில்லை.",
    noToolsDesc: "வேறு சொற்களைத் தேட முயற்சிக்கவும் அல்லது வேறு வகையைச் சரிபார்க்கவும்.",
    allUtilities: "அனைத்து கருவிகள்",
    pancardResizer: "பான் கார்டு ரீசைசர்"
  },
  gu: {
    logoTitle: "ઇન્ડિયન ટૂલ્સ હબ",
    home: "હોમ",
    about: "અમારા વિશે",
    privacy: "ગોપનીયતા નીતિ",
    terms: "વપરાશની શરતો",
    searchPlaceholder: "કોઈપણ સાધન શોધો (જેમ કે ઇમેજ કોમ્પ્રેસર, પીડીએફ સાઇન, જેસન વેરિફાયર)...",
    heroTitle: "બધા સ્માર્ટ સાધનો,\nએક શક્તિશાળી પ્લેટફોર્મ.",
    heroSubtitle: "છબીઓ, દસ્તાવેજો, કેલ્ક્યુલેટર, ડેવલપર્સ અને વધુ માટે ઝડપી, સરળ, સુરક્ષિત અને ૧૦૦% ક્લાયંટ-સાઇડ વેબ ઉપયોગિતા સાધનો.",
    categoriesTitle: "લોકપ્રિય વેબ ઉપયોગિતાઓ",
    contactUs: "સંપર્ક કરો",
    useTool: "ઉપયોગ કરો",
    noTools: "તમારી શોધને અનુરૂપ કોઈ સાધન મળ્યું નથી.",
    noToolsDesc: "બીજા કીવર્ડ્સ શોધવાનો પ્રયાસ કરો અથવા બીજી કેટેગરી તપાસో.",
    allUtilities: "બધી ઉપયોગિતાઓ",
    pancardResizer: "પાન કાર્ડ રીસાઇઝર"
  },
  es: {
    logoTitle: "IndianToolsHub",
    home: "Inicio",
    about: "Nosotros",
    privacy: "Privacidad",
    terms: "Términos",
    searchPlaceholder: "Buscar herramientas (Compresor de imágenes, Firma PDF, JSON)...",
    heroTitle: "Herramientas inteligentes,\nPlataforma potente.",
    heroSubtitle: "Herramientas web rápidas, seguras y 100% en el lado del cliente para imágenes, documentos, calculadoras y desarrolladores.",
    categoriesTitle: "Utilidades Web Populares",
    contactUs: "Contacto",
    useTool: "Usar herramienta",
    noTools: "No se encontraron herramientas.",
    noToolsDesc: "Intente buscar palabras clave diferentes.",
    allUtilities: "Todas las utilidades",
    pancardResizer: "Redimensionador de PAN"
  },
  fr: {
    logoTitle: "IndianToolsHub",
    home: "Accueil",
    about: "À propos",
    privacy: "Confidentialité",
    terms: "Conditions",
    searchPlaceholder: "Rechercher un outil (Compresseur d'image, Signature PDF, Validateur JSON)...",
    heroTitle: "Outils Intelligents,\nPlateforme Puissante.",
    heroSubtitle: "Outils web rapides, sécurisés et 100% côté client pour les images, documents, calculatrices et développeurs.",
    categoriesTitle: "Utilitaires Web Populaires",
    contactUs: "Contact",
    useTool: "Utiliser l'outil",
    noTools: "Aucun outil trouvé.",
    noToolsDesc: "Essayez d'autres mots-clés.",
    allUtilities: "Tous les utilitaires",
    pancardResizer: "Redimensionneur PAN"
  },
  de: {
    logoTitle: "IndianToolsHub",
    home: "Startseite",
    about: "Über uns",
    privacy: "Datenschutz",
    terms: "Bedingungen",
    searchPlaceholder: "Nach Werkzeugen suchen (Bildkompressor, PDF-Signatur, JSON)...",
    heroTitle: "Intelligente Werkzeuge,\nStarke Plattform.",
    heroSubtitle: "Schnelle, sichere und 100% clientseitige Web-Tools für Bilder, Dokumente, Rechner und Entwickler.",
    categoriesTitle: "Beliebte Web-Dienstprogramme",
    contactUs: "Kontakt",
    useTool: "Werkzeug nutzen",
    noTools: "Keine Werkzeuge gefunden.",
    noToolsDesc: "Versuchen Sie andere Suchbegriffe.",
    allUtilities: "Alle Dienstprogramme",
    pancardResizer: "PAN-Größenänderung"
  },
  zh: {
    logoTitle: "IndianToolsHub",
    home: "首页",
    about: "关于我们",
    privacy: "隐私政策",
    terms: "使用条款",
    searchPlaceholder: "搜索工具 (例如：图像压缩、PDF签名、JSON验证)...",
    heroTitle: "智能工具,\n强大平台。",
    heroSubtitle: "快速、安全、100%客户端运行的图像、文档、计算器及开发辅助工具。",
    categoriesTitle: "热门网页工具",
    contactUs: "联系我们",
    useTool: "使用工具",
    noTools: "没有找到相关工具。",
    noToolsDesc: "请尝试其他关键词或查看其他分类。",
    allUtilities: "全部工具",
    pancardResizer: "PAN卡裁剪"
  },
  ja: {
    logoTitle: "IndianToolsHub",
    home: "ホーム",
    about: "会社概要",
    privacy: "プライバシー",
    terms: "利用規約",
    searchPlaceholder: "ツールを検索 (例: 画像圧縮, PDF署名, JSONバリデータ)...",
    heroTitle: "スマートなツール、\n強力なプラットフォーム。",
    heroSubtitle: "画像、ドキュメント、電卓、開発者向けの高速で安全な100％クライアント側ウェブツール。",
    categoriesTitle: "人気のウェブユーティリティ",
    contactUs: "お問い合わせ",
    useTool: "ツールを使う",
    noTools: "ツールが見つかりません。",
    noToolsDesc: "別のキーワードで検索するか、別のカテゴリを確認してください。",
    allUtilities: "すべてのツール",
    pancardResizer: "PANカードサイズ変更"
  },
  ru: {
    logoTitle: "IndianToolsHub",
    home: "Главная",
    about: "О нас",
    privacy: "Конфиденциальность",
    terms: "Условия",
    searchPlaceholder: "Поиск инструментов (сжатие изображений, подпись PDF, JSON)...",
    heroTitle: "Умные инструменты,\nМощная платформа.",
    heroSubtitle: "Быстрые, безопасные и 100% клиентские веб-инструменты для работы с изображениями, документами, калькуляторами и кодом.",
    categoriesTitle: "Популярные утилиты",
    contactUs: "Контакты",
    useTool: "Открыть",
    noTools: "Инструменты не найдены.",
    noToolsDesc: "Попробуйте использовать другие ключевые слова.",
    allUtilities: "Все утилиты",
    pancardResizer: "Изменение размера PAN"
  },
  pt: {
    logoTitle: "IndianToolsHub",
    home: "Início",
    about: "Sobre",
    privacy: "Privacidade",
    terms: "Termos",
    searchPlaceholder: "Buscar ferramenta (Compressor de imagem, Assinatura PDF, JSON)...",
    heroTitle: "Ferramentas Inteligentes,\nPlataforma Poderosa.",
    heroSubtitle: "Ferramentas web rápidas, seguras e 100% no cliente para imagens, documentos, calculadoras e desenvolvedores.",
    categoriesTitle: "Utilitários Populares",
    contactUs: "Contato",
    useTool: "Usar",
    noTools: "Nenhuma ferramenta encontrada.",
    noToolsDesc: "Tente buscar outras palavras-chave.",
    allUtilities: "Todos os utilitários",
    pancardResizer: "Redimensionador de PAN"
  },
  it: {
    logoTitle: "IndianToolsHub",
    home: "Home",
    about: "Chi siamo",
    privacy: "Privacy",
    terms: "Termini",
    searchPlaceholder: "Cerca strumenti (Compressore immagini, Firma PDF, JSON)...",
    heroTitle: "Strumenti Intelligenti,\nPiattaforma Potente.",
    heroSubtitle: "Strumenti web veloci, sicuri e 100% lato client per immagini, documenti, calcolatrici e sviluppatori.",
    categoriesTitle: "Utility Popolari",
    contactUs: "Contatti",
    useTool: "Usa strumento",
    noTools: "Nessuno strumento trovato.",
    noToolsDesc: "Prova a cercare altre parole chiave.",
    allUtilities: "Tutte le utility",
    pancardResizer: "Ridimensionatore PAN"
  },
  ar: {
    logoTitle: "مجموعة الأدوات الهندية",
    home: "الرئيسية",
    about: "من نحن",
    privacy: "الخصوصية",
    terms: "الشروط",
    searchPlaceholder: "ابحث عن أي أداة (مثل ضاغط الصور، توقيع ملفات PDF، مدقق JSON)...",
    heroTitle: "جميع الأدوات الذكية،\nفي منصة واحدة قوية.",
    heroSubtitle: "أدوات ويب سريعة، آمنة، وتعمل 100% على جانب العميل للصور، المستندات، الحاسبات، والمطورين.",
    categoriesTitle: "أدوات الويب الشائعة",
    contactUs: "اتصل بنا",
    useTool: "استخدم الأداة",
    noTools: "لم يتم العثور على أي أدوات تطابق بحثك.",
    noToolsDesc: "حاول البحث بكلمات مفتاحية أخرى أو تحقق من فئة أخرى.",
    allUtilities: "جميع الأدوات",
    pancardResizer: "مغير حجم بطاقة PAN"
  }
};

// Fill missing languages with default fallback (English value translated or standard English)
languagesList.forEach(lang => {
  if (!translationsData[lang.code]) {
    // Basic Spanish/English style translations for placeholder properties
    translationsData[lang.code] = {
      logoTitle: "IndianToolsHub",
      home: lang.name === 'French' ? "Accueil" : lang.name === 'German' ? "Startseite" : "Home",
      about: "About Us",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      searchPlaceholder: `Search tools in ${lang.name}...`,
      heroTitle: "All Smart Tools,\nOne Powerful Platform.",
      heroSubtitle: "Fast, easy, secure, and 100% client-side web utility tools for images, documents, calculators, developers, and more.",
      categoriesTitle: "Popular Web Utilities",
      contactUs: "Contact Us",
      useTool: "Use Tool",
      noTools: "No tools found matching your search.",
      noToolsDesc: "Try searching for different keywords or check another category.",
      allUtilities: "All Utilities",
      pancardResizer: "PAN Card Resizer"
    };
  }
});

// Create replacement content for LanguageContext.tsx
const langTypes = languagesList.map(l => `'${l.code}'`).join(' | ');
const codeStr = `export type Language = ${langTypes};`;

const listStr = `export const LANGUAGES: LanguageInfo[] = ${JSON.stringify(languagesList, null, 2)};`;

const translationsStr = `const translations: Record<Language, Record<string, string>> = ${JSON.stringify(translationsData, null, 2)};`;

// Read the original file
const filepath = 'src/context/LanguageContext.tsx';
let fileContent = fs.readFileSync(filepath, 'utf8');

// Replace Language type
fileContent = fileContent.replace(/export type Language = [^;]+;/, codeStr);

// Replace LANGUAGES list
const langListStart = fileContent.indexOf('export const LANGUAGES: LanguageInfo[]');
const langListEnd = fileContent.indexOf('];', langListStart) + 2;
const originalLangList = fileContent.substring(langListStart, langListEnd);
fileContent = fileContent.replace(originalLangList, listStr);

// Replace translations dictionary
const transStart = fileContent.indexOf('const translations: Record<Language');
const transEnd = fileContent.indexOf('};', transStart) + 2;
const originalTrans = fileContent.substring(transStart, transEnd);
fileContent = fileContent.replace(originalTrans, translationsStr);

fs.writeFileSync(filepath, fileContent, 'utf8');
console.log('Successfully updated LanguageContext.tsx with 50 global languages!');
