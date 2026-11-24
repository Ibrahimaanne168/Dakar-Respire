export default function DakarSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 180"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto block ${className}`}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Ciel / fond transparent au-dessus */}

      {/* Horizon de la mer */}
      <line x1="0" y1="145" x2="1200" y2="145" stroke="#1F5C5E" strokeWidth="1" opacity="0.4" />

      {/* Relief de la presqu'île — profil gauche vers droite : plaine → collines → cap-vert → Almadies → descente vers la mer */}
      <path
        d="M0,180 L0,155 Q60,150 120,148 Q180,146 240,142 Q300,138 360,130 Q420,122 480,118 Q520,115 550,112 Q580,110 600,106 Q630,102 660,100 Q700,98 730,96 Q760,95 790,97 Q820,100 840,105 Q860,110 880,120 Q900,132 920,140 Q950,148 980,152 Q1020,156 1080,158 Q1140,159 1200,160 L1200,180 Z"
        fill="#173F42"
      />

      {/* Cap-Vert — pointe avancée dans la mer */}
      <path
        d="M590,106 Q610,90 625,80 Q638,72 648,76 Q658,80 660,100 Q640,98 620,100 Z"
        fill="#1F5C5E"
      />

      {/* Phare des Almadies — rectangle + triangle */}
      <rect x="755" y="62" width="10" height="34" fill="#173F42" />
      <polygon points="750,62 765,62 757.5,50" fill="#B5532A" />
      {/* Petite fenêtre du phare */}
      <rect x="758" y="68" width="4" height="4" fill="#E9A15B" opacity="0.9" />

      {/* Pirogue 1 — gauche */}
      <path
        d="M180,145 Q195,138 210,140 Q220,142 220,145 Q200,148 180,145 Z"
        fill="#B5532A"
        opacity="0.75"
      />
      {/* Mât pirogue 1 */}
      <line x1="198" y1="140" x2="198" y2="128" stroke="#B5532A" strokeWidth="1.2" opacity="0.75" />
      {/* Voile */}
      <path d="M198,128 L210,135 L198,138 Z" fill="#E9A15B" opacity="0.6" />

      {/* Pirogue 2 — droite */}
      <path
        d="M980,148 Q995,141 1010,143 Q1020,145 1020,148 Q1002,151 980,148 Z"
        fill="#B5532A"
        opacity="0.65"
      />
      {/* Mât pirogue 2 */}
      <line x1="998" y1="143" x2="998" y2="131" stroke="#B5532A" strokeWidth="1.2" opacity="0.65" />
      {/* Voile */}
      <path d="M998,131 L1010,138 L998,141 Z" fill="#E9A15B" opacity="0.5" />

      {/* Pirogue 3 — milieu-gauche, plus petite */}
      <path
        d="M430,142 Q441,136 452,138 Q459,140 459,143 Q445,145 430,142 Z"
        fill="#B5532A"
        opacity="0.5"
      />

      {/* Mer — vague douce */}
      <path
        d="M0,155 Q100,150 200,153 Q300,156 400,152 Q500,148 600,150 Q700,152 800,149 Q900,146 1000,150 Q1100,154 1200,151 L1200,180 L0,180 Z"
        fill="#1F5C5E"
        opacity="0.35"
      />
    </svg>
  );
}
