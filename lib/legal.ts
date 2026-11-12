// Legal and help pages, from the approved mockup (v40). Drafts until the lawyer reviews them.
export type LegalDoc = { tab: string; title: string; meta: string; s: [string, string][] };
export const LEGAL: Record<string, LegalDoc> = {
  "About": {
    "tab": "About",
    "title": "About Sabong Central",
    "meta": "The Philippine Gamefowl Community",
    "s": [
      [
        "Who we are",
        "Sabong Central is a free, independent, community-based information platform created to connect Filipino gamefowl enthusiasts, breeders, farm owners, event organizers, and poultry supply providers."
      ],
      [
        "Our purpose",
        "Our purpose is to make information about gamefowl farming, breeding, animal care, educational resources, poultry supplies, and legally authorized community events easier to discover."
      ],
      [
        "Gamefarm Directory",
        "Information submitted by gamefarm owners, including farm locations, bloodlines, photographs, and contact details."
      ],
      [
        "Events Directory",
        "Factual information about legally authorized events, subject to verification and applicable regulatory requirements."
      ],
      [
        "Educational Reels",
        "Informational videos about responsible breeding, nutrition, poultry health, sanitation, and farm management."
      ],
      [
        "Community Market",
        "Listings for permitted poultry supplies, equipment, and related services, with direct contact information for independent sellers."
      ],
      [
        "We are not a gambling platform",
        "Sabong Central is not a gambling platform or an e-sabong operator. We do not organize or operate cockfights, accept or facilitate wagers, provide betting odds, collect betting money, livestream cockfights, or offer online gambling services."
      ],
      [
        "No sales through the platform",
        "Sabong Central does not process purchases, collect payments, arrange deliveries, or act as a seller in transactions between community members."
      ],
      [
        "Review and 21+",
        "All listings are submitted by independent contributors and are subject to platform review. Approval or publication does not constitute an endorsement, certification, or guarantee. Sabong Central is intended exclusively for adults aged 21 and above."
      ],
      [
        "Mission",
        "To support responsible information-sharing, lawful community participation, and education about gamefowl breeding and care in the Philippines."
      ]
    ]
  },
  "Terms": {
    "tab": "Terms",
    "title": "Terms of Use",
    "meta": "Effective date: upon launch · Republic of the Philippines",
    "s": [
      [
        "1. Acceptance of Terms",
        "By using Sabong Central, you agree to these Terms, our Privacy Notice, Philippine law, and our community rules."
      ],
      [
        "2. Nature of the Platform",
        "A free, independent community information platform. Not an operator, organizer, promoter, or betting intermediary. No gambling, wagers, livestreams, or payments."
      ],
      [
        "3. Age Restriction",
        "For individuals 21 and above only, in line with PAGCOR responsible gaming rules. Visitors must confirm they are 21 or older, and account applicants must confirm they are at least 21."
      ],
      [
        "4. Registration and Accounts",
        "Visitors browse without registering. Farm owners, organizers, and sellers may apply for one account with one or more roles, subject to verification."
      ],
      [
        "5–6. Gamefarm and Events Directories",
        "Contributors are responsible for accuracy and lawfulness. Organizers must hold all required permits. Listing an event does not confirm its legality."
      ],
      [
        "7. No Gambling or E-Sabong",
        "No betting, odds, wagering funds, remote wagering, or cockfight footage for wagering. Violations are removed and accounts suspended."
      ],
      [
        "8. Educational Videos",
        "Lawful husbandry topics only. No actual cockfights, cruelty, or betting material."
      ],
      [
        "9–11. Community Market and Sellers",
        "Sabong Central is not the seller and has no checkout. Buyers contact sellers directly. Sellers keep listings truthful and mark items sold. No live animals while that feature is off."
      ],
      [
        "12–13. Content and Moderation",
        "Contributors keep ownership and grant a display license. Admin may review, reject, or remove content. Approval is not an endorsement."
      ],
      [
        "14–20. Other Terms",
        "Third-party links (e.g. Messenger), accuracy and availability, limitation of liability, privacy and security, changes to Terms, Philippine governing law, and contact."
      ]
    ]
  },
  "Privacy": {
    "tab": "Privacy",
    "title": "Privacy Notice",
    "meta": "Data Privacy Act of 2012 (RA 10173)",
    "s": [
      [
        "Who we are",
        "Sabong Central, operated by [registered business name, to follow], is the personal information controller. Contact and privacy requests: sabongcentralph@gmail.com."
      ],
      [
        "What we collect",
        "Visitors: limited technical data only. Public form contributors (articles, reels, announcements): name and email, kept private and used only to review your submission. Portal members: name, email, mobile number, roles, farm or business info, photos, verification documents, and account activity. We do NOT collect government IDs."
      ],
      [
        "Why we collect it",
        "To run accounts, verify emails and business documents, review and publish submissions, prevent fraud, handle complaints, and comply with the law."
      ],
      [
        "What is public",
        "Farm or seller name, province and city, public business contact, photos, descriptions, and prices. Exact addresses are not public by default, and business documents are never shown publicly."
      ],
      [
        "Business documents",
        "Farms, organizers and venues submit business registration or proof of legitimacy; sellers may do so optionally. Verification documents are private and seen only by admins, never public. They are kept only as long as necessary and deleted after rejection or account closure unless the law requires keeping them. We do not collect government IDs."
      ],
      [
        "Sharing and retention",
        "Hosting, email, and security providers only. We never sell personal data. Data is kept only as long as necessary."
      ],
      [
        "Security and incidents",
        "Encryption, restricted access, and logging. Breaches are reported to the NPC when required."
      ],
      [
        "Your rights",
        "To be informed, access, correct, object, withdraw consent, erase or block, port, and complain to the National Privacy Commission (privacy.gov.ph). To request access, correction or deletion, use the Contact page (topic: Privacy / data request) or email sabongcentralph@gmail.com."
      ],
      [
        "21+ only",
        "The site is for adults 21 and above. Minors and anyone under 21 may not register or use management accounts."
      ]
    ]
  },
  "Rules": {
    "tab": "Portal Rules",
    "title": "Portal Rules",
    "meta": "For farms, organizers and sellers",
    "s": [
      [
        "Content rules",
        "Post only true content that is your own. Not allowed: bets, odds, fight footage, animal cruelty, live-animal sales (while switched off), and regulated products without registration. Every post goes through admin review."
      ],
      [
        "Verification: everyone",
        "No government ID is needed. Every account needs an email code and a mobile number."
      ],
      [
        "Verification: by role",
        "Farm: business registration (DTI, SEC or Mayor’s permit). Organizer or venue: proof of legitimacy (business registration or permit) plus permits for each event. Seller: email code (required) and a DTI or business permit (optional, for the Business Verified badge); every listing has a Report button."
      ],
      [
        "Reporting procedures",
        "Press ⚑ Report on a farm, event or listing. An admin reviews it, may hide the content while investigating, and notifies the owner if action is taken."
      ],
      [
        "If there is a violation",
        "A warning, removal of content, or account suspension. Serious violations (e.g. betting or e-sabong) are removed immediately."
      ]
    ]
  },
  "Market": {
    "tab": "Market Notice",
    "title": "Marketplace Notice & Buyer Safety",
    "meta": "Sabong Central Market · community classified listings",
    "s": [
      [
        "What the Market is",
        "Sabong Central Market is a free community classified-listing directory for permitted poultry-related products, equipment, and services."
      ],
      [
        "We are not the seller",
        "Sabong Central does not own, sell, purchase, broker, or deliver listed products. We do not negotiate transactions, collect payments, receive commissions, or handle buyer funds."
      ],
      [
        "Independent sellers",
        "All listings are submitted by independent sellers. Buyers contact sellers directly using the telephone numbers voluntarily provided for public display."
      ],
      [
        "⚠ Beware of scams",
        "Buyers are strongly encouraged to independently verify the seller, product, price, and transaction details before making any payment. Seller email verification does not guarantee product authenticity, delivery, or seller reliability."
      ],
      [
        "We are not a party to transactions",
        "Sabong Central is not a party to transactions between buyers and sellers. Nothing in this notice excludes responsibilities that may apply to Sabong Central under Philippine law."
      ],
      [
        "Report Listing",
        "Report suspicious or fraudulent listings immediately through the ⚑ Report Listing button on each listing."
      ]
    ]
  },
  "Contact": {
    "tab": "Contact Us",
    "title": "Contact Us",
    "meta": "Official contact channels of Sabong Central",
    "s": [
      [
        "Other ways to reach us",
        "Email: sabongcentralph@gmail.com · Facebook page: Sabong Central · Manila, Philippines"
      ],
      [
        "Privacy contact / Data Protection Officer",
        "[DPO name] · sabongcentralph@gmail.com. For access, correction, erasure and other privacy requests."
      ],
      [
        "Reporting",
        "Use the ⚑ Report button on a farm, event, listing, reel or profile. For other complaints, email us."
      ],
      [
        "National Privacy Commission",
        "You may also file a complaint with the NPC: privacy.gov.ph."
      ]
    ]
  },
  "FAQ": {
    "tab": "FAQ",
    "title": "FAQ · How to list",
    "meta": "Frequently asked questions",
    "s": [
      [
        "Is it free?",
        "Yes. Browsing is free, and listing a farm, event or goods is free."
      ],
      [
        "Do I need an account to browse?",
        "No. Accounts are only for farm owners, organizers and sellers."
      ],
      [
        "How do I list my farm?",
        "Portal → Create an Account → choose Gamefarm Owner → enter your details → upload your business registration (DTI, SEC or Mayor’s permit). An admin reviews it within 1–3 days."
      ],
      [
        "How do I post an event?",
        "Choose the Event Organizer role and upload the permit or venue letter for each event. It appears only once approved."
      ],
      [
        "How do I sell in the Market?",
        "Choose the Seller role. Add your price, availability and contact number. Buyers contact you directly."
      ],
      [
        "Do you sell birds?",
        "No. Live birds, fighting weapons and regulated vet medicines are not allowed in V1."
      ],
      [
        "Is there betting or e-sabong here?",
        "No. We are not a gambling platform or e-sabong operator."
      ],
      [
        "Do I need an ID?",
        "No. Farms and organizers submit business papers only. Sellers only need an email code; a DTI or business permit is optional, for the badge."
      ],
      [
        "How do I report something?",
        "Press ⚑ Report. An admin reviews every report."
      ]
    ]
  },
  "Disclaimer": {
    "tab": "Disclaimer",
    "title": "Legal Disclaimer",
    "meta": "Independent community information platform · Adults 21+",
    "s": [
      [
        "Independent Platform",
        "Not a government agency, gambling operator, cockfighting organizer, betting service, or licensed cockpit. Not affiliated with PAGCOR, GAB, any LGU, cockpit, farm, or organizer unless expressly stated and verified."
      ],
      [
        "No Gambling or E-Sabong",
        "Sabong Central does not offer, accept, or facilitate betting, publish odds, collect wagers, process gambling payments, or livestream cockfights."
      ],
      [
        "Event Information",
        "Submitted by independent organizers. Publication does not mean an event is licensed or will proceed. Verify with the organizer, venue, or LGU."
      ],
      [
        "Gamefarm Information",
        "Provided by contributors. No guarantee of bloodline authenticity, ownership, breeding results, or animal health."
      ],
      [
        "Market Listings",
        "Submitted by independent sellers. Sabong Central is not the seller and does no checkout, payments, or delivery."
      ],
      [
        "Educational Content",
        "General information only, not a replacement for a veterinarian."
      ],
      [
        "Content Review",
        "Admin approval is not an endorsement, accreditation, or certification."
      ],
      [
        "Reporting",
        "Report suspected illegal activity, fraud, animal cruelty, or wrong information through the official reporting channel."
      ]
    ]
  },
  "Responsible": {
    "tab": "Responsible Gaming",
    "title": "Responsible Gaming",
    "meta": "21+ only · Gamble responsibly",
    "s": [
      [
        "21 and over only",
        "Sabong Central is for adults 21 years old and above. Everyone confirms their age when they first visit. If you are under 21, please leave the site."
      ],
      [
        "We never take bets",
        "Sabong Central is an information directory. We do not accept bets, wagers or payments, we do not run or stream fights, and we do not link to e-sabong, online sabong or betting apps. Listings that promote betting are removed."
      ],
      [
        "Gamble responsibly",
        "If you attend a licensed event where betting happens, set a limit before you go and stick to it. Never bet money you need for food, rent, school or your family. Do not chase losses. Gambling is not a way to make money."
      ],
      [
        "Warning signs",
        "Spending more time or money than you planned, borrowing to gamble, hiding it from family, or feeling restless when you try to stop can be signs of a gambling problem."
      ],
      [
        "Get help (free, 24/7)",
        "National Problem Gambling Helpline (PAGCOR, with Seagulls Flock Organization): (02) 8248-9568. You can also ask PAGCOR about self-exclusion from licensed gaming venues. If you or someone you know is in crisis, call the NCMH Crisis Hotline 1553."
      ],
      [
        "Legal events only",
        "Derby listings are shown only with the organizer's stated LGU permit and cockpit license, which admins check before publishing. Online cockfighting (e-sabong) is banned in the Philippines and is never listed."
      ]
    ]
  }
};
