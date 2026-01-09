// Banner data với SVG được encode thành base64
// Mỗi banner có layout và phong cách thiết kế hoàn toàn khác nhau

const createBannerSVG = (content: string): string => {
  const svg = `<svg width="1200" height="400" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

export const bannerImages = [
  {
    id: '1',
    // Banner 1: Modern Minimalist - Text lớn ở giữa, background gradient đơn giản
    src: createBannerSVG(`
<defs>
<linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
<stop offset="100%" style="stop-color:#1e1b4b;stop-opacity:1" />
</linearGradient>
<linearGradient id="textGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
<stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
</linearGradient>
<filter id="glow1">
<feGaussianBlur stdDeviation="8" result="coloredBlur"/>
<feMerge>
<feMergeNode in="coloredBlur"/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>
</defs>
<rect width="1200" height="400" fill="url(#bg1)"/>
<rect x="0" y="0" width="1200" height="400" fill="url(#bg1)" opacity="0.95"/>
<text x="600" y="160" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="url(#textGrad1)" text-anchor="middle" filter="url(#glow1)" letter-spacing="-0.02em">ShowBill</text>
<text x="600" y="220" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="#cbd5e1" text-anchor="middle" opacity="0.9">Nơi tổng hợp bill uy tín</text>
<text x="600" y="260" font-family="Arial, sans-serif" font-size="18" font-weight="400" fill="#94a3b8" text-anchor="middle" opacity="0.8">Tăng độ tin cậy • Xây dựng thương hiệu • Tạo niềm tin</text>
<circle cx="100" cy="100" r="2" fill="#a855f7" opacity="0.6"/>
<circle cx="1100" cy="300" r="2" fill="#ec4899" opacity="0.6"/>
<circle cx="200" cy="350" r="1.5" fill="#a855f7" opacity="0.4"/>
<circle cx="1000" cy="50" r="1.5" fill="#ec4899" opacity="0.4"/>
    `),
    alt: 'ShowBill - Nơi tổng hợp bill uy tín',
  },
  {
    id: '2',
    // Banner 2: Split Layout - Layout chia đôi với content ở hai bên
    src: createBannerSVG(`
<defs>
<linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
<stop offset="50%" style="stop-color:#312e81;stop-opacity:1" />
<stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
</linearGradient>
<linearGradient id="accent2" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
<stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
</linearGradient>
<filter id="glow2">
<feGaussianBlur stdDeviation="5" result="coloredBlur"/>
<feMerge>
<feMergeNode in="coloredBlur"/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>
</defs>
<rect width="1200" height="400" fill="url(#bg2)"/>
<line x1="600" y1="0" x2="600" y2="400" stroke="url(#accent2)" stroke-width="2" opacity="0.3" stroke-dasharray="8,4"/>
<rect x="50" y="80" width="480" height="240" rx="16" fill="rgba(99,102,241,0.1)" stroke="url(#accent2)" stroke-width="2" opacity="0.5"/>
<text x="290" y="160" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="#6366f1" text-anchor="middle" filter="url(#glow2)">TĂNG</text>
<text x="290" y="210" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="#6366f1" text-anchor="middle" filter="url(#glow2)">UY TÍN</text>
<text x="290" y="260" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#cbd5e1" text-anchor="middle" opacity="0.9">Với Bill Thật 100%</text>
<rect x="670" y="80" width="480" height="240" rx="16" fill="rgba(139,92,246,0.1)" stroke="url(#accent2)" stroke-width="2" opacity="0.5"/>
<circle cx="910" cy="150" r="50" fill="none" stroke="#8b5cf6" stroke-width="3" filter="url(#glow2)" opacity="0.7"/>
<path d="M 890 150 L 905 165 L 930 140" stroke="#8b5cf6" stroke-width="5" fill="none" filter="url(#glow2)" opacity="0.9"/>
<text x="910" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#cbd5e1" text-anchor="middle" opacity="0.9">Khách hàng tin tưởng</text>
<text x="910" y="260" font-family="Arial, sans-serif" font-size="16" font-weight="500" fill="#94a3b8" text-anchor="middle" opacity="0.8">Giao dịch minh bạch</text>
    `),
    alt: 'Tăng uy tín với bill thật',
  },
  {
    id: '3',
    // Banner 3: Card-based Layout - Các card/box với icon ở giữa
    src: createBannerSVG(`
<defs>
<linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
<stop offset="50%" style="stop-color:#1a0a2e;stop-opacity:1" />
<stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
</linearGradient>
<linearGradient id="cardGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#7c3aed;stop-opacity:0.2" />
<stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.2" />
</linearGradient>
<filter id="glow3">
<feGaussianBlur stdDeviation="6" result="coloredBlur"/>
<feMerge>
<feMergeNode in="coloredBlur"/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>
</defs>
<rect width="1200" height="400" fill="url(#bg3)"/>
<pattern id="dots3" width="20" height="20" patternUnits="userSpaceOnUse">
<circle cx="10" cy="10" r="1" fill="#7c3aed" opacity="0.1"/>
</pattern>
<rect width="1200" height="400" fill="url(#dots3)"/>
<rect x="200" y="100" width="200" height="200" rx="20" fill="url(#cardGrad3)" stroke="#7c3aed" stroke-width="2" filter="url(#glow3)" opacity="0.8"/>
<path d="M 250 150 Q 250 130 270 130 L 330 130 Q 350 130 350 150 L 350 190 Q 350 210 330 230 L 300 280 L 270 230 Q 250 210 250 190 Z" fill="none" stroke="#7c3aed" stroke-width="4" filter="url(#glow3)" opacity="0.9"/>
<path d="M 280 180 L 305 205 L 340 160" stroke="#7c3aed" stroke-width="5" fill="none" filter="url(#glow3)" opacity="1"/>
<text x="300" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#e5e7eb" text-anchor="middle">KIỂM CHỨNG</text>
<rect x="500" y="100" width="200" height="200" rx="20" fill="url(#cardGrad3)" stroke="#a855f7" stroke-width="2" filter="url(#glow3)" opacity="0.8"/>
<circle cx="600" cy="180" r="50" fill="none" stroke="#a855f7" stroke-width="4" filter="url(#glow3)" opacity="0.8"/>
<text x="600" y="195" font-family="Arial, sans-serif" font-size="36" font-weight="900" fill="#a855f7" text-anchor="middle" filter="url(#glow3)">100%</text>
<text x="600" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#e5e7eb" text-anchor="middle">ĐỘ TIN CẬY</text>
<rect x="800" y="100" width="200" height="200" rx="20" fill="url(#cardGrad3)" stroke="#8b5cf6" stroke-width="2" filter="url(#glow3)" opacity="0.8"/>
<rect x="850" y="150" width="100" height="100" rx="12" fill="none" stroke="#8b5cf6" stroke-width="3" filter="url(#glow3)" opacity="0.7"/>
<path d="M 870 190 L 890 210 L 930 170" stroke="#8b5cf6" stroke-width="5" fill="none" filter="url(#glow3)" opacity="0.9"/>
<text x="900" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#e5e7eb" text-anchor="middle">MINH BẠCH</text>
    `),
    alt: 'Kiểm chứng độ tin cậy',
  },
  {
    id: '4',
    // Banner 4: Asymmetric Layout - Layout không đối xứng với elements ở các góc
    src: createBannerSVG(`
<defs>
<linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#1e1b4b;stop-opacity:1" />
<stop offset="100%" style="stop-color:#312e81;stop-opacity:1" />
</linearGradient>
<linearGradient id="accent4" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
<stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
</linearGradient>
<filter id="glow4">
<feGaussianBlur stdDeviation="7" result="coloredBlur"/>
<feMerge>
<feMergeNode in="coloredBlur"/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>
<pattern id="grid4" width="30" height="30" patternUnits="userSpaceOnUse">
<path d="M 30 0 L 0 0 0 30" fill="none" stroke="#8b5cf6" stroke-width="0.5" opacity="0.15"/>
</pattern>
</defs>
<rect width="1200" height="400" fill="url(#bg4)"/>
<rect width="1200" height="400" fill="url(#grid4)"/>
<circle cx="150" cy="150" r="80" fill="rgba(139,92,246,0.15)" filter="url(#glow4)"/>
<circle cx="1050" cy="250" r="100" fill="rgba(168,85,247,0.12)" filter="url(#glow4)"/>
<circle cx="1000" cy="100" r="40" fill="rgba(139,92,246,0.2)" filter="url(#glow4)"/>
<circle cx="200" cy="320" r="50" fill="rgba(168,85,247,0.18)" filter="url(#glow4)"/>
<g transform="translate(400, 80)">
<circle cx="0" cy="0" r="60" fill="none" stroke="url(#accent4)" stroke-width="3" filter="url(#glow4)" opacity="0.7"/>
<circle cx="0" cy="-15" r="25" fill="none" stroke="url(#accent4)" stroke-width="2" filter="url(#glow4)" opacity="0.6"/>
<rect x="-30" y="10" width="60" height="40" rx="20" fill="none" stroke="url(#accent4)" stroke-width="2" filter="url(#glow4)" opacity="0.6"/>
</g>
<text x="600" y="200" font-family="Arial, sans-serif" font-size="56" font-weight="900" fill="url(#accent4)" text-anchor="middle" filter="url(#glow4)">ADMIN</text>
<text x="600" y="250" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#e5e7eb" text-anchor="middle" opacity="0.95">Chuyên Nghiệp &amp; Uy Tín</text>
<text x="600" y="290" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#cbd5e1" text-anchor="middle" opacity="0.85">Upload bill dễ dàng • Quản lý tập trung • Thống kê chi tiết</text>
<g transform="translate(850, 280)">
<rect x="0" y="0" width="120" height="80" rx="12" fill="rgba(139,92,246,0.15)" stroke="url(#accent4)" stroke-width="2" filter="url(#glow4)" opacity="0.6"/>
<text x="60" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="url(#accent4)" text-anchor="middle" filter="url(#glow4)">UPLOAD</text>
<text x="60" y="60" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#cbd5e1" text-anchor="middle" opacity="0.9">Dễ dàng</text>
</g>
<g transform="translate(230, 250)">
<rect x="0" y="0" width="100" height="100" rx="16" fill="rgba(168,85,247,0.15)" stroke="url(#accent4)" stroke-width="2" filter="url(#glow4)" opacity="0.6"/>
<circle cx="50" cy="35" r="20" fill="none" stroke="url(#accent4)" stroke-width="2" filter="url(#glow4)" opacity="0.7"/>
<text x="50" y="75" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#e5e7eb" text-anchor="middle" opacity="0.9">QUẢN LÝ</text>
</g>
    `),
    alt: 'Admin chuyên nghiệp',
  },
];
