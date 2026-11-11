// Sample content so every section has something to show before real
// farms, organizers and sellers sign up. Everything here is labeled "Sample"
// on the site. These move to the database when the Portal is built.

export type Bloodline = { name: string; note?: string };
export type FarmData = { slug: string; name: string; province: string; city: string; about: string; ownerName: string; phone: string; facebook: string; bloodlines: Bloodline[]; verified: boolean; est: string };
export const FARMS: FarmData[] = [
  { slug: "bukid-malaya-gamefarm", name: "Bukid Malaya Gamefarm", province: "Batangas", city: "Lipa City", est: "2012", verified: true, ownerName: "Mario Reyes", phone: "0917 555 0142", facebook: "facebook.com/sabongcentral",
    about: "Family-run farm sa paanan ng Mt. Malarayat. Naka-focus kami sa malinis na bloodlines, tamang nutrition at maayos na farm records.",
    bloodlines: [{ name: "Sweater", note: "Pangunahing linya, 10+ taon na" }, { name: "Hatch" }, { name: "Kelso" }] },
  { slug: "tres-lomas-farm", name: "Tres Lomas Farm", province: "Batangas", city: "Rosario", est: "2015", verified: true, ownerName: "Ben Aquino", phone: "0918 220 4410", facebook: "facebook.com/sabongcentral",
    about: "Maliit pero maayos na farm sa Rosario. Open house tuwing huling Sabado ng buwan, by appointment.",
    bloodlines: [{ name: "Roundhead" }, { name: "Claret" }] },
  { slug: "kalye-mabini-breeders", name: "Kalye Mabini Breeders", province: "Batangas", city: "Tanauan City", est: "2018", verified: true, ownerName: "Jojo Mabini", phone: "0927 811 3301", facebook: "facebook.com/sabongcentral",
    about: "Breeders group sa Tanauan. Nagbabahagi kami ng tips sa feeding at conditioning para sa mga bagong breeders.",
    bloodlines: [{ name: "Lemon 84" }, { name: "Sweater" }] },
  { slug: "silangan-ridge-farm", name: "Silangan Ridge Farm", province: "Batangas", city: "Ibaan", est: "2019", verified: false, ownerName: "Carlo Dimaano", phone: "0915 640 2219", facebook: "facebook.com/sabongcentral",
    about: "Bagong farm sa Ibaan na naka-focus sa Kelso at Albany lines.",
    bloodlines: [{ name: "Kelso" }, { name: "Albany" }] },
  { slug: "dos-puno-gamefowl", name: "Dos Puno Gamefowl", province: "Batangas", city: "Sto. Tomas City", est: "2016", verified: true, ownerName: "Rey Castillo", phone: "0919 404 1180", facebook: "facebook.com/sabongcentral",
    about: "Farm na may dalawang malaking puno ng mangga sa gitna. Hatch at Grey lines.",
    bloodlines: [{ name: "McLean Hatch" }, { name: "Red Fox Grey" }] },
  { slug: "mataas-na-lupa-farm", name: "Mataas na Lupa Farm", province: "Batangas", city: "San Jose", est: "2021", verified: false, ownerName: "Nestor Ilagan", phone: "0916 552 7790", facebook: "facebook.com/sabongcentral",
    about: "Upland farm sa San Jose. Gilmore Hatch at Lemon 84.",
    bloodlines: [{ name: "Gilmore Hatch" }, { name: "Lemon 84" }] },
];


export type EventCat = [name: string, short: string, group: string, subs: string[]];
export const EVENT_CATS: EventCat[] = [
  [
    "Seminars",
    "Seminar",
    "Education & Training",
    [
      "Poultry Health",
      "Nutrition",
      "Breeding",
      "Farm Management",
      "Biosecurity"
    ]
  ],
  [
    "Workshops",
    "Workshop",
    "Education & Training",
    [
      "Incubation",
      "Chick Rearing",
      "Farm Setup",
      "Poultry First Aid"
    ]
  ],
  [
    "Training",
    "Training",
    "Education & Training",
    [
      "Farm Staff Training",
      "Poultry Handling",
      "Disease Prevention"
    ]
  ],
  [
    "Webinars",
    "Webinar",
    "Education & Training",
    [
      "Online Veterinary Talks",
      "Breeding Education",
      "Farm Business Classes"
    ]
  ],
  [
    "Expos & Exhibitions",
    "Expo",
    "Expos & Community",
    [
      "Poultry Expo",
      "Agricultural Trade Fair",
      "Equipment Showcase"
    ]
  ],
  [
    "Community Events",
    "Community",
    "Expos & Community",
    [
      "Breeders’ Meetups",
      "Farm Open Houses",
      "Community Gatherings"
    ]
  ],
  [
    "Derbies & Events",
    "Derby",
    "Derbies & Events",
    [
      "Derby",
      "Stag Derby",
      "Bullstag Derby",
      "Hackfight",
      "Invitational"
    ]
  ]
];

export const EVENT_GROUPS = ["Derbies & Events", "Education & Training", "Expos & Community"] as const;

export type SampleEvent = (typeof EVENTS)[number];
export const EVENTS = [
  {
    "slug": "biosecurity-para-sa-gamefarms",
    "title": "Biosecurity para sa Gamefarms",
    "cat": "Seminars",
    "sub": "Biosecurity",
    "group": "Education & Training",
    "derby": false,
    "date": "2026-11-29",
    "days": "Nov 29",
    "longDate": "Sun, Nov 29, 2026",
    "time": "9:00 AM – 12:00 NN",
    "province": "Batangas",
    "city": "Lipa City",
    "online": false,
    "venue": "Lipa City Hall Annex, Function Room B",
    "desc": "Half-day seminar kung paano iwasan ang sakit sa farm: quarantine ng bagong ibon, paglilinis ng pens at tamang pag-handle ng bisita.",
    "topics": "Quarantine, disinfection, visitor rules, bird flu awareness",
    "speakers": "Dr. [Vet name], DVM · Provincial Vet Office (invited)",
    "fee": "Free",
    "reg": "facebook.com/events/… (registration)",
    "permits": "LGU venue reservation on file",
    "org": "Batangas Poultry Vets"
  },
  {
    "slug": "incubation-hands-on-workshop",
    "title": "Incubation Hands-on Workshop",
    "cat": "Workshops",
    "sub": "Incubation",
    "group": "Education & Training",
    "derby": false,
    "date": "2026-12-06",
    "days": "Dec 6",
    "longDate": "Sun, Dec 6, 2026",
    "time": "1:00 PM – 5:00 PM",
    "province": "Batangas",
    "city": "Lipa City",
    "online": false,
    "venue": "Bukid Malaya Gamefarm, Brgy. Malaya",
    "desc": "Hands-on na pag-set up ng incubator, candling at hatch-day care. Limitado sa 20 participants.",
    "topics": "Incubator setup, humidity, candling, chick care day 1–7",
    "speakers": "Mario Reyes (Bukid Malaya Gamefarm)",
    "fee": "₱500 (kasama ang handouts at lunch)",
    "reg": "0917 555 0142 · text to register",
    "permits": "Not required (private farm)",
    "org": "Bukid Malaya Gamefarm"
  },
  {
    "slug": "batangas-poultry-expo-2026",
    "title": "Batangas Poultry Expo 2026",
    "cat": "Expos & Exhibitions",
    "sub": "Poultry Expo",
    "group": "Expos & Community",
    "derby": false,
    "date": "2026-12-12",
    "days": "Dec 12–13",
    "longDate": "Sat–Sun, Dec 12–13, 2026",
    "time": "9:00 AM – 6:00 PM",
    "province": "Batangas",
    "city": "Batangas City",
    "online": false,
    "venue": "Batangas City Sports Coliseum",
    "desc": "2-day expo ng feeds, supplements, equipment at farm services. May mini-talks bawat oras.",
    "topics": "Feeds, equipment showcase, vet booths, farm services",
    "speakers": "Various exhibitors",
    "fee": "Free",
    "reg": "batangaspoultryexpo.ph (sample)",
    "permits": "Venue and LGU event permit on file",
    "org": "Lipa Breeders Association"
  },
  {
    "slug": "ibaan-local-breeders-meetup",
    "title": "Ibaan Local Breeders Meetup",
    "cat": "Community Events",
    "sub": "Breeders’ Meetups",
    "group": "Expos & Community",
    "derby": false,
    "date": "2026-11-11",
    "days": "Nov 11",
    "longDate": "Wed, Nov 11, 2026",
    "time": "1:00 PM – 6:00 PM",
    "province": "Batangas",
    "city": "Ibaan",
    "online": false,
    "venue": "Ibaan Multi-purpose Hall",
    "desc": "Kwentuhan at palitan ng tips ng local breeders. Bring your own questions.",
    "topics": "Feeding tips, conditioning, farm records",
    "speakers": "Open forum",
    "fee": "Free",
    "reg": "Walk-in",
    "permits": "Barangay permit on file",
    "org": "Lipa Breeders Association"
  },
  {
    "slug": "online-vet-talk-sipon-at-respiratory-diseases",
    "title": "Online Vet Talk: Sipon at Respiratory Diseases",
    "cat": "Webinars",
    "sub": "Online Veterinary Talks",
    "group": "Education & Training",
    "derby": false,
    "date": "2026-12-17",
    "days": "Dec 17",
    "longDate": "Thu, Dec 17, 2026",
    "time": "7:00 PM – 8:00 PM",
    "province": "Online",
    "city": "Online",
    "online": true,
    "venue": "Online · Zoom link pagkatapos mag-register",
    "desc": "1-hour webinar tungkol sa sintomas, pag-iwas at kailan dapat tumawag ng beterinaryo.",
    "topics": "CRD, coryza, prevention, when to call a vet",
    "speakers": "Dr. [Vet name], DVM",
    "fee": "Free",
    "reg": "forms.gle/… (registration)",
    "permits": "Not required (online)",
    "org": "Batangas Poultry Vets"
  },
  {
    "slug": "farm-staff-training-poultry-handling",
    "title": "Farm Staff Training: Poultry Handling",
    "cat": "Training",
    "sub": "Poultry Handling",
    "group": "Education & Training",
    "derby": false,
    "date": "2027-01-16",
    "days": "Jan 16",
    "longDate": "Sat, Jan 16, 2027",
    "time": "8:00 AM – 12:00 NN",
    "province": "Batangas",
    "city": "Tanauan City",
    "online": false,
    "venue": "Sunrise Gamefarm Training Shed",
    "desc": "Training para sa farm helpers: tamang paghawak, pagbuhat, at pag-transport ng ibon nang walang stress.",
    "topics": "Handling, transport crates, record-keeping, hygiene",
    "speakers": "Rico Santos (Sunrise Gamefarm)",
    "fee": "₱300 per participant",
    "reg": "0919 404 7781",
    "permits": "Not required (private farm)",
    "org": "Sunrise Gamefarm"
  },
  {
    "slug": "batangas-invitational-derby",
    "title": "Batangas Invitational Derby",
    "cat": "Derbies & Events",
    "sub": "Derby",
    "group": "Derbies & Events",
    "derby": true,
    "date": "2026-12-12",
    "days": "Dec 12–13",
    "longDate": "Sat–Sun, Dec 12–13, 2026",
    "time": "8:00 AM – 6:00 PM",
    "province": "Batangas",
    "city": "Lipa City",
    "online": false,
    "venue": "Lipa Coliseum",
    "desc": "2-day invitational kasama ang top gamefarms ng Luzon.",
    "topics": "",
    "speakers": "",
    "fee": "Ayon sa organizer",
    "reg": "Contact organizer",
    "permits": "Cockpit license + LGU event permit (admin verified)",
    "org": "Lipa Breeders Association"
  },
  {
    "slug": "tanauan-new-year-stag-derby",
    "title": "Tanauan New Year Stag Derby",
    "cat": "Derbies & Events",
    "sub": "Stag Derby",
    "group": "Derbies & Events",
    "derby": true,
    "date": "2027-01-09",
    "days": "Jan 9–10",
    "longDate": "Sat–Sun, Jan 9–10, 2027",
    "time": "8:00 AM – 6:00 PM",
    "province": "Batangas",
    "city": "Tanauan City",
    "online": false,
    "venue": "Tanauan Cockpit Arena",
    "desc": "Invitational event para sa CALABARZON breeders.",
    "topics": "",
    "speakers": "",
    "fee": "Ayon sa organizer",
    "reg": "Contact organizer",
    "permits": "Cockpit license + LGU event permit (admin verified)",
    "org": "Lipa Breeders Association"
  },
  {
    "slug": "rosario-hackfight-series",
    "title": "Rosario Hackfight Series",
    "cat": "Derbies & Events",
    "sub": "Hackfight",
    "group": "Derbies & Events",
    "derby": true,
    "date": "2027-02-06",
    "days": "Feb 6",
    "longDate": "Sat, Feb 6, 2027",
    "time": "9:00 AM – 5:00 PM",
    "province": "Batangas",
    "city": "Rosario",
    "online": false,
    "venue": "Rosario Cockpit",
    "desc": "Event mula sa verified organizer. Detalye sa organizer.",
    "topics": "",
    "speakers": "",
    "fee": "Ayon sa organizer",
    "reg": "Contact organizer",
    "permits": "Cockpit license + LGU event permit (admin verified)",
    "org": "Lipa Breeders Association"
  },
  {
    "slug": "lipa-breeders-expo",
    "title": "Lipa Breeders Expo",
    "cat": "Expos & Exhibitions",
    "sub": "Equipment Showcase",
    "group": "Expos & Community",
    "derby": false,
    "date": "2026-10-25",
    "days": "Oct 25–26",
    "longDate": "Sun–Mon, Oct 25–26, 2026",
    "time": "9:00 AM – 5:00 PM",
    "province": "Batangas",
    "city": "Lipa City",
    "online": false,
    "venue": "Lipa City Plaza",
    "desc": "Expo ng supplies, feeds, at farm equipment.",
    "topics": "Equipment, feeds",
    "speakers": "Various exhibitors",
    "fee": "Free",
    "reg": "Walk-in",
    "permits": "On file",
    "org": "Lipa Breeders Association"
  }
];

export const GOODS_CATS: Record<string, string[]> = {
  Feeds: ["Chick Starter", "Grower", "Breeder", "Maintenance", "Conditioning", "Pellets", "Grains", "Feed Ingredients"],
  Supplements: ["Vitamins", "Minerals", "Electrolytes", "Probiotics", "Amino Acids", "Nutritional Supplements"],
  "Health & Care": ["Hygiene", "Disinfectants", "Grooming", "First Aid", "Veterinary Supplies"],
  Equipment: ["Feeders", "Drinkers", "Incubators", "Brooders", "Weighing Scales", "Transport Crates"],
  Housing: ["Cages", "Coops", "Pens", "Nest Boxes", "Perches", "Flooring", "Fencing"],
  Accessories: ["Leg Bands", "Identification Tags", "Farm Tools", "Cleaning Tools", "Storage"],
  Services: ["Farm Construction", "Equipment Repair", "Farm Maintenance", "Poultry Transport"],
};

export type SampleGood = (typeof GOODS)[number];
export const GOODS = [
  {
    "slug": "gamefowl-breeder-feeds-20-kg",
    "name": "Gamefowl Breeder Feeds (20 kg)",
    "cat": "Feeds",
    "sub": "Breeder",
    "price": "₱850",
    "seller": "Batangas Poultry Supply",
    "phone": "0917 123 XXXX",
    "province": "Batangas",
    "city": "Lipa City",
    "sold": false,
    "sellerVerified": true
  },
  {
    "slug": "triangular-coop",
    "name": "Triangular Coop",
    "cat": "Housing",
    "sub": "Coops",
    "price": "₱1,950",
    "seller": "Lipa Farm Equipment",
    "phone": "0918 456 XXXX",
    "province": "Batangas",
    "city": "Lipa City",
    "sold": false,
    "sellerVerified": false
  },
  {
    "slug": "hanging-feeder-5-kg",
    "name": "Hanging Feeder (5 kg)",
    "cat": "Equipment",
    "sub": "Feeders",
    "price": "₱450",
    "seller": "Farm Essentials",
    "phone": "0927 789 XXXX",
    "province": "Batangas",
    "city": "Tanauan City",
    "sold": false,
    "sellerVerified": false
  },
  {
    "slug": "automatic-drinker-4-l",
    "name": "Automatic Drinker (4 L)",
    "cat": "Equipment",
    "sub": "Drinkers",
    "price": "₱320",
    "seller": "Farm Essentials",
    "phone": "0927 789 XXXX",
    "province": "Batangas",
    "city": "Tanauan City",
    "sold": true,
    "sellerVerified": false
  },
  {
    "slug": "vitamin-set-3-bottles",
    "name": "Vitamin Set (3 bottles)",
    "cat": "Supplements",
    "sub": "Vitamins",
    "price": "₱650",
    "seller": "SabongCare PH",
    "phone": "0915 234 XXXX",
    "province": "Batangas",
    "city": "Rosario",
    "sold": false,
    "sellerVerified": true
  },
  {
    "slug": "farm-disinfectant-1-l",
    "name": "Farm Disinfectant (1 L)",
    "cat": "Health & Care",
    "sub": "Disinfectants",
    "price": "₱280",
    "seller": "SabongCare PH",
    "phone": "0915 234 XXXX",
    "province": "Batangas",
    "city": "Rosario",
    "sold": false,
    "sellerVerified": true
  },
  {
    "slug": "numbered-leg-bands-100",
    "name": "Numbered Leg Bands (100)",
    "cat": "Accessories",
    "sub": "Leg Bands",
    "price": "₱350",
    "seller": "Farm Essentials",
    "phone": "0927 789 XXXX",
    "province": "Batangas",
    "city": "Tanauan City",
    "sold": false,
    "sellerVerified": false
  },
  {
    "slug": "coop-pen-building",
    "name": "Coop & Pen Building",
    "cat": "Services",
    "sub": "Farm Construction",
    "price": "₱ quote",
    "seller": "Ibaan Farm Builders",
    "phone": "0916 567 XXXX",
    "province": "Batangas",
    "city": "Ibaan",
    "sold": false,
    "sellerVerified": false
  }
];

export const REELS = [
  {
    "slug": "tamang-feeding-schedule-para-sa-stags",
    "title": "Tamang feeding schedule para sa stags",
    "topic": "Feeding",
    "farm": "Bukid Malaya Gamefarm",
    "farmSlug": "bukid-malaya-gamefarm",
    "dur": "1:12",
    "platform": "TikTok"
  },
  {
    "slug": "paglilinis-ng-coop-daily-checklist",
    "title": "Paglilinis ng coop: daily checklist",
    "topic": "Farm Management",
    "farm": "Tres Lomas Farm",
    "farmSlug": "tres-lomas-farm",
    "dur": "0:58",
    "platform": "Facebook"
  },
  {
    "slug": "vitamins-at-electrolytes-kailan-at-gaano",
    "title": "Vitamins at electrolytes: kailan at gaano",
    "topic": "Poultry Health",
    "farm": "Kalye Mabini Breeders",
    "farmSlug": "kalye-mabini-breeders",
    "dur": "1:30",
    "platform": "YouTube"
  },
  {
    "slug": "pagpili-ng-breeders-para-sa-susunod-na-season",
    "title": "Pagpili ng breeders para sa susunod na season",
    "topic": "Breeding",
    "farm": "Dos Puno Gamefowl",
    "farmSlug": "dos-puno-gamefowl",
    "dur": "1:05",
    "platform": "TikTok"
  },
  {
    "slug": "biosecurity-basics-sa-maliit-na-farm",
    "title": "Biosecurity basics sa maliit na farm",
    "topic": "Poultry Health",
    "farm": "Silangan Ridge Farm",
    "farmSlug": "silangan-ridge-farm",
    "dur": "1:44",
    "platform": "Facebook"
  }
];

export type Article = (typeof ARTICLES)[number];
export const ARTICLES = [
  {
    "slug": "breeding-basics-for-better-hatchability",
    "title": "Breeding Basics for Better Hatchability",
    "topic": "Breeding",
    "date": "Nov 9, 2026",
    "read": "5 min read",
    "by": "Sabong Central Editors",
    "body": [
      "Ang magandang hatch rate ay nagsisimula sa malusog na breeders. Pumili ng hens at cocks na nasa tamang edad, timbang at walang sakit.",
      "Bigyan ang breeders ng breeder feed, malinis na tubig at sapat na liwanag. Iwasan ang stress sa pens lalo na sa unang dalawang linggo ng pagsasama.",
      "Kolektahin ang itlog nang dalawang beses sa isang araw, itago sa malamig at tuyong lugar, at i-incubate sa loob ng 7 araw."
    ]
  },
  {
    "slug": "tamang-nutrition-para-sa-stags",
    "title": "Tamang Nutrition para sa Stags",
    "topic": "Nutrition",
    "date": "Nov 5, 2026",
    "read": "4 min read",
    "by": "Dr. [Vet name], DVM",
    "body": [
      "Kailangan ng stags ng protina para sa paglaki ng muscles at balahibo. Gumamit ng grower feed na may tamang protein level.",
      "Dagdagan ng gulay at grains, pero huwag sobra sa treats. Laging may malinis na tubig.",
      "I-record ang timbang bawat linggo para makita kung tama ang feeding."
    ]
  },
  {
    "slug": "biosecurity-checklist-para-sa-maliit-na-farm",
    "title": "Biosecurity Checklist para sa Maliit na Farm",
    "topic": "Biosecurity",
    "date": "Oct 30, 2026",
    "read": "6 min read",
    "by": "Sabong Central Editors",
    "body": [
      "I-quarantine ang bagong ibon nang hindi bababa sa 2 linggo bago isama sa flock.",
      "Maglagay ng footbath sa entrance at limitahan ang bisita. Linisin at i-disinfect ang feeders at drinkers araw-araw.",
      "I-report sa Municipal Agriculturist o BAI kung may biglaang pagkamatay ng maraming ibon."
    ]
  },
  {
    "slug": "incubation-101-temperatura-at-humidity",
    "title": "Incubation 101: Temperatura at Humidity",
    "topic": "Incubation",
    "date": "Oct 22, 2026",
    "read": "5 min read",
    "by": "Mario Reyes, Bukid Malaya Gamefarm",
    "body": [
      "Panatilihin ang 37.5°C at 50–55% humidity sa unang 18 araw. Itaas sa 65–70% sa lockdown.",
      "I-turn ang itlog 3–5 beses sa isang araw hanggang day 18.",
      "Mag-candling sa day 7 at day 14 para alisin ang hindi fertile na itlog."
    ]
  },
  {
    "slug": "paano-makilala-ang-karaniwang-sakit-ng-manok",
    "title": "Paano Makilala ang Karaniwang Sakit ng Manok",
    "topic": "Poultry Health",
    "date": "Oct 15, 2026",
    "read": "7 min read",
    "by": "Dr. [Vet name], DVM",
    "body": [
      "Bantayan ang sipon, pamamaga ng mata, pagtatae at pagbaba ng gana kumain.",
      "Ihiwalay agad ang may sakit at kumonsulta sa beterinaryo bago magbigay ng gamot.",
      "Ang regular na bakuna at malinis na kapaligiran ang pinakamabisang proteksyon."
    ]
  }
];

export const RESOURCES = [
  ["Farm Record Template", "PDF · 2 pages"],
  ["Feeding Log", "PDF · printable weekly sheet"],
  ["Hatch Record", "PDF · per incubator batch"],
  ["Vaccination Log", "PDF · per flock"],
] as const;

export const NOTICES = [
  {
    "kind": "Official Advisories",
    "title": "SAMPLE: Avian Influenza advisory para sa Region IV-A",
    "meta": "Bureau of Animal Industry · Nov 8, 2026",
    "text": "Pinapayuhan ang poultry raisers na higpitan ang biosecurity at i-report ang biglaang pagkamatay ng ibon.",
    "source": "Source: bai.gov.ph (link sa totoong site)"
  },
  {
    "kind": "Official Advisories",
    "title": "SAMPLE: Pansamantalang paghihigpit sa paglipat ng poultry",
    "meta": "Department of Agriculture · Nov 3, 2026",
    "text": "Kailangan ng shipping permit at veterinary health certificate bago maglipat ng poultry sa labas ng probinsya.",
    "source": "Source: da.gov.ph (link sa totoong site)"
  },
  {
    "kind": "Official Advisories",
    "title": "SAMPLE: Newcastle Disease vaccination schedule",
    "meta": "Provincial Veterinary Office · Oct 28, 2026",
    "text": "Libreng ND vaccination sa mga barangay ng Batangas mula Nov 15–30.",
    "source": "Source: provincial vet office (link sa totoong site)"
  },
  {
    "kind": "Safety Warnings",
    "title": "Mag-ingat sa nagbebenta ng \"vaccine\" sa Facebook",
    "meta": "Admin notice · Nov 9, 2026",
    "text": "Bumili lang ng bakuna sa lisensyadong vet o agri supply. Huwag magpadala ng bayad sa hindi kilalang seller.",
    "source": ""
  },
  {
    "kind": "Safety Warnings",
    "title": "Huwag magbayad bago makita ang item",
    "meta": "Admin notice · Nov 1, 2026",
    "text": "Laging i-verify ang seller at item bago magbayad. I-report ang kahina-hinalang listing.",
    "source": ""
  },
  {
    "kind": "Farm Announcements",
    "title": "Bukid Malaya Gamefarm: farm visit by appointment",
    "meta": "Approved · Nov 8, 2026",
    "text": "Bukas ang farm visits tuwing Sabado, 8AM–12NN. Tumawag muna.",
    "source": ""
  }
];

export const SUPPLIERS = [
  {
    "kind": "Feed Manufacturers",
    "name": "Batangas Poultry Supply",
    "place": "Lipa City, Batangas",
    "about": "Breeder, grower at conditioning feeds · distributor",
    "phone": "0918 222 7710"
  },
  {
    "kind": "Feed Manufacturers",
    "name": "Southern Tagalog Feedmill (sample)",
    "place": "Tanauan City, Batangas",
    "about": "Poultry feeds, pellets at grains · wholesale",
    "phone": "0917 640 1180"
  },
  {
    "kind": "Equipment Providers",
    "name": "Lipa Farm Equipment",
    "place": "Lipa City, Batangas",
    "about": "Feeders, drinkers, transport crates, coops",
    "phone": "0917 902 3310"
  },
  {
    "kind": "Equipment Providers",
    "name": "Incuba PH (sample)",
    "place": "Batangas City, Batangas",
    "about": "Incubators at brooders · may after-sales service",
    "phone": "0919 330 8812"
  },
  {
    "kind": "Agri Supply Stores",
    "name": "Farm Essentials",
    "place": "Tanauan City, Batangas",
    "about": "Leg bands, disinfectants, farm tools",
    "phone": "0927 789 4410"
  },
  {
    "kind": "Agri Supply Stores",
    "name": "Rosario Agri Center (sample)",
    "place": "Rosario, Batangas",
    "about": "Vitamins, feeds, cleaning supplies",
    "phone": "0915 220 6634"
  }
];

export const BLOODLINES = ["Albany", "Bates Black", "Boston Roundhead", "Cardinal Club Kelso", "Cecil Davis Kelso", "Claret", "Col. Givens Hatch", "Duke Hulsey Grey", "Flarry Eye Grey", "GBS", "Gilmore Hatch", "Hatch", "Harold Brown Grey", "Hennie", "Kelso", "Lemon 84", "McLean Hatch", "Melsims Hatch", "Popeye Grey", "Red Fox Grey", "Roundhead", "Sweater", "White Kelso", "White Boston Roundhead", "White Hackle", "Yellow Leg Hatch", "Other"];
