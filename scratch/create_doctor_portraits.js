const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../assets/images');

const doctors = [
  {
    id: 'doc_anupriya',
    name: 'Dr. Anupriya',
    role: 'Founder & Chief Dental Surgeon',
    spec: 'BDS • 20+ Yrs Clinical Experience',
    gender: 'female',
    bgGradient: ['#0d9488', '#14b8a6'],
    iconColor: '#2dd4bf',
    badge: 'Senior Surgeon'
  },
  {
    id: 'doc_ananya',
    name: 'Dr. Ananya Iyer',
    role: 'Prosthodontist Specialist',
    spec: 'MDS • Crown, Bridge & Dentures',
    gender: 'female',
    bgGradient: ['#0284c7', '#06b6d4'],
    iconColor: '#38bdf8',
    badge: 'Prosthodontics'
  },
  {
    id: 'doc_meera',
    name: 'Dr. Meera Subramanian',
    role: 'Endodontist Specialist',
    spec: 'MDS • Painless Root Canal Therapy',
    gender: 'female',
    bgGradient: ['#db2777', '#ec4899'],
    iconColor: '#f472b6',
    badge: 'Endodontics'
  },
  {
    id: 'doc_arvind',
    name: 'Dr. Arvind Kumar',
    role: 'Senior Dental Surgeon',
    spec: 'BDS • General & Preventive Care',
    gender: 'male',
    bgGradient: ['#d97706', '#f59e0b'],
    iconColor: '#fbbf24',
    badge: 'Dental Surgery'
  },
  {
    id: 'doc_sneha',
    name: 'Dr. Sneha N',
    role: 'Orthodontic Specialist',
    spec: 'MDS • Braces & Teeth Alignment',
    gender: 'female',
    bgGradient: ['#7c3aed', '#8b5cf6'],
    iconColor: '#a78bfa',
    badge: 'Orthodontics'
  },
  {
    id: 'doc_srinivas',
    name: 'Dr. Srinivas Rohit',
    role: 'Implantologist Specialist',
    spec: 'MDS • Titanium Dental Implants',
    gender: 'male',
    bgGradient: ['#059669', '#10b981'],
    iconColor: '#34d399',
    badge: 'Implantology'
  },
  {
    id: 'doc_balu',
    name: 'Dr. Balu',
    role: 'Laser Surgery Specialist',
    spec: 'MDS • Painless LASER Dentistry',
    gender: 'male',
    bgGradient: ['#dc2626', '#ef4444'],
    iconColor: '#f87171',
    badge: 'Laser Surgery'
  },
  {
    id: 'doc_vikram',
    name: 'Dr. Vikram Raj',
    role: 'Clear Aligners Partner',
    spec: 'MDS • 3D Digital Invisible Braces',
    gender: 'male',
    bgGradient: ['#2563eb', '#3b82f6'],
    iconColor: '#60a5fa',
    badge: 'Clear Aligners'
  },
  {
    id: 'doc_ajay',
    name: 'Dr. Ajay Jumar',
    role: 'Maxillofacial Surgeon',
    spec: 'MDS • Oral Surgery & Trauma',
    gender: 'male',
    bgGradient: ['#4f46e5', '#6366f1'],
    iconColor: '#818cf8',
    badge: 'Oral Surgery'
  }
];

doctors.forEach(doc => {
  const isFemale = doc.gender === 'female';
  const avatarPath = isFemale ? 'M250,150 C220,150 190,175 190,210 C190,245 220,265 250,265 C280,265 310,245 310,210 C310,175 280,150 250,150 Z M250,275 C190,275 140,320 140,380 L360,380 C360,320 310,275 250,275 Z' : 'M250,145 C220,145 195,170 195,205 C195,240 220,260 250,260 C280,260 305,240 305,205 C305,170 280,145 250,145 Z M250,270 C190,270 145,315 145,380 L355,380 C355,315 310,270 250,270 Z';

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="bgGrad_${doc.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${doc.bgGradient[0]}"/>
      <stop offset="100%" stop-color="${doc.bgGradient[1]}"/>
    </linearGradient>
    <filter id="shadow_${doc.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background Card -->
  <rect width="500" height="500" fill="#0f172a"/>
  
  <!-- Subtle Background Pattern -->
  <circle cx="250" cy="200" r="180" fill="url(#bgGrad_${doc.id})" opacity="0.15"/>
  <circle cx="250" cy="200" r="130" fill="url(#bgGrad_${doc.id})" opacity="0.25"/>

  <!-- Doctor Avatar Circle -->
  <circle cx="250" cy="210" r="110" fill="url(#bgGrad_${doc.id})" filter="url(#shadow_${doc.id})"/>
  <circle cx="250" cy="210" r="104" fill="#1e293b"/>

  <!-- Doctor Silhouette / Portrait Vector -->
  <path d="${avatarPath}" fill="${doc.iconColor}" opacity="0.95"/>

  <!-- Stethoscope Overlay Icon -->
  <g transform="translate(310, 240) scale(0.8)">
    <circle cx="30" cy="30" r="28" fill="#0f172a" stroke="${doc.iconColor}" stroke-width="3"/>
    <path d="M20,20 C20,35 40,35 40,20 M30,35 L30,42" stroke="${doc.iconColor}" stroke-width="4" stroke-linecap="round" fill="none"/>
  </g>

  <!-- Name & Credentials Text Plate -->
  <rect x="30" y="370" width="440" height="100" rx="16" fill="#1e293b" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" filter="url(#shadow_${doc.id})"/>
  
  <text x="250" y="410" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24" fill="#ffffff" text-anchor="middle">${doc.name}</text>
  <text x="250" y="435" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15" fill="${doc.iconColor}" text-anchor="middle">${doc.role}</text>
  <text x="250" y="456" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="13" fill="#94a3b8" text-anchor="middle">${doc.spec}</text>
</svg>`;

  fs.writeFileSync(path.join(outputDir, `${doc.id}.svg`), svgContent, 'utf8');
  console.log(`Created ${doc.id}.svg`);
});
