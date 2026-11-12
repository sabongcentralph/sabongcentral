// Sample content so every section has something to show before real
// farms, organizers and sellers sign up. Everything here is labeled "Sample"
// on the site. These move to the database when the Portal is built.

export type Bloodline = { name: string; note?: string };
export type FarmData = { slug: string; name: string; province: string; city: string; about: string; ownerName: string; phone: string; facebook: string; bloodlines: Bloodline[]; verified: boolean; est: string };
export const FARMS: FarmData[] = [
  { slug: "bukid-malaya-gamefarm", name: "Bukid Malaya Gamefarm", province: "Batangas", city: "Lipa City", est: "2012", verified: true, ownerName: "Mario Reyes", phone: "0917 555 0142", facebook: "facebook.com/sabongcentral",
    about: "Family-run farm at the foot of Mt. Malarayat. We focus on clean bloodlines, proper nutrition and careful farm records.",
    bloodlines: [{ name: "Sweater", note: "Main line, 10+ years" }, { name: "Hatch" }, { name: "Kelso" }] },
  { slug: "tres-lomas-farm", name: "Tres Lomas Farm", province: "Batangas", city: "Rosario", est: "2015", verified: true, ownerName: "Ben Aquino", phone: "0918 220 4410", facebook: "facebook.com/sabongcentral",
    about: "A small, well-kept farm in Rosario. Open house on the last Saturday of each month, by appointment.",
    bloodlines: [{ name: "Roundhead" }, { name: "Claret" }] },
  { slug: "kalye-mabini-breeders", name: "Kalye Mabini Breeders", province: "Batangas", city: "Tanauan City", est: "2018", verified: true, ownerName: "Jojo Mabini", phone: "0927 811 3301", facebook: "facebook.com/sabongcentral",
    about: "A breeders' group in Tanauan. We share feeding and conditioning tips for new breeders.",
    bloodlines: [{ name: "Lemon 84" }, { name: "Sweater" }] },
  { slug: "silangan-ridge-farm", name: "Silangan Ridge Farm", province: "Batangas", city: "Ibaan", est: "2019", verified: false, ownerName: "Carlo Dimaano", phone: "0915 640 2219", facebook: "facebook.com/sabongcentral",
    about: "A new farm in Ibaan focused on Kelso and Albany lines.",
    bloodlines: [{ name: "Kelso" }, { name: "Albany" }] },
  { slug: "dos-puno-gamefowl", name: "Dos Puno Gamefowl", province: "Batangas", city: "Sto. Tomas City", est: "2016", verified: true, ownerName: "Rey Castillo", phone: "0919 404 1180", facebook: "facebook.com/sabongcentral",
    about: "A farm with two large mango trees at its center. Hatch and Grey lines.",
    bloodlines: [{ name: "McLean Hatch" }, { name: "Red Fox Grey" }] },
  { slug: "mataas-na-lupa-farm", name: "Mataas na Lupa Farm", province: "Batangas", city: "San Jose", est: "2021", verified: false, ownerName: "Nestor Ilagan", phone: "0916 552 7790", facebook: "facebook.com/sabongcentral",
    about: "Upland farm in San Jose. Gilmore Hatch and Lemon 84.",
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
    "slug": "biosecurity-for-gamefarms",
    "title": "Biosecurity for Gamefarms",
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
    "desc": "Half-day seminar on keeping disease off the farm: quarantining new birds, cleaning pens and handling visitors properly.",
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
    "desc": "Hands-on incubator setup, candling and hatch-day care. Limited to 20 participants.",
    "topics": "Incubator setup, humidity, candling, chick care day 1–7",
    "speakers": "Mario Reyes (Bukid Malaya Gamefarm)",
    "fee": "₱500 (includes handouts and lunch)",
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
    "desc": "A 2-day expo of feeds, supplements, equipment and farm services, with mini-talks every hour.",
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
    "desc": "Local breeders meet to talk and swap tips. Bring your own questions.",
    "topics": "Feeding tips, conditioning, farm records",
    "speakers": "Open forum",
    "fee": "Free",
    "reg": "Walk-in",
    "permits": "Barangay permit on file",
    "org": "Lipa Breeders Association"
  },
  {
    "slug": "online-vet-talk-colds-and-respiratory-diseases",
    "title": "Online Vet Talk: Colds and Respiratory Diseases",
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
    "venue": "Online · Zoom link after you register",
    "desc": "A 1-hour webinar on symptoms, prevention and when to call a veterinarian.",
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
    "desc": "Training for farm helpers: handling, lifting and transporting birds without stress.",
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
    "desc": "A 2-day invitational with top gamefarms from Luzon.",
    "topics": "",
    "speakers": "",
    "fee": "Set by organizer",
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
    "desc": "Invitational event for CALABARZON breeders.",
    "topics": "",
    "speakers": "",
    "fee": "Set by organizer",
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
    "desc": "Event from a verified organizer. Contact the organizer for details.",
    "topics": "",
    "speakers": "",
    "fee": "Set by organizer",
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
    "desc": "Expo of supplies, feeds and farm equipment.",
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
    "slug": "the-right-feeding-schedule-for-stags",
    "title": "The right feeding schedule for stags",
    "topic": "Feeding",
    "farm": "Bukid Malaya Gamefarm",
    "farmSlug": "bukid-malaya-gamefarm",
    "dur": "1:12",
    "platform": "TikTok"
  },
  {
    "slug": "cleaning-the-coop-daily-checklist",
    "title": "Cleaning the coop: daily checklist",
    "topic": "Farm Management",
    "farm": "Tres Lomas Farm",
    "farmSlug": "tres-lomas-farm",
    "dur": "0:58",
    "platform": "Facebook"
  },
  {
    "slug": "vitamins-and-electrolytes-when-and-how-much",
    "title": "Vitamins and electrolytes: when and how much",
    "topic": "Poultry Health",
    "farm": "Kalye Mabini Breeders",
    "farmSlug": "kalye-mabini-breeders",
    "dur": "1:30",
    "platform": "YouTube"
  },
  {
    "slug": "choosing-breeders-for-next-season",
    "title": "Choosing breeders for next season",
    "topic": "Breeding",
    "farm": "Dos Puno Gamefowl",
    "farmSlug": "dos-puno-gamefowl",
    "dur": "1:05",
    "platform": "TikTok"
  },
  {
    "slug": "biosecurity-basics-for-small-farms",
    "title": "Biosecurity basics for small farms",
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
      "A good hatch rate starts with healthy breeders. Choose hens and cocks of the right age and weight, free of disease.",
      "Give breeders breeder feed, clean water and enough light. Avoid stress in the pens, especially in the first two weeks together.",
      "Collect eggs twice a day, store them somewhere cool and dry, and incubate within 7 days."
    ]
  },
  {
    "slug": "proper-nutrition-for-stags",
    "title": "Proper Nutrition for Stags",
    "topic": "Nutrition",
    "date": "Nov 5, 2026",
    "read": "4 min read",
    "by": "Dr. [Vet name], DVM",
    "body": [
      "Stags need protein to build muscle and feathers. Use a grower feed with the right protein level.",
      "Add vegetables and grains, but don't overdo treats. Always provide clean water.",
      "Record weight every week to check that feeding is on track."
    ]
  },
  {
    "slug": "biosecurity-checklist-for-small-farms",
    "title": "Biosecurity Checklist for Small Farms",
    "topic": "Biosecurity",
    "date": "Oct 30, 2026",
    "read": "6 min read",
    "by": "Sabong Central Editors",
    "body": [
      "Quarantine new birds for at least 2 weeks before adding them to the flock.",
      "Put a footbath at the entrance and limit visitors. Clean and disinfect feeders and drinkers daily.",
      "Report sudden deaths of many birds to the Municipal Agriculturist or the BAI."
    ]
  },
  {
    "slug": "incubation-101-temperature-and-humidity",
    "title": "Incubation 101: Temperature and Humidity",
    "topic": "Incubation",
    "date": "Oct 22, 2026",
    "read": "5 min read",
    "by": "Mario Reyes, Bukid Malaya Gamefarm",
    "body": [
      "Keep 37.5°C and 50–55% humidity for the first 18 days. Raise humidity to 65–70% at lockdown.",
      "Turn the eggs 3–5 times a day until day 18.",
      "Candle on day 7 and day 14 to remove infertile eggs."
    ]
  },
  {
    "slug": "how-to-spot-common-chicken-diseases",
    "title": "How to Spot Common Chicken Diseases",
    "topic": "Poultry Health",
    "date": "Oct 15, 2026",
    "read": "7 min read",
    "by": "Dr. [Vet name], DVM",
    "body": [
      "Watch for colds, swollen eyes, diarrhea and loss of appetite.",
      "Separate sick birds right away and consult a veterinarian before giving medicine.",
      "Regular vaccination and a clean environment are the best protection."
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
    "title": "SAMPLE: Avian Influenza advisory for Region IV-A",
    "meta": "Bureau of Animal Industry · Nov 8, 2026",
    "text": "Poultry raisers are advised to tighten biosecurity and report sudden bird deaths.",
    "source": "Source: bai.gov.ph (linked on the real site)",
    "issuer": "Bureau of Animal Industry",
    "scope": "Region IV-A (CALABARZON)",
    "expires": "Dec 31, 2026"
  },
  {
    "kind": "Official Advisories",
    "title": "SAMPLE: Temporary restrictions on moving poultry",
    "meta": "Department of Agriculture · Nov 3, 2026",
    "text": "A shipping permit and veterinary health certificate are required before moving poultry out of the province.",
    "source": "Source: da.gov.ph (linked on the real site)",
    "issuer": "Department of Agriculture",
    "scope": "Batangas province",
    "expires": "Until lifted"
  },
  {
    "kind": "Official Advisories",
    "title": "SAMPLE: Newcastle Disease vaccination schedule",
    "meta": "Provincial Veterinary Office · Oct 28, 2026",
    "text": "Free ND vaccination in Batangas barangays from Nov 15–30.",
    "source": "Source: provincial vet office (linked on the real site)",
    "issuer": "Batangas Provincial Veterinary Office",
    "scope": "Batangas barangays",
    "expires": "Nov 30, 2026"
  },
  {
    "kind": "Safety Warnings",
    "title": "Beware of people selling \"vaccines\" on Facebook",
    "meta": "Admin notice · Nov 9, 2026",
    "text": "Buy vaccines only from a licensed vet or agri supply store. Never send payment to an unknown seller.",
    "source": ""
  },
  {
    "kind": "Safety Warnings",
    "title": "Don't pay before you see the item",
    "meta": "Admin notice · Nov 1, 2026",
    "text": "Always verify the seller and the item before paying. Report suspicious listings.",
    "source": ""
  },
  {
    "kind": "Farm Announcements",
    "title": "Bukid Malaya Gamefarm: farm visit by appointment",
    "meta": "Approved · Nov 8, 2026",
    "text": "Farm visits are open on Saturdays, 8AM–12NN. Please call first.",
    "source": ""
  }
];

export const SUPPLIERS = [
  {
    "kind": "Feed Manufacturers",
    "name": "Batangas Poultry Supply",
    "place": "Lipa City, Batangas",
    "about": "Breeder, grower and conditioning feeds · distributor",
    "phone": "0918 222 7710"
  },
  {
    "kind": "Feed Manufacturers",
    "name": "Southern Tagalog Feedmill (sample)",
    "place": "Tanauan City, Batangas",
    "about": "Poultry feeds, pellets and grains · wholesale",
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
    "about": "Incubators and brooders · with after-sales service",
    "phone": "0919 330 8812"
  },
  {
    "kind": "Agricultural Supply Stores",
    "name": "Farm Essentials",
    "place": "Tanauan City, Batangas",
    "about": "Leg bands, disinfectants, farm tools",
    "phone": "0927 789 4410"
  },
  {
    "kind": "Agricultural Supply Stores",
    "name": "Rosario Agri Center (sample)",
    "place": "Rosario, Batangas",
    "about": "Vitamins, feeds, cleaning supplies",
    "phone": "0915 220 6634"
  }
];

export const BLOODLINES = ["Albany", "Bates Black", "Boston Roundhead", "Cardinal Club Kelso", "Cecil Davis Kelso", "Claret", "Col. Givens Hatch", "Duke Hulsey Grey", "Flarry Eye Grey", "GBS", "Gilmore Hatch", "Hatch", "Harold Brown Grey", "Hennie", "Kelso", "Lemon 84", "McLean Hatch", "Melsims Hatch", "Popeye Grey", "Red Fox Grey", "Roundhead", "Sweater", "White Kelso", "White Boston Roundhead", "White Hackle", "Yellow Leg Hatch", "Other"];

// Topics used by the public submission form and the Learning Hub filters.
export const ARTICLE_TOPICS = ["Breeding", "Nutrition", "Biosecurity", "Incubation", "Poultry Health", "Farm Management"];
export const REEL_TOPICS = ["Feeding", "Poultry Health", "Breeding", "Farm Management", "Housing", "Incubation"];

export const NOTICE_KINDS = ["Official Advisories", "Safety Warnings", "Farm Announcements"];
export const SUPPLIER_KINDS = ["Feed Manufacturers", "Equipment Providers", "Agricultural Supply Stores"];
