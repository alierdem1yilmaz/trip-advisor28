export type Language = "en" | "tr" | "es";

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  tr: "Türkçe",
  es: "Español",
};

// Full name used when instructing the LLM which language to answer in.
export const LANGUAGE_PROMPT_NAME: Record<Language, string> = {
  en: "English",
  tr: "Turkish",
  es: "Spanish",
};

export interface Dictionary {
  nav: {
    tryIt: string;
    features: string;
    howItWorks: string;
    reviews: string;
    getEarlyAccess: string;
  };
  hero: {
    badge: string;
    headline1: string;
    headline2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    mockDay: string;
    mockTitle: string;
    mockWeather: string;
    mockStops: [string, string, string];
  };
  stats: { value: string; label: string }[];
  tryDemo: {
    badge: string;
    title: string;
    subtitle: string;
    whereTo: string;
    placeholder: string;
    pace: string;
    interests: string;
    optional: string;
    generateButton: string;
    loadingButton: string;
    groundedIn: (n: number) => string;
    why: string;
  };
  features: {
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  howItWorks: {
    title: string;
    steps: { title: string; description: string }[];
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: { location: string; quote: string }[];
  };
  cta: {
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    button: string;
  };
  footer: {
    tagline: (year: number) => string;
  };
  options: {
    companions: { solo: string; couple: string; family: string; friends: string };
    pace: { relaxed: string; balanced: string; intensive: string };
    transport: { walking: string; transit: string; car: string };
    interests: {
      Food: string;
      History: string;
      Art: string;
      Nature: string;
      Nightlife: string;
      Shopping: string;
    };
  };
  wizard: {
    destinationTitle: string;
    destinationSubtitle: string;
    destinationPlaceholder: string;
    accommodationTitle: string;
    accommodationSubtitle: string;
    accommodationPlaceholder: string;
    optional: string;
    datesTitle: string;
    datesSubtitle: (horizonDays: number) => string;
    startLabel: string;
    endLabel: string;
    daysInDestination: (days: number, destination: string) => string;
    companionsTitle: string;
    companionsSubtitle: string;
    transportTitle: string;
    transportSubtitle: string;
    paceTitle: string;
    paceSubtitle: string;
    interestsTitle: string;
    interestsSubtitle: string;
    back: string;
    next: string;
    buildTrip: string;
    stepsLeft: (n: number) => string;
    checkingPlace: string;
    placeFound: (name: string) => string;
    placeFuzzy: (name: string) => string;
    placeNotFound: string;
    placeNotFoundOverridden: string;
    continueAnyway: string;
    tokensLeft: (n: number) => string;
    unlimitedTokens: string;
    noTokensTitle: string;
    noTokensSubtitle: (resetDate: string) => string;
    upgradeCta: string;
    signInTitle: string;
    signInSubtitle: string;
    signInCta: string;
  };
  loading: {
    title: string;
    subtitle: (destination: string) => string;
  };
  results: {
    dayTrip: (n: number) => string;
    groundedIn: (n: number) => string;
    day: (n: number) => string;
    why: string;
    planAnother: string;
    aiEstimate: string;
  };
  chat: {
    greeting: string;
    headerTitle: string;
    headerSubtitle: string;
    placeholder: string;
    thinking: string;
    openLabel: string;
    closeLabel: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    passwordHint: string;
    loginButton: string;
    signupButton: string;
    loggingIn: string;
    signingUp: string;
    noAccount: string;
    haveAccount: string;
    signupLink: string;
    loginLink: string;
    logout: string;
    account: string;
  };
  pricing: {
    navLabel: string;
    title: string;
    subtitle: string;
    standardName: string;
    standardPrice: string;
    standardTagline: string;
    proName: string;
    proPrice: string;
    proTagline: string;
    betaNote: string;
    ctaStandard: string;
    ctaPro: string;
    currentPlanBadge: string;
    features: {
      dayAllowance: string;
      unlimitedDays: string;
      tripBuilder: string;
      weather: string;
      map: string;
      chat: string;
      aiRatings: string;
      languages: string;
      tripLength: string;
      longerTrips: string;
      prioritySupport: string;
    };
  };
  account: {
    title: string;
    planLabel: string;
    standardPlan: string;
    proPlan: string;
    tokensLeft: (n: number) => string;
    unlimitedTokens: string;
    resetsOn: (date: string) => string;
    upgradeButton: string;
    downgradeButton: string;
    viewPricing: string;
  };
}

const en: Dictionary = {
  nav: {
    tryIt: "Try it",
    features: "Features",
    howItWorks: "How it works",
    reviews: "Reviews",
    getEarlyAccess: "Get early access",
  },
  hero: {
    badge: "Now onboarding early access travelers",
    headline1: "Your smartest travel companion,",
    headline2: "from planning to exploring.",
    subtitle:
      "VoyageAI turns maps, reviews, weather, and transit into one itinerary that actually fits your trip, optimized in seconds and rebuilt on the fly whenever your day changes.",
    ctaPrimary: "Plan my trip",
    ctaSecondary: "See how it works",
    mockDay: "Day 2 · Paris",
    mockTitle: "Rebuilt for afternoon rain",
    mockWeather: "62°F, rain after 2pm",
    mockStops: [
      "9:00 AM — Seine River walk before the crowds arrive",
      "1:30 PM — Musée d'Orsay, moved up to dodge the rain window",
      "7:15 PM — Eiffel Tower at sunset, once the sky clears",
    ],
  },
  stats: [
    { value: "190+", label: "countries & territories mapped" },
    { value: "10M+", label: "attractions, eats & hidden gems indexed" },
    { value: "38%", label: "less backtracking than a hand-built plan" },
    { value: "4.9/5", label: "avg. rating from early access testers" },
  ],
  tryDemo: {
    badge: "Live demo, powered by GPT via fal.ai",
    title: "See it think.",
    subtitle: "Type a destination. Watch VoyageAI build a day and explain every decision, live.",
    whereTo: "Where to?",
    placeholder: "Kyoto, Marrakech, Reykjavík…",
    pace: "Pace",
    interests: "Interests",
    optional: "(optional)",
    generateButton: "Generate my day",
    loadingButton: "Planning your day…",
    groundedIn: (n) => `Grounded in ${n} real nearby places via OpenTripMap`,
    why: "Why",
  },
  features: {
    title: "Every travel question, answered before you ask it",
    subtitle:
      "Not just a list of attractions, a plan that understands opening hours, weather, crowds, and how tired you'll be by 4pm.",
    items: [
      {
        title: "Intelligent Trip Builder",
        description:
          "Tell it your dates, budget, pace, and interests. Get a full day-by-day itinerary in seconds, not hours of tab-switching.",
      },
      {
        title: "AI Route Optimization",
        description:
          "Every day is sequenced to cut dead travel time, respecting opening hours, meal windows, and your walking tolerance.",
      },
      {
        title: "Dynamic Weather Planning",
        description:
          "Rain rolling in at 2pm? Outdoor stops swap for museums and covered markets automatically, no manual replanning.",
      },
      {
        title: "Crowd Prediction",
        description:
          'Know before you go: "Visit before 9am to skip the queue" beats finding out after you\'ve waited an hour.',
      },
      {
        title: "Restaurant Intelligence",
        description:
          "Picks meals by distance, price, dietary needs, and wait time, not just star rating, so lunch fits the day instead of derailing it.",
      },
      {
        title: "Explainable AI",
        description:
          "Every recommendation comes with a reason: why this spot, why this time, why this order. No black-box scheduling.",
      },
      {
        title: "Built for how you actually travel",
        description:
          "Solo, couple, family, or friend group, relaxed or intensive pace, VoyageAI adjusts the whole plan around you.",
      },
      {
        title: "Sustainability Mode",
        description:
          "Prefer walking, cycling, and transit routes with a lower footprint, and see the estimated carbon impact of your trip.",
      },
    ],
  },
  howItWorks: {
    title: "From idea to itinerary in three steps",
    steps: [
      {
        title: "Tell us about your trip",
        description:
          "Destination, dates, budget, who's coming, and how you like to move through a city.",
      },
      {
        title: "Get an optimized itinerary",
        description:
          "VoyageAI builds a day-by-day plan, sequenced for minimal backtracking and maximum enjoyment.",
      },
      {
        title: "Adapt on the go",
        description:
          "Skip a stop, run late, or hit bad weather, the plan recalculates instantly instead of falling apart.",
      },
    ],
  },
  testimonials: {
    title: "What early access testers are saying",
    subtitle: "A first look from the small group of travelers piloting VoyageAI ahead of public launch.",
    items: [
      {
        location: "Early access tester, Rome trip",
        quote:
          "It rescheduled our whole afternoon around a rain forecast before I even noticed clouds rolling in. First planner that felt like it was actually paying attention.",
      },
      {
        location: "Early access tester, Tokyo trip",
        quote:
          "The crowd timing tips alone saved us two hours of queueing. Told us to hit the market at 8am instead of 11, and it was right.",
      },
      {
        location: "Early access tester, Lisbon trip",
        quote:
          "I liked that it explained why each stop was scheduled when it was. Made it easy to trust the plan instead of second-guessing every stop.",
      },
    ],
  },
  cta: {
    title: "Be first in line when VoyageAI launches",
    subtitle: "Join the early access list and help shape the smartest travel planner on the web.",
    emailPlaceholder: "you@example.com",
    button: "Join the waitlist",
  },
  footer: {
    tagline: (year) => `© ${year} VoyageAI. Working title, product in development.`,
  },
  options: {
    companions: { solo: "Solo", couple: "Couple", family: "Family", friends: "Friends" },
    pace: { relaxed: "Relaxed", balanced: "Balanced", intensive: "Intensive" },
    transport: { walking: "Walking", transit: "Public transit", car: "Car" },
    interests: {
      Food: "Food",
      History: "History",
      Art: "Art",
      Nature: "Nature",
      Nightlife: "Nightlife",
      Shopping: "Shopping",
    },
  },
  wizard: {
    destinationTitle: "Where are we going?",
    destinationSubtitle:
      "Tell VoyageAI the shape of your trip. Get a full day-by-day plan, built and explained in one pass.",
    destinationPlaceholder: "Kyoto, Marrakech, Reykjavík…",
    accommodationTitle: "Where are you staying?",
    accommodationSubtitle:
      "Helps VoyageAI keep each day's stops close to your base instead of criss-crossing the whole city.",
    accommodationPlaceholder: "Neighborhood or hotel name…",
    optional: "Optional",
    datesTitle: "When are you going?",
    datesSubtitle: (horizonDays) =>
      `Pick real dates. VoyageAI adapts each day to the actual forecast, so trips are capped to the next ${horizonDays} days — as far out as weather forecasting (and weather-aware replanning) reliably goes.`,
    startLabel: "Start",
    endLabel: "End",
    daysInDestination: (days, destination) =>
      `${days} ${days === 1 ? "day" : "days"} in ${destination || "your destination"}`,
    companionsTitle: "Who's traveling?",
    companionsSubtitle: "VoyageAI adjusts the whole plan around who's coming.",
    transportTitle: "How will you get around?",
    transportSubtitle:
      "This changes how stops get chosen and sequenced — on foot favors stops close together, transit favors well-connected spots, driving accounts for traffic.",
    paceTitle: "What pace feels right?",
    paceSubtitle: "Relaxed leaves room to breathe; intensive packs in as much as possible.",
    interestsTitle: "Anything you're into?",
    interestsSubtitle: "Optional — pick as many as you like, or skip this one.",
    back: "Back",
    next: "Next",
    buildTrip: "Build my trip",
    stepsLeft: (n) => (n <= 0 ? "Last question" : n === 1 ? "1 question left" : `${n} questions left`),
    checkingPlace: "Checking…",
    placeFound: (name) => `Found: ${name}`,
    placeFuzzy: (name) => `Closest match: ${name} — not an exact match`,
    placeNotFound: "Couldn't find this place. Double-check the spelling.",
    placeNotFoundOverridden: "Continuing without verifying this place.",
    continueAnyway: "Continue anyway",
    tokensLeft: (n) => (n === 1 ? "1 free trip-day left this month" : `${n} free trip-days left this month`),
    unlimitedTokens: "Unlimited trip-days (Pro)",
    noTokensTitle: "You're out of free trip-days",
    noTokensSubtitle: (resetDate) =>
      `Your free days refill on ${resetDate}, or upgrade to Pro for unlimited planning right now.`,
    upgradeCta: "Upgrade to Pro",
    signInTitle: "Sign in to build a trip",
    signInSubtitle: "Free accounts get 3 trip-days a month — no card required.",
    signInCta: "Sign in or create an account",
  },
  loading: {
    title: "Your trip is being planned…",
    subtitle: (destination) =>
      `This can take a minute — VoyageAI is reasoning through real nearby places for ${destination || "your destination"}, not just picking from a template.`,
  },
  results: {
    dayTrip: (n) => `${n}-day trip`,
    groundedIn: (n) => `Grounded in ${n} real nearby places via OpenTripMap`,
    day: (n) => `Day ${n}`,
    why: "Why",
    planAnother: "Plan another trip",
    aiEstimate: "AI estimate, not a live review score",
  },
  chat: {
    greeting:
      'Hi! I\'m the VoyageAI assistant. Ask me what VoyageAI is, how it works, or anything travel-planning related — or hit "Plan my trip" to build a real itinerary.',
    headerTitle: "VoyageAI Assistant",
    headerSubtitle: "Ask about the app or travel planning",
    placeholder: "Ask something…",
    thinking: "Thinking…",
    openLabel: "Open chat",
    closeLabel: "Close chat",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to keep planning.",
    signupTitle: "Create your free account",
    signupSubtitle: "3 free trip-days a month, no card required.",
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordHint: "At least 8 characters.",
    loginButton: "Sign in",
    signupButton: "Create account",
    loggingIn: "Signing in…",
    signingUp: "Creating account…",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signupLink: "Sign up",
    loginLink: "Sign in",
    logout: "Log out",
    account: "Account",
  },
  pricing: {
    navLabel: "Pricing",
    title: "Simple, usage-based pricing",
    subtitle:
      "Start free. Upgrade only if you're planning more than a few trip-days a month.",
    standardName: "Standard",
    standardPrice: "Free",
    standardTagline: "For occasional trips.",
    proName: "Pro",
    proPrice: "Free during beta",
    proTagline: "For frequent travelers who don't want to count days.",
    betaNote: "VoyageAI is in beta — Pro is free for now, no card required. Real pricing lands later.",
    ctaStandard: "Get started free",
    ctaPro: "Upgrade to Pro",
    currentPlanBadge: "Your current plan",
    features: {
      dayAllowance: "3 trip-days per month",
      unlimitedDays: "Unlimited trip-days",
      tripBuilder: "AI trip builder",
      weather: "Weather-aware planning",
      map: "Interactive stop map",
      chat: "VoyageAI chat assistant",
      aiRatings: "AI place-quality estimates",
      languages: "English, Turkish & Spanish",
      tripLength: "Trips up to 3 days",
      longerTrips: "Trips up to 7 days",
      prioritySupport: "Priority support",
    },
  },
  account: {
    title: "Your account",
    planLabel: "Plan",
    standardPlan: "Standard",
    proPlan: "Pro",
    tokensLeft: (n) => (n === 1 ? "1 trip-day left" : `${n} trip-days left`),
    unlimitedTokens: "Unlimited trip-days",
    resetsOn: (date) => `Refills on ${date}`,
    upgradeButton: "Upgrade to Pro",
    downgradeButton: "Switch back to Standard",
    viewPricing: "Compare plans",
  },
};

const tr: Dictionary = {
  nav: {
    tryIt: "Deneyin",
    features: "Özellikler",
    howItWorks: "Nasıl çalışır",
    reviews: "Yorumlar",
    getEarlyAccess: "Erken erişim al",
  },
  hero: {
    badge: "Şu anda erken erişim gezginleri kabul ediyoruz",
    headline1: "En akıllı seyahat arkadaşınız,",
    headline2: "planlamadan keşfetmeye kadar.",
    subtitle:
      "VoyageAI; haritaları, yorumları, hava durumunu ve ulaşımı tek bir gezi planında birleştirir — saniyeler içinde optimize eder ve gününüz değiştiğinde anında yeniden düzenler.",
    ctaPrimary: "Gezimi planla",
    ctaSecondary: "Nasıl çalıştığını gör",
    mockDay: "2. Gün · Paris",
    mockTitle: "Öğleden sonra yağmuruna göre yeniden düzenlendi",
    mockWeather: "17°C, saat 14:00'ten sonra yağmur",
    mockStops: [
      "09:00 — Kalabalık gelmeden Seine Nehri kıyısında yürüyüş",
      "13:30 — Musée d'Orsay, yağmur öncesine alındı",
      "19:15 — Gökyüzü açıldığında gün batımında Eyfel Kulesi",
    ],
  },
  stats: [
    { value: "190+", label: "haritalanan ülke ve bölge" },
    { value: "10M+", label: "kataloglanmış mekan, lezzet ve saklı hazine" },
    { value: "%38", label: "elle hazırlanan plana göre daha az geri dönüş" },
    { value: "4,9/5", label: "erken erişim test kullanıcılarının ortalama puanı" },
  ],
  tryDemo: {
    badge: "Canlı demo, fal.ai üzerinden GPT ile çalışıyor",
    title: "Düşünürken izleyin.",
    subtitle: "Bir şehir yazın. VoyageAI'nin bir günü nasıl kurguladığını ve her kararı nasıl açıkladığını canlı izleyin.",
    whereTo: "Nereye?",
    placeholder: "Kyoto, Marakeş, Reykjavík…",
    pace: "Tempo",
    interests: "İlgi alanları",
    optional: "(opsiyonel)",
    generateButton: "Günümü oluştur",
    loadingButton: "Gününüz planlanıyor…",
    groundedIn: (n) => `OpenTripMap üzerinden ${n} gerçek yakın mekana dayandırıldı`,
    why: "Neden",
  },
  features: {
    title: "Sormadan önce her seyahat sorusunun cevabı hazır",
    subtitle:
      "Sadece bir gezilecek yer listesi değil — açılış saatlerini, hava durumunu, kalabalığı ve saat 16:00'da ne kadar yorgun olacağınızı anlayan bir plan.",
    items: [
      {
        title: "Akıllı Gezi Oluşturucu",
        description:
          "Tarihlerinizi, bütçenizi, temponuzu ve ilgi alanlarınızı söyleyin. Saatler süren sekme değiştirme yerine saniyeler içinde eksiksiz bir günlük plan alın.",
      },
      {
        title: "Yapay Zeka ile Rota Optimizasyonu",
        description:
          "Her gün, açılış saatlerine, yemek vakitlerine ve yürüme toleransınıza uygun şekilde gereksiz yolculuğu azaltacak sırayla düzenlenir.",
      },
      {
        title: "Dinamik Hava Durumu Planlaması",
        description:
          "Saat 14:00'te yağmur mu geliyor? Açık hava durakları otomatik olarak müze ve kapalı pazarlarla değişir, elle yeniden planlama gerekmez.",
      },
      {
        title: "Kalabalık Tahmini",
        description:
          '"Kuyruğu atlamak için saat 09:00\'dan önce ziyaret edin" bilgisini önceden bilmek, bir saat bekledikten sonra öğrenmekten çok daha iyidir.',
      },
      {
        title: "Restoran Zekası",
        description:
          "Yemekleri sadece yıldız puanına göre değil; mesafe, fiyat, beslenme ihtiyaçları ve bekleme süresine göre seçer, böylece öğle yemeği günü bozmak yerine tamamlar.",
      },
      {
        title: "Açıklanabilir Yapay Zeka",
        description:
          "Her öneri bir nedenle gelir: neden bu mekan, neden bu saat, neden bu sıra. Kara kutu planlama yok.",
      },
      {
        title: "Nasıl seyahat ettiğinize göre tasarlandı",
        description:
          "Tek başına, çift, aile ya da arkadaş grubu; rahat ya da yoğun tempo — VoyageAI tüm planı size göre ayarlar.",
      },
      {
        title: "Sürdürülebilirlik Modu",
        description:
          "Daha düşük etkili yürüme, bisiklet ve toplu taşıma rotalarını tercih edin ve gezinizin tahmini karbon etkisini görün.",
      },
    ],
  },
  howItWorks: {
    title: "Fikirden gezi planına üç adımda",
    steps: [
      {
        title: "Gezinizi bize anlatın",
        description:
          "Varış noktası, tarihler, bütçe, kimlerin geleceği ve bir şehirde nasıl dolaşmayı sevdiğiniz.",
      },
      {
        title: "Optimize edilmiş bir gezi planı alın",
        description:
          "VoyageAI, en az geri dönüş ve en yüksek keyif için sıralanmış günlük bir plan oluşturur.",
      },
      {
        title: "Yolda uyum sağlayın",
        description:
          "Bir durağı atlayın, geç kalın ya da kötü havayla karşılaşın — plan bozulmak yerine anında yeniden hesaplanır.",
      },
    ],
  },
  testimonials: {
    title: "Erken erişim test kullanıcıları neler diyor",
    subtitle: "Genel lansmandan önce VoyageAI'yi deneyen küçük gezgin grubundan ilk izlenimler.",
    items: [
      {
        location: "Erken erişim test kullanıcısı, Roma gezisi",
        quote:
          "Bulutların toplandığını fark etmeden önce, yağmur tahminine göre tüm öğleden sonramızı yeniden düzenledi. Gerçekten dikkat ediyormuş gibi hissettiren ilk planlayıcı.",
      },
      {
        location: "Erken erişim test kullanıcısı, Tokyo gezisi",
        quote:
          "Sadece kalabalık zamanlama ipuçları bile bize iki saat kuyruk beklemesinden kurtardı. Pazara 11 yerine 08:00'de gitmemizi söyledi ve haklı çıktı.",
      },
      {
        location: "Erken erişim test kullanıcısı, Lizbon gezisi",
        quote:
          "Her durağın neden o saatte planlandığını açıklamasını sevdim. Her durağı sorgulamak yerine plana güvenmeyi kolaylaştırdı.",
      },
    ],
  },
  cta: {
    title: "VoyageAI yayınlandığında ilk sırada olun",
    subtitle: "Erken erişim listesine katılın ve web'in en akıllı gezi planlayıcısını şekillendirmeye yardım edin.",
    emailPlaceholder: "siz@ornek.com",
    button: "Bekleme listesine katıl",
  },
  footer: {
    tagline: (year) => `© ${year} VoyageAI. Çalışma adı, ürün geliştirme aşamasında.`,
  },
  options: {
    companions: { solo: "Tek başına", couple: "Çift", family: "Aile", friends: "Arkadaşlar" },
    pace: { relaxed: "Rahat", balanced: "Dengeli", intensive: "Yoğun" },
    transport: { walking: "Yürüyerek", transit: "Toplu taşıma", car: "Araba" },
    interests: {
      Food: "Yemek",
      History: "Tarih",
      Art: "Sanat",
      Nature: "Doğa",
      Nightlife: "Gece hayatı",
      Shopping: "Alışveriş",
    },
  },
  wizard: {
    destinationTitle: "Nereye gidiyoruz?",
    destinationSubtitle:
      "Gezinizin şeklini VoyageAI'ye anlatın. Tek seferde oluşturulmuş ve açıklanmış eksiksiz bir günlük plan alın.",
    destinationPlaceholder: "Kyoto, Marakeş, Reykjavík…",
    accommodationTitle: "Nerede konaklıyorsunuz?",
    accommodationSubtitle:
      "VoyageAI'nin her günün duraklarını tüm şehri arşınlamak yerine kaldığınız yere yakın tutmasına yardımcı olur.",
    accommodationPlaceholder: "Semt veya otel adı…",
    optional: "Opsiyonel",
    datesTitle: "Ne zaman gidiyorsunuz?",
    datesSubtitle: (horizonDays) =>
      `Gerçek tarihler seçin. VoyageAI her günü gerçek hava durumu tahminine göre uyarlar, bu yüzden geziler önümüzdeki ${horizonDays} günle sınırlıdır — hava durumu tahmininin (ve hava durumuna duyarlı yeniden planlamanın) güvenilir şekilde ulaşabildiği en uzak nokta budur.`,
    startLabel: "Başlangıç",
    endLabel: "Bitiş",
    daysInDestination: (days, destination) =>
      `${destination || "hedefinizde"} ${days} gün`,
    companionsTitle: "Kimlerle seyahat ediyorsunuz?",
    companionsSubtitle: "VoyageAI tüm planı kimlerin geldiğine göre ayarlar.",
    transportTitle: "Nasıl ulaşım sağlayacaksınız?",
    transportSubtitle:
      "Bu, durakların nasıl seçilip sıralandığını değiştirir — yürüyüş birbirine yakın durakları, toplu taşıma iyi bağlantılı yerleri, araba ise trafiği hesaba katar.",
    paceTitle: "Hangi tempo size uygun?",
    paceSubtitle: "Rahat tempo nefes almaya alan bırakır; yoğun tempo mümkün olduğunca çok şey sığdırır.",
    interestsTitle: "İlginizi çeken bir şey var mı?",
    interestsSubtitle: "Opsiyonel — istediğiniz kadar seçin ya da bu adımı atlayın.",
    back: "Geri",
    next: "İleri",
    buildTrip: "Gezimi oluştur",
    stepsLeft: (n) => (n <= 0 ? "Son soru" : n === 1 ? "1 soru kaldı" : `${n} soru kaldı`),
    checkingPlace: "Kontrol ediliyor…",
    placeFound: (name) => `Bulundu: ${name}`,
    placeFuzzy: (name) => `En yakın eşleşme: ${name} — tam olarak eşleşmiyor`,
    placeNotFound: "Bu yer bulunamadı. Yazımı kontrol edin.",
    placeNotFoundOverridden: "Bu yer doğrulanmadan devam ediliyor.",
    continueAnyway: "Yine de devam et",
    tokensLeft: (n) => (n === 1 ? "Bu ay 1 ücretsiz gezi günü kaldı" : `Bu ay ${n} ücretsiz gezi günü kaldı`),
    unlimitedTokens: "Sınırsız gezi günü (Pro)",
    noTokensTitle: "Ücretsiz gezi gününüz kalmadı",
    noTokensSubtitle: (resetDate) =>
      `Ücretsiz günleriniz ${resetDate} tarihinde yenilenecek, ya da hemen Pro'ya geçerek sınırsız planlama yapabilirsiniz.`,
    upgradeCta: "Pro'ya geç",
    signInTitle: "Gezi oluşturmak için giriş yapın",
    signInSubtitle: "Ücretsiz hesaplar ayda 3 gezi günü kazanır — kredi kartı gerekmez.",
    signInCta: "Giriş yap veya hesap oluştur",
  },
  loading: {
    title: "Geziniz planlanıyor…",
    subtitle: (destination) =>
      `Bu bir dakika sürebilir — VoyageAI, ${destination || "hedefiniz"} için sadece bir şablondan seçmek yerine gerçek yakın mekanlar üzerinden akıl yürütüyor.`,
  },
  results: {
    dayTrip: (n) => `${n} günlük gezi`,
    groundedIn: (n) => `OpenTripMap üzerinden ${n} gerçek yakın mekana dayandırıldı`,
    day: (n) => `${n}. Gün`,
    why: "Neden",
    planAnother: "Başka bir gezi planla",
    aiEstimate: "Yapay zeka tahmini, gerçek yorum puanı değil",
  },
  chat: {
    greeting:
      'Merhaba! Ben VoyageAI asistanıyım. VoyageAI\'nin ne olduğunu, nasıl çalıştığını ya da seyahat planlamasıyla ilgili herhangi bir şeyi sorabilirsiniz — ya da gerçek bir gezi planı oluşturmak için "Gezimi planla"ya tıklayın.',
    headerTitle: "VoyageAI Asistanı",
    headerSubtitle: "Uygulama veya seyahat planlaması hakkında sorun",
    placeholder: "Bir şey sorun…",
    thinking: "Düşünüyor…",
    openLabel: "Sohbeti aç",
    closeLabel: "Sohbeti kapat",
  },
  auth: {
    loginTitle: "Tekrar hoş geldiniz",
    loginSubtitle: "Planlamaya devam etmek için giriş yapın.",
    signupTitle: "Ücretsiz hesabınızı oluşturun",
    signupSubtitle: "Ayda 3 ücretsiz gezi günü, kredi kartı gerekmez.",
    emailLabel: "E-posta",
    passwordLabel: "Şifre",
    passwordHint: "En az 8 karakter.",
    loginButton: "Giriş yap",
    signupButton: "Hesap oluştur",
    loggingIn: "Giriş yapılıyor…",
    signingUp: "Hesap oluşturuluyor…",
    noAccount: "Hesabınız yok mu?",
    haveAccount: "Zaten hesabınız var mı?",
    signupLink: "Kayıt ol",
    loginLink: "Giriş yap",
    logout: "Çıkış yap",
    account: "Hesap",
  },
  pricing: {
    navLabel: "Fiyatlandırma",
    title: "Basit, kullanıma dayalı fiyatlandırma",
    subtitle: "Ücretsiz başlayın. Ayda birkaç gezi gününden fazlasını planlıyorsanız yükseltin.",
    standardName: "Standart",
    standardPrice: "Ücretsiz",
    standardTagline: "Ara sıra seyahat edenler için.",
    proName: "Pro",
    proPrice: "Beta sürecinde ücretsiz",
    proTagline: "Günleri saymak istemeyen sık gezginler için.",
    betaNote: "VoyageAI beta aşamasında — Pro şu anlık ücretsiz, kredi kartı gerekmez. Gerçek fiyatlandırma daha sonra gelecek.",
    ctaStandard: "Ücretsiz başla",
    ctaPro: "Pro'ya geç",
    currentPlanBadge: "Mevcut planınız",
    features: {
      dayAllowance: "Ayda 3 gezi günü",
      unlimitedDays: "Sınırsız gezi günü",
      tripBuilder: "Yapay zeka gezi oluşturucu",
      weather: "Hava durumuna duyarlı planlama",
      map: "İnteraktif durak haritası",
      chat: "VoyageAI sohbet asistanı",
      aiRatings: "Yapay zeka mekan kalite tahminleri",
      languages: "İngilizce, Türkçe ve İspanyolca",
      tripLength: "3 güne kadar geziler",
      longerTrips: "7 güne kadar geziler",
      prioritySupport: "Öncelikli destek",
    },
  },
  account: {
    title: "Hesabınız",
    planLabel: "Plan",
    standardPlan: "Standart",
    proPlan: "Pro",
    tokensLeft: (n) => (n === 1 ? "1 gezi günü kaldı" : `${n} gezi günü kaldı`),
    unlimitedTokens: "Sınırsız gezi günü",
    resetsOn: (date) => `${date} tarihinde yenilenir`,
    upgradeButton: "Pro'ya geç",
    downgradeButton: "Standart'a geri dön",
    viewPricing: "Planları karşılaştır",
  },
};

const es: Dictionary = {
  nav: {
    tryIt: "Pruébalo",
    features: "Funciones",
    howItWorks: "Cómo funciona",
    reviews: "Opiniones",
    getEarlyAccess: "Acceso anticipado",
  },
  hero: {
    badge: "Ahora aceptando viajeros de acceso anticipado",
    headline1: "Tu compañero de viaje más inteligente,",
    headline2: "desde la planificación hasta la exploración.",
    subtitle:
      "VoyageAI convierte mapas, reseñas, el clima y el transporte en un itinerario que realmente encaja con tu viaje, optimizado en segundos y reconstruido al instante si tu día cambia.",
    ctaPrimary: "Planear mi viaje",
    ctaSecondary: "Ver cómo funciona",
    mockDay: "Día 2 · París",
    mockTitle: "Reorganizado por lluvia por la tarde",
    mockWeather: "17°C, lluvia después de las 14:00",
    mockStops: [
      "9:00 — Paseo por el Sena antes de que lleguen las multitudes",
      "13:30 — Museo de Orsay, adelantado para evitar la lluvia",
      "19:15 — Torre Eiffel al atardecer, cuando el cielo se despeje",
    ],
  },
  stats: [
    { value: "190+", label: "países y territorios mapeados" },
    { value: "10M+", label: "atracciones, restaurantes y joyas ocultas indexados" },
    { value: "38%", label: "menos idas y vueltas que un plan hecho a mano" },
    { value: "4.9/5", label: "valoración media de los probadores de acceso anticipado" },
  ],
  tryDemo: {
    badge: "Demo en vivo, con GPT a través de fal.ai",
    title: "Míralo pensar.",
    subtitle: "Escribe un destino. Mira a VoyageAI construir un día y explicar cada decisión, en vivo.",
    whereTo: "¿A dónde?",
    placeholder: "Kioto, Marrakech, Reikiavik…",
    pace: "Ritmo",
    interests: "Intereses",
    optional: "(opcional)",
    generateButton: "Generar mi día",
    loadingButton: "Planeando tu día…",
    groundedIn: (n) => `Basado en ${n} lugares reales cercanos vía OpenTripMap`,
    why: "Por qué",
  },
  features: {
    title: "Cada pregunta de viaje, respondida antes de que la hagas",
    subtitle:
      "No solo una lista de atracciones, sino un plan que entiende horarios de apertura, clima, multitudes y lo cansado que estarás a las 4pm.",
    items: [
      {
        title: "Creador Inteligente de Viajes",
        description:
          "Dile tus fechas, presupuesto, ritmo e intereses. Obtén un itinerario completo día a día en segundos, no horas cambiando de pestaña.",
      },
      {
        title: "Optimización de Ruta con IA",
        description:
          "Cada día se organiza para reducir el tiempo de traslado muerto, respetando horarios de apertura, horarios de comida y tu tolerancia a caminar.",
      },
      {
        title: "Planificación Dinámica según el Clima",
        description:
          "¿Lluvia a las 2pm? Las paradas al aire libre se cambian automáticamente por museos y mercados cubiertos, sin replanificar manualmente.",
      },
      {
        title: "Predicción de Multitudes",
        description:
          'Saberlo antes de ir: "visita antes de las 9am para evitar la cola" es mejor que descubrirlo tras esperar una hora.',
      },
      {
        title: "Inteligencia de Restaurantes",
        description:
          "Elige comidas por distancia, precio, necesidades dietéticas y tiempo de espera, no solo la calificación, para que el almuerzo encaje en el día en vez de descarrilarlo.",
      },
      {
        title: "IA Explicable",
        description:
          "Cada recomendación viene con una razón: por qué este lugar, por qué esta hora, por qué este orden. Sin programación de caja negra.",
      },
      {
        title: "Hecho para cómo viajas de verdad",
        description:
          "Solo, en pareja, en familia o con amigos, ritmo relajado o intenso — VoyageAI ajusta todo el plan a ti.",
      },
      {
        title: "Modo de Sostenibilidad",
        description:
          "Prefiere rutas a pie, en bici o en transporte público con menor huella, y consulta el impacto de carbono estimado de tu viaje.",
      },
    ],
  },
  howItWorks: {
    title: "De la idea al itinerario en tres pasos",
    steps: [
      {
        title: "Cuéntanos sobre tu viaje",
        description:
          "Destino, fechas, presupuesto, quién viene y cómo te gusta moverte por una ciudad.",
      },
      {
        title: "Obtén un itinerario optimizado",
        description:
          "VoyageAI construye un plan día a día, organizado para minimizar idas y vueltas y maximizar el disfrute.",
      },
      {
        title: "Adáptate sobre la marcha",
        description:
          "Sáltate una parada, llega tarde o encuéntrate con mal tiempo — el plan se recalcula al instante en lugar de desmoronarse.",
      },
    ],
  },
  testimonials: {
    title: "Lo que dicen los probadores de acceso anticipado",
    subtitle: "Una primera mirada del pequeño grupo de viajeros probando VoyageAI antes del lanzamiento público.",
    items: [
      {
        location: "Probador de acceso anticipado, viaje a Roma",
        quote:
          "Reorganizó toda nuestra tarde según un pronóstico de lluvia antes de que notáramos las nubes acercarse. El primer planificador que realmente parecía prestar atención.",
      },
      {
        location: "Probador de acceso anticipado, viaje a Tokio",
        quote:
          "Solo los consejos sobre las multitudes nos ahorraron dos horas de cola. Nos dijo que fuéramos al mercado a las 8am en vez de a las 11, y tenía razón.",
      },
      {
        location: "Probador de acceso anticipado, viaje a Lisboa",
        quote:
          "Me gustó que explicara por qué cada parada estaba programada a esa hora. Facilitó confiar en el plan en lugar de dudar de cada parada.",
      },
    ],
  },
  cta: {
    title: "Sé de los primeros cuando VoyageAI se lance",
    subtitle: "Únete a la lista de acceso anticipado y ayuda a dar forma al planificador de viajes más inteligente de la web.",
    emailPlaceholder: "tu@ejemplo.com",
    button: "Unirme a la lista de espera",
  },
  footer: {
    tagline: (year) => `© ${year} VoyageAI. Nombre provisional, producto en desarrollo.`,
  },
  options: {
    companions: { solo: "Solo/a", couple: "Pareja", family: "Familia", friends: "Amigos" },
    pace: { relaxed: "Relajado", balanced: "Equilibrado", intensive: "Intenso" },
    transport: { walking: "A pie", transit: "Transporte público", car: "Coche" },
    interests: {
      Food: "Gastronomía",
      History: "Historia",
      Art: "Arte",
      Nature: "Naturaleza",
      Nightlife: "Vida nocturna",
      Shopping: "Compras",
    },
  },
  wizard: {
    destinationTitle: "¿A dónde vamos?",
    destinationSubtitle:
      "Cuéntale a VoyageAI la forma de tu viaje. Obtén un plan completo día a día, creado y explicado de una sola vez.",
    destinationPlaceholder: "Kioto, Marrakech, Reikiavik…",
    accommodationTitle: "¿Dónde te alojas?",
    accommodationSubtitle:
      "Ayuda a VoyageAI a mantener las paradas de cada día cerca de tu base, en vez de cruzar toda la ciudad.",
    accommodationPlaceholder: "Barrio o nombre del hotel…",
    optional: "Opcional",
    datesTitle: "¿Cuándo viajas?",
    datesSubtitle: (horizonDays) =>
      `Elige fechas reales. VoyageAI adapta cada día al pronóstico real, así que los viajes se limitan a los próximos ${horizonDays} días — hasta donde llega de forma fiable la previsión meteorológica (y la replanificación según el clima).`,
    startLabel: "Inicio",
    endLabel: "Fin",
    daysInDestination: (days, destination) =>
      `${days} ${days === 1 ? "día" : "días"} en ${destination || "tu destino"}`,
    companionsTitle: "¿Quién viaja?",
    companionsSubtitle: "VoyageAI ajusta todo el plan según quién venga.",
    transportTitle: "¿Cómo te moverás?",
    transportSubtitle:
      "Esto cambia cómo se eligen y organizan las paradas — a pie favorece paradas cercanas entre sí, el transporte público favorece lugares bien conectados, conducir tiene en cuenta el tráfico.",
    paceTitle: "¿Qué ritmo te va mejor?",
    paceSubtitle: "Relajado deja espacio para respirar; intenso aprovecha al máximo cada día.",
    interestsTitle: "¿Algo que te interese?",
    interestsSubtitle: "Opcional — elige tantos como quieras, o salta este paso.",
    back: "Atrás",
    next: "Siguiente",
    buildTrip: "Crear mi viaje",
    stepsLeft: (n) => (n <= 0 ? "Última pregunta" : n === 1 ? "1 pregunta restante" : `${n} preguntas restantes`),
    checkingPlace: "Comprobando…",
    placeFound: (name) => `Encontrado: ${name}`,
    placeFuzzy: (name) => `Coincidencia más cercana: ${name} — no exacta`,
    placeNotFound: "No se encontró este lugar. Revisa la ortografía.",
    placeNotFoundOverridden: "Continuando sin verificar este lugar.",
    continueAnyway: "Continuar de todos modos",
    tokensLeft: (n) => (n === 1 ? "Queda 1 día de viaje gratis este mes" : `Quedan ${n} días de viaje gratis este mes`),
    unlimitedTokens: "Días de viaje ilimitados (Pro)",
    noTokensTitle: "Se acabaron tus días de viaje gratis",
    noTokensSubtitle: (resetDate) =>
      `Tus días gratis se renuevan el ${resetDate}, o mejora a Pro ahora mismo para planificar sin límites.`,
    upgradeCta: "Mejorar a Pro",
    signInTitle: "Inicia sesión para crear un viaje",
    signInSubtitle: "Las cuentas gratuitas obtienen 3 días de viaje al mes — sin tarjeta.",
    signInCta: "Inicia sesión o crea una cuenta",
  },
  loading: {
    title: "Tu viaje se está planeando…",
    subtitle: (destination) =>
      `Esto puede tardar un minuto — VoyageAI está razonando sobre lugares reales cercanos para ${destination || "tu destino"}, no solo eligiendo de una plantilla.`,
  },
  results: {
    dayTrip: (n) => `Viaje de ${n} días`,
    groundedIn: (n) => `Basado en ${n} lugares reales cercanos vía OpenTripMap`,
    day: (n) => `Día ${n}`,
    why: "Por qué",
    planAnother: "Planear otro viaje",
    aiEstimate: "Estimación de la IA, no una puntuación real",
  },
  chat: {
    greeting:
      '¡Hola! Soy el asistente de VoyageAI. Pregúntame qué es VoyageAI, cómo funciona, o cualquier cosa sobre planificación de viajes — o pulsa "Planear mi viaje" para crear un itinerario real.',
    headerTitle: "Asistente de VoyageAI",
    headerSubtitle: "Pregunta sobre la app o la planificación de viajes",
    placeholder: "Pregunta algo…",
    thinking: "Pensando…",
    openLabel: "Abrir chat",
    closeLabel: "Cerrar chat",
  },
  auth: {
    loginTitle: "Bienvenido de nuevo",
    loginSubtitle: "Inicia sesión para seguir planeando.",
    signupTitle: "Crea tu cuenta gratuita",
    signupSubtitle: "3 días de viaje gratis al mes, sin tarjeta.",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    passwordHint: "Al menos 8 caracteres.",
    loginButton: "Iniciar sesión",
    signupButton: "Crear cuenta",
    loggingIn: "Iniciando sesión…",
    signingUp: "Creando cuenta…",
    noAccount: "¿No tienes una cuenta?",
    haveAccount: "¿Ya tienes una cuenta?",
    signupLink: "Regístrate",
    loginLink: "Inicia sesión",
    logout: "Cerrar sesión",
    account: "Cuenta",
  },
  pricing: {
    navLabel: "Precios",
    title: "Precios simples, según el uso",
    subtitle: "Empieza gratis. Mejora solo si planeas más de unos pocos días de viaje al mes.",
    standardName: "Estándar",
    standardPrice: "Gratis",
    standardTagline: "Para viajes ocasionales.",
    proName: "Pro",
    proPrice: "Gratis durante la beta",
    proTagline: "Para viajeros frecuentes que no quieren contar días.",
    betaNote: "VoyageAI está en beta — Pro es gratis por ahora, sin tarjeta. El precio real llegará más adelante.",
    ctaStandard: "Empieza gratis",
    ctaPro: "Mejorar a Pro",
    currentPlanBadge: "Tu plan actual",
    features: {
      dayAllowance: "3 días de viaje al mes",
      unlimitedDays: "Días de viaje ilimitados",
      tripBuilder: "Creador de viajes con IA",
      weather: "Planificación según el clima",
      map: "Mapa interactivo de paradas",
      chat: "Asistente de chat de VoyageAI",
      aiRatings: "Estimaciones de calidad con IA",
      languages: "Inglés, turco y español",
      tripLength: "Viajes de hasta 3 días",
      longerTrips: "Viajes de hasta 7 días",
      prioritySupport: "Soporte prioritario",
    },
  },
  account: {
    title: "Tu cuenta",
    planLabel: "Plan",
    standardPlan: "Estándar",
    proPlan: "Pro",
    tokensLeft: (n) => (n === 1 ? "Queda 1 día de viaje" : `Quedan ${n} días de viaje`),
    unlimitedTokens: "Días de viaje ilimitados",
    resetsOn: (date) => `Se renueva el ${date}`,
    upgradeButton: "Mejorar a Pro",
    downgradeButton: "Volver a Estándar",
    viewPricing: "Comparar planes",
  },
};

export const dictionaries: Record<Language, Dictionary> = { en, tr, es };

export function resolveLanguage(value: unknown): Language {
  return value === "tr" || value === "es" ? value : "en";
}
