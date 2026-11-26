import { Leaf, Sprout } from 'lucide-react';
import './AuthVisual.css';

// Feuilles de la plante : [angle en degrés, longueur, largeur] (de l'arrière vers l'avant)
const FEUILLES = [
  [-58, 130, 30], [66, 175, 34], [-44, 175, 36], [52, 210, 40], [-32, 245, 42],
  [37, 250, 42], [-19, 295, 46], [22, 285, 45], [-6, 325, 48], [8, 310, 47],
];

const forme = (l, w) => `M0 0 C ${w} ${-l * 0.3}, ${w * 0.9} ${-l * 0.75}, 0 ${-l} C ${-w * 0.9} ${-l * 0.75}, ${-w} ${-l * 0.3}, 0 0 Z`;

// Petits points de texture sur le pot
const POINTS = Array.from({ length: 70 }, (_, i) => [
  305 + ((i * 53) % 130), 452 + ((i * 37) % 100), 0.8 + ((i * 7) % 5) * 0.35,
]);

function Plante() {
  return (
    <svg className="av-art" viewBox="0 0 500 600" aria-hidden="true">
      <defs>
        <linearGradient id="av-carte" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#C3DDBA" stopOpacity="0.42" />
          <stop offset="1" stopColor="#7BAE8A" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id="av-feuille" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#14381F" />
          <stop offset="0.45" stopColor="#2E6B3F" />
          <stop offset="1" stopColor="#5AA06D" />
        </linearGradient>
        <linearGradient id="av-panache" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#A1C29F" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#D9C99A" stopOpacity="0.75" />
          <stop offset="1" stopColor="#E6F2E1" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="av-pot" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#5AA06D" />
          <stop offset="0.45" stopColor="#2E6B3F" />
          <stop offset="1" stopColor="#0D1F16" />
        </radialGradient>
        <filter id="av-flou"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>

      {/* Carte claire à coin incliné */}
      <path
        d="M0 290 Q0 250 33 227 L297 43 Q330 20 330 60 L330 520 Q330 560 290 560 L40 560 Q0 560 0 520 Z"
        fill="url(#av-carte)"
      />

      {/* Ombre du pot */}
      <ellipse cx="378" cy="566" rx="92" ry="10" fill="#0D1F16" opacity="0.55" filter="url(#av-flou)" />

      {/* Feuilles */}
      {FEUILLES.map(([a, l, w]) => (
        <g key={a} transform={`translate(370 446) rotate(${a})`}>
          <path d={forme(l, w)} fill="url(#av-feuille)" />
          <path d={forme(l * 0.92, w * 0.42)} fill="url(#av-panache)" />
          <path d={`M0 0 Q ${w * 0.12} ${-l * 0.5} 0 ${-l}`} stroke="#E6F2E1" strokeOpacity="0.55" strokeWidth="1.4" fill="none" />
        </g>
      ))}

      {/* Pot */}
      <path d="M298 444 H442 C447 502 433 548 410 561 H330 C307 548 293 502 298 444 Z" fill="url(#av-pot)" />
      {POINTS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#C3DDBA" opacity="0.18" />
      ))}
      <path d="M312 456 C308 492 314 526 330 548" stroke="#E6F2E1" strokeOpacity="0.28" strokeWidth="7" strokeLinecap="round" fill="none" />
      <ellipse cx="370" cy="445" rx="72" ry="9" fill="#2a2216" stroke="#C9A86A" strokeWidth="3" />
    </svg>
  );
}

export default function AuthVisual() {
  return (
    <aside className="auth-visual">
      <div className="av-logo">
        <span className="av-logo-icon"><Leaf size={20} /></span>
        <span>AgriGestion</span>
      </div>

      <div className="av-scene">
        <Plante />
        <div className="av-texte">
          <h2>Semer.<br />Suivre.<br />Récolter.</h2>
          <p>Parcelles, cultures, intrants et récoltes réunis. Suivez vos rendements saison après saison.</p>
          <div className="av-pastille">
            <span className="av-pastille-icon"><Sprout size={14} /></span>
            <span>Gestion d’exploitation agricole</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
