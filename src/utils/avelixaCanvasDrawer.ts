/**
 * Dedicated Canvas Drawing Engine for Avelixa "3 Mistakes Small Businesses Make Online"
 * Renders at exact 1080x1920 (9:16) or 1920x1080 (16:9)
 * High-definition vector graphics, realistic mockups, animations, red error crosses, and typography.
 */

import { AvelixaBrandConfig, AVELIXA_SCENES } from '../data/avelixaTimeline';

interface RenderOptions {
  time: number;
  width: number;
  height: number;
  aspectRatio: '9:16' | '16:9';
  brandConfig: AvelixaBrandConfig;
  customLogoImg?: HTMLImageElement | null;
}

export function drawAvelixaFrame(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
) {
  const { time, width, height, aspectRatio, brandConfig, customLogoImg } = options;
  const isLandscape = aspectRatio === '16:9';

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Background deep dark gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0f1d'); // deep midnight navy
  bgGrad.addColorStop(0.5, '#070b14');
  bgGrad.addColorStop(1, '#05070a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient glow
  const glowGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.35,
    10,
    width * 0.5,
    height * 0.35,
    width * 0.65
  );
  glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.12)'); // Avelixa royal blue glow
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // Find active scene
  const currentScene =
    AVELIXA_SCENES.find((s) => time >= s.start && time < s.end) ||
    AVELIXA_SCENES[AVELIXA_SCENES.length - 1];

  const sceneProgress = Math.min(
    1,
    Math.max(0, (time - currentScene.start) / (currentScene.end - currentScene.start))
  );

  // Header Bar with Avelixa Branding
  drawHeaderBranding(ctx, width, height, brandConfig, customLogoImg, isLandscape);

  // Render Scene based on type
  switch (currentScene.visualType) {
    case 'montage_social_search_web':
      renderScene1Montage(ctx, width, height, sceneProgress, isLandscape, time);
      break;
    case 'mistake1_instagram_bio':
      renderScene2Mistake1(ctx, width, height, sceneProgress, isLandscape);
      break;
    case 'mistake2_google_search':
      renderScene3Mistake2(ctx, width, height, sceneProgress, isLandscape);
      break;
    case 'mistake3_mobile_responsiveness':
      renderScene4Mistake3(ctx, width, height, sceneProgress, isLandscape);
      break;
    case 'outro_brand_summary':
      renderScene5Outro(ctx, width, height, sceneProgress, isLandscape, brandConfig, customLogoImg);
      break;
  }

  // Bottom Timeline Progress Indicator
  drawBottomProgress(ctx, width, height, time, 40.0);
}

// ----------------------------------------------------
// Header Branding
// ----------------------------------------------------
function drawHeaderBranding(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brand: AvelixaBrandConfig,
  logoImg?: HTMLImageElement | null,
  isLandscape: boolean = false
) {
  const padX = isLandscape ? width * 0.05 : width * 0.07;
  const topY = isLandscape ? height * 0.08 : height * 0.06;

  ctx.save();

  // Draw Logo icon or badge
  const iconSize = isLandscape ? 40 : 54;
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, padX, topY - iconSize * 0.6, iconSize, iconSize);
  } else {
    // Elegant Avelixa Hexagonal / Shield Logo Mark
    ctx.beginPath();
    const cx = padX + iconSize / 2;
    const cy = topY;
    const r = iconSize / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#60a5fa';
    ctx.stroke();

    // Letter 'A'
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${isLandscape ? 22 : 30}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', cx, cy);
  }

  // Company Name
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 26 : 36}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(brand.companyName, padX + iconSize + 16, topY - (isLandscape ? 4 : 6));

  // Subtitle/tag
  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${isLandscape ? 14 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Business Growth Tips', padX + iconSize + 16, topY + (isLandscape ? 16 : 22));

  // Right pill: Series marker
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  const pillW = isLandscape ? 150 : 200;
  const pillH = isLandscape ? 32 : 44;
  const pillX = width - padX - pillW;
  const pillY = topY - pillH / 2;

  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = `700 ${isLandscape ? 13 : 17}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('ONLINE STRATEGY', width - padX - 16, topY);

  ctx.restore();
}

// ----------------------------------------------------
// Scene 1: Fast Visual Montage (0 - 4s)
// ----------------------------------------------------
function renderScene1Montage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  isLandscape: boolean,
  time: number
) {
  ctx.save();

  // Calculate 4 sub-slices for the rapid montage (each 0.7s) then title card (1.2s - 4.0s)
  const montageStep = Math.min(3, Math.floor(time / 0.75));
  const isTitleCard = time >= 2.2;

  if (!isTitleCard) {
    // Rapid Montage Visuals
    const montageTitles = [
      { tag: 'INSTAGRAM PROFILE', title: 'Social Discovery', sub: 'First impressions matter online' },
      { tag: 'GOOGLE SEARCH', title: '"Boutiques Near Me"', sub: '80% search locally before buying' },
      { tag: 'BUSINESS WEBSITE', title: 'Web Experience', sub: 'Your digital storefront' },
      { tag: 'WHATSAPP CONVERSATION', title: 'Customer Chat', sub: 'Instant answers or lost leads' },
    ];
    const curMontage = montageTitles[montageStep] || montageTitles[0];

    // Card frame
    const cardW = isLandscape ? width * 0.55 : width * 0.86;
    const cardH = isLandscape ? height * 0.62 : height * 0.52;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    // Outer glow card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Internal mockup according to sub-step
    if (montageStep === 0) {
      drawInstagramProfileMini(ctx, cardX, cardY, cardW, cardH, false);
    } else if (montageStep === 1) {
      drawGoogleSearchMini(ctx, cardX, cardY, cardW, cardH);
    } else if (montageStep === 2) {
      drawWebsiteMini(ctx, cardX, cardY, cardW, cardH, true);
    } else {
      drawWhatsAppMini(ctx, cardX, cardY, cardW, cardH);
    }

    // Overlay tag on montage item
    ctx.fillStyle = 'rgba(2, 6, 23, 0.8)';
    const tagH = isLandscape ? 40 : 54;
    drawRoundedRect(ctx, cardX + 24, cardY + cardH - tagH - 24, cardW - 48, tagH, 16);
    ctx.fill();

    ctx.fillStyle = '#60a5fa';
    ctx.font = `800 ${isLandscape ? 15 : 20}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(curMontage.tag, cardX + 44, cardY + cardH - tagH / 2 - 24);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = `600 ${isLandscape ? 14 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(curMontage.title, cardX + cardW - 44, cardY + cardH - tagH / 2 - 24);

    // Flashing rapid countdown pill
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.font = `bold ${isLandscape ? 14 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(`FAST SCAN • ${montageStep + 1} OF 4`, width / 2, cardY - (isLandscape ? 24 : 32));
  } else {
    // -----------------------------------------
    // BIG INTRO TITLE CARD (Clean, Modern, Bold)
    // -----------------------------------------
    const titleProgress = Math.min(1, (time - 2.2) / 0.8);
    const scale = 0.95 + 0.05 * Math.sin((titleProgress * Math.PI) / 2);

    ctx.save();
    ctx.translate(width / 2, height * 0.48);
    ctx.scale(scale, scale);

    // Glowing badge pill
    const badgeText = 'AVELIXA BUSINESS BRIEF';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    const bW = isLandscape ? 280 : 360;
    const bH = isLandscape ? 40 : 52;
    drawRoundedRect(ctx, -bW / 2, -bH - (isLandscape ? 130 : 180), bW, bH, bH / 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#93c5fd';
    ctx.font = `800 ${isLandscape ? 15 : 20}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 0, -bH / 2 - (isLandscape ? 130 : 180));

    // MAIN TITLE
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // "3 MISTAKES" (Big red/orange or white gradient)
    ctx.fillStyle = '#f87171'; // red-400
    ctx.font = `900 ${isLandscape ? 60 : 86}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('3 MISTAKES', 0, isLandscape ? -70 : -95);

    // "SMALL BUSINESSES"
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${isLandscape ? 46 : 68}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('SMALL BUSINESSES', 0, isLandscape ? -2 : -5);

    // "MAKE ONLINE"
    const gradAccent = ctx.createLinearGradient(-150, 0, 150, 0);
    gradAccent.addColorStop(0, '#60a5fa');
    gradAccent.addColorStop(1, '#38bdf8');
    ctx.fillStyle = gradAccent;
    ctx.font = `900 ${isLandscape ? 48 : 72}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('MAKE ONLINE', 0, isLandscape ? 66 : 90);

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-160, isLandscape ? 115 : 155);
    ctx.lineTo(160, isLandscape ? 115 : 155);
    ctx.stroke();

    // Sub-text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `600 ${isLandscape ? 18 : 26}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('How to fix them & stop losing customers', 0, isLandscape ? 148 : 205);

    ctx.restore();
  }

  ctx.restore();
}

// ----------------------------------------------------
// Scene 2: Mistake #1 (4s - 13s)
// "Making customers search for information"
// ----------------------------------------------------
function renderScene2Mistake1(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  isLandscape: boolean
) {
  ctx.save();

  // Top Section: Mistake Badge & Headline
  const padX = isLandscape ? width * 0.08 : width * 0.07;
  const topY = isLandscape ? height * 0.16 : height * 0.13;

  drawMistakeBadge(ctx, padX, topY, 'MISTAKE #1', isLandscape);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 34 : 46}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Making customers search', padX, topY + (isLandscape ? 44 : 56));
  ctx.fillText('for information', padX, topY + (isLandscape ? 84 : 110));

  // Layout: Left/Top Mockup of Instagram Bio (showing missing info)
  // Right/Bottom: Problem points + Red cross animation
  const mockupW = isLandscape ? width * 0.42 : width * 0.86;
  const mockupH = isLandscape ? height * 0.62 : height * 0.44;
  const mockupX = isLandscape ? padX : (width - mockupW) / 2;
  const mockupY = isLandscape ? topY + 140 : topY + 180;

  // Zoom effect on bio area as progress advances
  const zoomFactor = 1 + 0.08 * Math.min(1, progress * 1.5);
  ctx.save();
  ctx.translate(mockupX + mockupW / 2, mockupY + mockupH * 0.35);
  ctx.scale(zoomFactor, zoomFactor);
  ctx.translate(-(mockupX + mockupW / 2), -(mockupY + mockupH * 0.35));

  drawInstagramProfileMini(ctx, mockupX, mockupY, mockupW, mockupH, true);
  ctx.restore();

  // Right side (Landscape) or Bottom (Vertical): Explanatory points
  const infoX = isLandscape ? width * 0.54 : padX;
  const infoY = isLandscape ? topY + 140 : mockupY + mockupH + 30;
  const infoW = isLandscape ? width * 0.38 : width * 0.86;

  // Problem highlights box
  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  drawRoundedRect(ctx, infoX, infoY, infoW, isLandscape ? 320 : 250, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Subtle Red X indicator at top-right of box
  drawRedCrossIcon(ctx, infoX + infoW - 40, infoY + 38, 22);

  // Issues list
  ctx.fillStyle = '#fca5a5';
  ctx.font = `800 ${isLandscape ? 17 : 22}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('CRITICAL PROFILE FRICTION:', infoX + 26, infoY + 24);

  const issues = [
    '❌ No address or city in bio',
    '❌ No direct WhatsApp or phone link',
    '❌ Opening hours completely hidden',
    '❌ "DM for price" drives 60%+ buyers away',
  ];

  ctx.fillStyle = '#f1f5f9';
  ctx.font = `600 ${isLandscape ? 15 : 20}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  const lineSpacing = isLandscape ? 40 : 36;
  issues.forEach((issue, idx) => {
    ctx.fillText(issue, infoX + 26, infoY + (isLandscape ? 70 : 66) + idx * lineSpacing);
  });

  // Call to action tip pill at bottom
  if (!isLandscape && infoY + 360 < height * 0.94) {
    const tipY = infoY + 270;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    drawRoundedRect(ctx, padX, tipY, width * 0.86, 52, 16);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💡 Rule: Customer must find answers in under 3 seconds', width / 2, tipY + 26);
  }

  ctx.restore();
}

// ----------------------------------------------------
// Scene 3: Mistake #2 (13s - 22s)
// "Ignoring Google"
// ----------------------------------------------------
function renderScene3Mistake2(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  isLandscape: boolean
) {
  ctx.save();

  const padX = isLandscape ? width * 0.08 : width * 0.07;
  const topY = isLandscape ? height * 0.16 : height * 0.13;

  drawMistakeBadge(ctx, padX, topY, 'MISTAKE #2', isLandscape);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 34 : 46}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Ignoring Google', padX, topY + (isLandscape ? 44 : 56));

  ctx.fillStyle = '#94a3b8';
  ctx.font = `600 ${isLandscape ? 18 : 24}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Where ready-to-buy local customers search first', padX, topY + (isLandscape ? 90 : 115));

  // Visual Mockup of Google Search & Maps Card
  const mockupW = isLandscape ? width * 0.44 : width * 0.86;
  const mockupH = isLandscape ? height * 0.62 : height * 0.46;
  const mockupX = isLandscape ? padX : (width - mockupW) / 2;
  const mockupY = isLandscape ? topY + 140 : topY + 170;

  drawGoogleSearchMini(ctx, mockupX, mockupY, mockupW, mockupH);

  // Problem Analysis Card
  const infoX = isLandscape ? width * 0.55 : padX;
  const infoY = isLandscape ? topY + 140 : mockupY + mockupH + 28;
  const infoW = isLandscape ? width * 0.37 : width * 0.86;

  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  drawRoundedRect(ctx, infoX, infoY, infoW, isLandscape ? 330 : 240, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRedCrossIcon(ctx, infoX + infoW - 40, infoY + 38, 22);

  ctx.fillStyle = '#fca5a5';
  ctx.font = `800 ${isLandscape ? 17 : 22}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('THE COST OF NO GOOGLE LISTING:', infoX + 26, infoY + 24);

  const points = [
    '❌ Invisible on Google Maps',
    '❌ Competitors capture nearby searchers',
    '❌ Zero verified Google reviews',
    '❌ Customers assume the business is closed',
  ];

  ctx.fillStyle = '#f1f5f9';
  ctx.font = `600 ${isLandscape ? 15 : 20}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const lineSpacing = isLandscape ? 42 : 36;
  points.forEach((p, idx) => {
    ctx.fillText(p, infoX + 26, infoY + (isLandscape ? 72 : 66) + idx * lineSpacing);
  });

  // Call to action tip
  if (!isLandscape && infoY + 330 < height * 0.94) {
    const tipY = infoY + 258;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    drawRoundedRect(ctx, padX, tipY, width * 0.86, 52, 16);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📍 Free Google Business profile = instant local traffic', width / 2, tipY + 26);
  }

  ctx.restore();
}

// ----------------------------------------------------
// Scene 4: Mistake #3 (22s - 32s)
// "Forgetting mobile users"
// ----------------------------------------------------
function renderScene4Mistake3(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  isLandscape: boolean
) {
  ctx.save();

  const padX = isLandscape ? width * 0.08 : width * 0.07;
  const topY = isLandscape ? height * 0.16 : height * 0.13;

  drawMistakeBadge(ctx, padX, topY, 'MISTAKE #3', isLandscape);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 34 : 46}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Forgetting mobile users', padX, topY + (isLandscape ? 44 : 56));

  ctx.fillStyle = '#94a3b8';
  ctx.font = `600 ${isLandscape ? 18 : 24}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Over 75% of your web traffic is on a phone', padX, topY + (isLandscape ? 90 : 115));

  // Phone Mockup with broken desktop site vs optimized
  const mockupW = isLandscape ? width * 0.42 : width * 0.86;
  const mockupH = isLandscape ? height * 0.62 : height * 0.46;
  const mockupX = isLandscape ? padX : (width - mockupW) / 2;
  const mockupY = isLandscape ? topY + 140 : topY + 170;

  drawWebsiteMini(ctx, mockupX, mockupY, mockupW, mockupH, false);

  // Problem Analysis Card
  const infoX = isLandscape ? width * 0.54 : padX;
  const infoY = isLandscape ? topY + 140 : mockupY + mockupH + 28;
  const infoW = isLandscape ? width * 0.38 : width * 0.86;

  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  drawRoundedRect(ctx, infoX, infoY, infoW, isLandscape ? 330 : 240, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRedCrossIcon(ctx, infoX + infoW - 40, infoY + 38, 22);

  ctx.fillStyle = '#fca5a5';
  ctx.font = `800 ${isLandscape ? 17 : 22}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('MOBILE DESIGN DISASTERS:', infoX + 26, infoY + 24);

  const points = [
    '❌ Tiny text that forces pinch & zoom',
    '❌ Horizontal sideways scrolling & clipping',
    '❌ Slow 5+ second load times on cellular',
    '❌ Tiny buttons impossible to tap',
  ];

  ctx.fillStyle = '#f1f5f9';
  ctx.font = `600 ${isLandscape ? 15 : 20}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const lineSpacing = isLandscape ? 42 : 36;
  points.forEach((p, idx) => {
    ctx.fillText(p, infoX + 26, infoY + (isLandscape ? 72 : 66) + idx * lineSpacing);
  });

  // Call to action tip
  if (!isLandscape && infoY + 330 < height * 0.94) {
    const tipY = infoY + 258;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    drawRoundedRect(ctx, padX, tipY, width * 0.86, 52, 16);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📱 Build mobile-first. If it fails on phone, it fails.', width / 2, tipY + 26);
  }

  ctx.restore();
}

// ----------------------------------------------------
// Scene 5: Outro Brand Summary (32s - 40s)
// ----------------------------------------------------
function renderScene5Outro(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  isLandscape: boolean,
  brand: AvelixaBrandConfig,
  logoImg?: HTMLImageElement | null
) {
  ctx.save();

  const centerX = width / 2;
  const centerY = isLandscape ? height * 0.48 : height * 0.44;

  // Background glow circle
  const glow = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, width * 0.5);
  glow.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Brand Centerpiece Logo
  const logoSize = isLandscape ? 90 : 120;
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, centerX - logoSize / 2, centerY - (isLandscape ? 170 : 250), logoSize, logoSize);
  } else {
    // Large Glowing Hexagon
    ctx.beginPath();
    const cx = centerX;
    const cy = centerY - (isLandscape ? 140 : 220);
    const r = logoSize / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#1d4ed8';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#60a5fa';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${isLandscape ? 44 : 58}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', cx, cy);
  }

  // Brand Name
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${isLandscape ? 46 : 64}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(brand.companyName, centerX, centerY - (isLandscape ? 60 : 120));

  // Headline: "Make it easy for customers to find you."
  ctx.fillStyle = '#38bdf8';
  ctx.font = `800 ${isLandscape ? 26 : 38}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Make it easy for customers to find you.', centerX, centerY - (isLandscape ? 10 : 50));

  // 3 Golden Checklist Rules
  const cardW = isLandscape ? width * 0.62 : width * 0.88;
  const cardH = isLandscape ? 150 : 200;
  const cardX = centerX - cardW / 2;
  const cardY = centerY + (isLandscape ? 40 : 15);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const rules = [
    '✓ 1. Clear social profile info & 1-click WhatsApp',
    '✓ 2. Verified Google Maps & local search presence',
    '✓ 3. Fast, mobile-responsive digital storefront',
  ];

  ctx.fillStyle = '#f8fafc';
  ctx.font = `600 ${isLandscape ? 17 : 22}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  const rowH = isLandscape ? 40 : 52;
  rules.forEach((rule, idx) => {
    ctx.fillText(rule, cardX + (isLandscape ? 30 : 28), cardY + (isLandscape ? 36 : 44) + idx * rowH);
  });

  // Call to Action Card
  const ctaY = cardY + cardH + (isLandscape ? 24 : 36);
  ctx.fillStyle = '#2563eb';
  drawRoundedRect(ctx, cardX, ctaY, cardW, isLandscape ? 56 : 76, isLandscape ? 28 : 38);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 20 : 28}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Follow Avelixa for more business tips', centerX, ctaY + (isLandscape ? 28 : 38));

  // Small website/handle footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${isLandscape ? 14 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${brand.website}  •  ${brand.handle}`, centerX, ctaY + (isLandscape ? 66 : 94));

  ctx.restore();
}

// ----------------------------------------------------
// UI Helpers & Component Mockups
// ----------------------------------------------------

function drawMistakeBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  isLandscape: boolean
) {
  ctx.save();
  const bW = isLandscape ? 140 : 180;
  const bH = isLandscape ? 32 : 40;

  ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
  drawRoundedRect(ctx, x, y, bW, bH, bH / 2);
  ctx.fill();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fca5a5';
  ctx.font = `800 ${isLandscape ? 14 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + bW / 2, y + bH / 2);
  ctx.restore();
}

function drawRedCrossIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  const arm = radius * 0.48;

  ctx.beginPath();
  ctx.moveTo(cx - arm, cy - arm);
  ctx.lineTo(cx + arm, cy + arm);
  ctx.moveTo(cx + arm, cy - arm);
  ctx.lineTo(cx - arm, cy + arm);
  ctx.stroke();

  ctx.restore();
}

function drawInstagramProfileMini(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  highlightBioIssues: boolean
) {
  ctx.save();

  // White clean smartphone mockup window
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, x, y, w, h, 24);
  ctx.fill();

  // Instagram top navigation bar
  ctx.fillStyle = '#fafafa';
  drawRoundedRect(ctx, x, y, w, 56, 24);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('elegance_boutique_official', x + w / 2, y + 28);

  // Profile avatar circle
  ctx.beginPath();
  ctx.arc(x + 55, y + 105, 36, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('EB', x + 55, y + 105);

  // Stats row (Posts, Followers, Following)
  const statX = x + 120;
  const statW = (w - 140) / 3;
  const stats = [
    { num: '142', label: 'Posts' },
    { num: '8.4K', label: 'Followers' },
    { num: '290', label: 'Following' },
  ];
  stats.forEach((s, i) => {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(s.num, statX + i * statW + statW / 2, y + 95);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(s.label, statX + i * statW + statW / 2, y + 115);
  });

  // Bio Area
  const bioY = y + 160;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Elegance Boutique • Women Fashion', x + 24, bioY);

  if (highlightBioIssues) {
    // Draw red highlight stroke around missing info
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    drawRoundedRect(ctx, x + 18, bioY + 12, w - 36, 95, 12);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚠️ Location: (NOT SPECIFIED)', x + 30, bioY + 36);
    ctx.fillText('⚠️ Hours: (NOT LISTED)', x + 30, bioY + 58);
    ctx.fillText('⚠️ Price: "DM for price only"', x + 30, bioY + 80);
    ctx.fillText('⚠️ Contact: No link or WhatsApp', x + 30, bioY + 100);
  } else {
    ctx.fillStyle = '#475569';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Trendy modern styles & accessories ✨', x + 24, bioY + 26);
    ctx.fillText('Worldwide delivery available.', x + 24, bioY + 48);
  }

  // Instagram Photo Grid Preview (3 columns)
  const gridY = bioY + 120;
  const colW = (w - 36) / 3;
  const imgH = Math.max(40, (h - (gridY - y) - 20) / 2);

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const gx = x + 12 + c * (colW + 6);
      const gy = gridY + r * (imgH + 6);
      if (gy + imgH <= y + h - 10) {
        ctx.fillStyle = r === 0 && c === 1 ? '#e0f2fe' : '#f1f5f9';
        drawRoundedRect(ctx, gx, gy, colW, imgH, 8);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

function drawGoogleSearchMini(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();

  // White Google search container
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, x, y, w, h, 24);
  ctx.fill();

  // Search input bar with Google colors
  const searchBarY = y + 20;
  ctx.fillStyle = '#f8fafc';
  drawRoundedRect(ctx, x + 16, searchBarY, w - 32, 48, 24);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // "Google" logo mini
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4285F4';
  ctx.fillText('G', x + 34, searchBarY + 24);

  // Search query
  ctx.fillStyle = '#0f172a';
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('boutiques near me', x + 58, searchBarY + 24);

  // Search magnifier
  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('🔍', x + w - 34, searchBarY + 24);

  // Map result box
  const mapY = searchBarY + 64;
  ctx.fillStyle = '#e2e8f0';
  drawRoundedRect(ctx, x + 16, mapY, w - 32, 100, 16);
  ctx.fill();

  // Stylized map grid
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 16, mapY + 40);
  ctx.lineTo(x + w - 16, mapY + 60);
  ctx.moveTo(x + w * 0.4, mapY);
  ctx.lineTo(x + w * 0.45, mapY + 100);
  ctx.stroke();

  // Competitor pin (Green/Red pins)
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(x + w * 0.35, mapY + 45, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(x + w * 0.75, mapY + 65, 10, 0, Math.PI * 2);
  ctx.fill();

  // Competitor listing vs Unlisted Business
  const listY = mapY + 115;

  // 1. Competitor listed with 5 stars
  ctx.fillStyle = '#f8fafc';
  drawRoundedRect(ctx, x + 16, listY, w - 32, 68, 12);
  ctx.fill();
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Downtown Chic Boutique', x + 28, listY + 12);
  ctx.fillStyle = '#eab308';
  ctx.font = '14px sans-serif';
  ctx.fillText('★ 4.9 (184 reviews) • Open now', x + 28, listY + 34);
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('✓ Directions • Call • Website', x + 28, listY + 50);

  // 2. Target Business missing / incomplete
  const listY2 = listY + 78;
  if (listY2 + 68 <= y + h - 10) {
    ctx.fillStyle = '#fef2f2';
    drawRoundedRect(ctx, x + 16, listY2, w - 32, 68, 12);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Your Store: (NOT LISTED)', x + 28, listY2 + 12);
    ctx.fillStyle = '#dc2626';
    ctx.font = '13px sans-serif';
    ctx.fillText('❌ 0 reviews • Customers cannot find you', x + 28, listY2 + 34);
  }

  ctx.restore();
}

function drawWebsiteMini(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isMontage: boolean
) {
  ctx.save();

  // Smartphone frame with broken desktop website
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, x, y, w, h, 28);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Screen inner
  const sX = x + 10;
  const sY = y + 10;
  const sW = w - 20;
  const sH = h - 20;
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, sX, sY, sW, sH, 20);
  ctx.fill();

  // Browser Address bar
  ctx.fillStyle = '#f1f5f9';
  drawRoundedRect(ctx, sX, sY, sW, 36, 16);
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔒 yourshopname.com', sX + sW / 2, sY + 18);

  if (!isMontage) {
    // Show deliberately terrible mobile responsiveness:
    // Tiny unreadable font, huge image overflowing, sideways scrollbar
    const contentY = sY + 44;

    // Red warning ribbon across top
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(sX, contentY, sW, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠️ DESKTOP-ONLY SITE SQUEEZED ON MOBILE', sX + sW / 2, contentY + 13);

    // Huge overflowing image clipped
    ctx.fillStyle = '#94a3b8';
    drawRoundedRect(ctx, sX + 10, contentY + 36, sW * 1.5, 90, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('[Over-sized banner overflowing screen ->]', sX + 20, contentY + 80);

    // Tiny micro text
    ctx.fillStyle = '#475569';
    ctx.font = '7px sans-serif';
    for (let i = 0; i < 6; i++) {
      ctx.fillText(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        sX + 10,
        contentY + 140 + i * 11
      );
    }

    // Huge annoying pop-up overlapping close button
    const popY = contentY + 215;
    if (popY + 60 <= sY + sH) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      drawRoundedRect(ctx, sX + 16, popY, sW - 32, 60, 10);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Uncloseable Newsletter Pop-up', sX + sW / 2, popY + 24);
      ctx.fillStyle = '#f87171';
      ctx.fillText('[X button is clipped off-screen]', sX + sW / 2, popY + 44);
    }
  } else {
    // Clean responsive mockup
    const contentY = sY + 44;
    ctx.fillStyle = '#2563eb';
    drawRoundedRect(ctx, sX + 12, contentY + 10, sW - 24, 80, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Modern Mobile Store', sX + sW / 2, contentY + 44);
    ctx.font = '12px sans-serif';
    ctx.fillText('Fast 1-click shopping', sX + sW / 2, contentY + 68);
  }

  ctx.restore();
}

function drawWhatsAppMini(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = '#0b141a'; // WhatsApp Dark Theme
  drawRoundedRect(ctx, x, y, w, h, 24);
  ctx.fill();

  // Header
  ctx.fillStyle = '#202c33';
  drawRoundedRect(ctx, x, y, w, 56, 24);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Customer Support (Avelixa)', x + 24, y + 28);

  // Chat Bubbles
  const bubbleY1 = y + 75;
  // Customer
  ctx.fillStyle = '#202c33';
  drawRoundedRect(ctx, x + 20, bubbleY1, w * 0.68, 48, 12);
  ctx.fill();
  ctx.fillStyle = '#e9edef';
  ctx.font = '13px sans-serif';
  ctx.fillText('Hi! Where are you located?', x + 32, bubbleY1 + 18);
  ctx.fillText('And what time do you close?', x + 32, bubbleY1 + 34);

  // Business instant reply
  const bubbleY2 = bubbleY1 + 60;
  ctx.fillStyle = '#005c4b';
  drawRoundedRect(ctx, x + w * 0.3, bubbleY2, w * 0.66, 48, 12);
  ctx.fill();
  ctx.fillStyle = '#e9edef';
  ctx.fillText('Open 9am-8pm on Main St!', x + w * 0.3 + 14, bubbleY2 + 18);
  ctx.fillText('Check out our catalog link below 🛍️', x + w * 0.3 + 14, bubbleY2 + 34);

  ctx.restore();
}

function drawBottomProgress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  currentTime: number,
  totalDuration: number
) {
  ctx.save();
  const barH = 6;
  const barY = height - barH;
  const progressRatio = Math.min(1, Math.max(0, currentTime / totalDuration));

  // Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, barY, width, barH);

  // Fill
  const fillGrad = ctx.createLinearGradient(0, barY, width, barY);
  fillGrad.addColorStop(0, '#3b82f6');
  fillGrad.addColorStop(1, '#60a5fa');
  ctx.fillStyle = fillGrad;
  ctx.fillRect(0, barY, width * progressRatio, barH);

  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
