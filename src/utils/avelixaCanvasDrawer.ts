/**
 * High-Fidelity Vector & Digital Interface Mockup Drawer for Avelixa Explainer Videos
 * 
 * Provides:
 * 1. Pixel-perfect realistic Instagram Profile on modern smartphone (avatar, stats, verified badge, story highlights, bio friction, grid)
 * 2. Pixel-perfect realistic Google Search & Google Maps local pack ("boutiques near me", stars, address, directions, calls, missing listing alert)
 * 3. Pixel-perfect realistic WhatsApp Customer/Business conversation (dark theme, green bubbles, read ticks, timestamps)
 * 4. Realistic Mobile Website Comparison (Broken non-responsive desktop site vs Modern responsive mobile store)
 * 5. Dynamic visual sourcing support: custom uploaded image, external image URL, or high-fidelity UI recreation fallback
 */

import { AvelixaScene, AvelixaBrandConfig } from '../data/avelixaTimeline';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  time: number;
  width: number;
  height: number;
  isLandscape: boolean;
  brand: AvelixaBrandConfig;
  customLogoImg?: HTMLImageElement | null;
  scenes: AvelixaScene[];
  totalDuration: number;
  customImagesMap: Map<string, HTMLImageElement>;
}

export function drawAvelixaFrame(
  ctx: CanvasRenderingContext2D,
  options: {
    time: number;
    width: number;
    height: number;
    aspectRatio: '9:16' | '16:9';
    brandConfig: AvelixaBrandConfig;
    customLogoImg?: HTMLImageElement | null;
    scenes: AvelixaScene[];
    totalDuration: number;
    customImagesMap?: Map<string, HTMLImageElement>;
  }
) {
  const {
    time,
    width,
    height,
    aspectRatio,
    brandConfig,
    customLogoImg,
    scenes,
    totalDuration,
    customImagesMap = new Map(),
  } = options;

  const isLandscape = aspectRatio === '16:9';

  // 1. Clear background
  ctx.clearRect(0, 0, width, height);

  // 2. High-end modern dark studio backdrop with subtle radial depth
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#060910');
  bgGrad.addColorStop(1, '#030509');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient radial glow behind the primary mockups
  const glow = ctx.createRadialGradient(
    width * 0.5,
    height * (isLandscape ? 0.45 : 0.38),
    20,
    width * 0.5,
    height * (isLandscape ? 0.45 : 0.38),
    width * 0.7
  );
  glow.addColorStop(0, 'rgba(37, 99, 235, 0.15)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // 3. Find current active scene
  const currentScene =
    scenes.find((s) => time >= s.start && time < s.end) ||
    scenes[scenes.length - 1];

  const sceneElapsed = Math.max(0, time - currentScene.start);
  const sceneProgress = Math.min(
    1,
    Math.max(0, sceneElapsed / Math.max(0.1, currentScene.duration))
  );

  const context: RenderContext = {
    ctx,
    time,
    width,
    height,
    isLandscape,
    brand: brandConfig,
    customLogoImg,
    scenes,
    totalDuration,
    customImagesMap,
  };

  // 4. Header Bar Branding (Avelixa badge & category tag)
  drawHeaderBranding(context);

  // 5. Check if user configured a custom image source for this scene
  const customImg = customImagesMap.get(currentScene.id);
  const hasCustomVisual =
    (currentScene.visualSource.type === 'uploaded_image' ||
      currentScene.visualSource.type === 'image_url' ||
      currentScene.visualSource.type === 'webpage_url') &&
    customImg &&
    customImg.complete &&
    customImg.naturalWidth > 0;

  if (hasCustomVisual && currentScene.visualType !== 'outro_brand_summary') {
    // Render custom visual in a phone frame or landscape monitor frame, then overlay headline text
    renderCustomSourceVisual(context, currentScene, customImg!, sceneProgress);
  } else {
    // Render high-fidelity realistic digital interface according to scene specification
    switch (currentScene.visualType) {
      case 'montage_social_search_web':
        renderScene1Montage(context, currentScene, sceneElapsed, sceneProgress);
        break;
      case 'mistake1_instagram_bio':
        renderScene2Mistake1(context, currentScene, sceneProgress);
        break;
      case 'mistake2_google_search':
        renderScene3Mistake2(context, currentScene, sceneProgress);
        break;
      case 'mistake3_mobile_responsiveness':
        renderScene4Mistake3(context, currentScene, sceneProgress);
        break;
      case 'outro_brand_summary':
        renderScene5Outro(context, currentScene, sceneProgress);
        break;
    }
  }

  // 6. Scrub line at very bottom edge
  drawBottomTimeline(context);
}

// ----------------------------------------------------
// Header Branding (Avelixa)
// ----------------------------------------------------
function drawHeaderBranding(rc: RenderContext) {
  const { ctx, width, height, isLandscape, brand, customLogoImg } = rc;
  const padX = isLandscape ? width * 0.05 : width * 0.07;
  const topY = isLandscape ? height * 0.075 : height * 0.058;

  ctx.save();

  // Avelixa Logo icon
  const iconSize = isLandscape ? 40 : 54;
  if (customLogoImg && customLogoImg.complete && customLogoImg.naturalWidth > 0) {
    ctx.drawImage(customLogoImg, padX, topY - iconSize * 0.5, iconSize, iconSize);
  } else {
    // Professional Geometric Avelixa Hexagon Shield
    const cx = padX + iconSize / 2;
    const cy = topY;
    const r = iconSize / 2;

    ctx.beginPath();
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

  // Small subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${isLandscape ? 14 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Digital Growth & Strategy', padX + iconSize + 16, topY + (isLandscape ? 16 : 22));

  // Right pill: Series marker
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  const pillW = isLandscape ? 160 : 210;
  const pillH = isLandscape ? 32 : 44;
  const pillX = width - padX - pillW;
  const pillY = topY - pillH / 2;

  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = `700 ${isLandscape ? 13 : 17}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('BUSINESS GUIDE', width - padX - 16, topY);

  ctx.restore();
}

// ----------------------------------------------------
// Custom Visual Source Render (When uploaded or URL given)
// ----------------------------------------------------
function renderCustomSourceVisual(
  rc: RenderContext,
  scene: AvelixaScene,
  img: HTMLImageElement,
  progress: number
) {
  const { ctx, width, height, isLandscape } = rc;
  const padX = isLandscape ? width * 0.08 : width * 0.07;
  const topY = isLandscape ? height * 0.16 : height * 0.13;

  ctx.save();

  // Draw Scene Headline
  drawMistakeBadge(ctx, padX, topY, `MISTAKE #${scene.sceneNumber - 1}`, isLandscape);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 34 : 44}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(scene.keyTextOverlay.headline, padX, topY + (isLandscape ? 44 : 54));

  // Device Frame holding the custom screenshot
  const frameW = isLandscape ? width * 0.44 : width * 0.86;
  const frameH = isLandscape ? height * 0.64 : height * 0.46;
  const frameX = isLandscape ? padX : (width - frameW) / 2;
  const frameY = isLandscape ? topY + 120 : topY + 160;

  // Outer phone / monitor container
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 24);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw image scaled to fit inside with aspect preserved
  ctx.save();
  drawRoundedRect(ctx, frameX + 6, frameY + 6, frameW - 12, frameH - 12, 18);
  ctx.clip();

  // Image drawing (cover mode)
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const targetW = frameW - 12;
  const targetH = frameH - 12;
  const scale = Math.max(targetW / imgW, targetH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const dx = frameX + 6 + (targetW - dw) / 2;
  const dy = frameY + 6 + (targetH - dh) / 2;

  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  // Side/Bottom Problem Card
  const infoX = isLandscape ? width * 0.55 : padX;
  const infoY = isLandscape ? frameY : frameY + frameH + 24;
  const infoW = isLandscape ? width * 0.37 : width * 0.86;

  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  drawRoundedRect(ctx, infoX, infoY, infoW, isLandscape ? 320 : 230, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (scene.hasRedCross) {
    drawRedCrossIcon(ctx, infoX + infoW - 40, infoY + 36, 20);
  }

  ctx.fillStyle = '#fca5a5';
  ctx.font = `800 ${isLandscape ? 17 : 21}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('CRITICAL PROBLEM IDENTIFIED:', infoX + 24, infoY + 22);

  if (scene.keyTextOverlay.bulletPoints) {
    ctx.fillStyle = '#f1f5f9';
    ctx.font = `600 ${isLandscape ? 15 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const spacing = isLandscape ? 40 : 34;
    scene.keyTextOverlay.bulletPoints.forEach((pt, i) => {
      ctx.fillText(`❌ ${pt}`, infoX + 24, infoY + (isLandscape ? 66 : 60) + i * spacing);
    });
  }

  ctx.restore();
}

// ----------------------------------------------------
// SCENE 1: FAST REALISTIC VISUAL MONTAGE & TITLE CARD
// 0.0–0.8s: Instagram profile on smartphone
// 0.8–1.6s: Google search interface ("boutiques near me")
// 1.6–2.4s: Professional business website on smartphone
// 2.4–3.2s: WhatsApp business conversation
// 3.2–4.0s: Bold punchy title screen
// ----------------------------------------------------
function renderScene1Montage(
  rc: RenderContext,
  scene: AvelixaScene,
  sceneElapsed: number,
  sceneProgress: number
) {
  const { ctx, width, height, isLandscape } = rc;

  // The 4 sub-sequences occur between 0 and 3.2 seconds
  const isTitleCard = sceneElapsed >= 3.2;

  if (!isTitleCard) {
    // 0.0-0.8s -> Step 0 (Instagram)
    // 0.8-1.6s -> Step 1 (Google)
    // 1.6-2.4s -> Step 2 (Website)
    // 2.4-3.2s -> Step 3 (WhatsApp)
    const step = Math.min(3, Math.floor(sceneElapsed / 0.8));
    const stepLabels = [
      { tag: 'INSTAGRAM BUSINESS PROFILE', title: 'Social Discovery' },
      { tag: 'GOOGLE SEARCH RESULTS', title: '"Boutiques Near Me"' },
      { tag: 'BUSINESS STOREFRONT WEBSITE', title: 'Mobile Experience' },
      { tag: 'WHATSAPP CUSTOMER CHAT', title: 'Direct Messaging' },
    ];
    const currentStep = stepLabels[step];

    // Phone / Tablet frame container
    const cardW = isLandscape ? width * 0.45 : width * 0.84;
    const cardH = isLandscape ? height * 0.65 : height * 0.58;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2 - 20;

    // Draw Realistic Smartphone Frame
    drawRealisticPhoneFrame(ctx, cardX, cardY, cardW, cardH, () => {
      if (step === 0) {
        drawRealisticInstagramProfile(ctx, cardX, cardY, cardW, cardH, false);
      } else if (step === 1) {
        drawRealisticGoogleSearch(ctx, cardX, cardY, cardW, cardH, false);
      } else if (step === 2) {
        drawRealisticBusinessWebsite(ctx, cardX, cardY, cardW, cardH, true);
      } else {
        drawRealisticWhatsAppChat(ctx, cardX, cardY, cardW, cardH);
      }
    });

    // Tag Banner under phone
    const tagH = isLandscape ? 44 : 56;
    const tagY = cardY + cardH + (isLandscape ? 14 : 20);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    drawRoundedRect(ctx, cardX, tagY, cardW, tagH, 16);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.font = `800 ${isLandscape ? 14 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentStep.tag, cardX + 24, tagY + tagH / 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${isLandscape ? 14 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`STEP ${step + 1} OF 4`, cardX + cardW - 24, tagY + tagH / 2);
  } else {
    // ----------------------------------------------------
    // Bold, Clean, Modern Title Card (3.2s – 4.0s)
    // ----------------------------------------------------
    const titleProgress = Math.min(1, (sceneElapsed - 3.2) / 0.6);
    const scale = 0.95 + 0.05 * Math.sin((titleProgress * Math.PI) / 2);

    ctx.save();
    ctx.translate(width / 2, height * 0.48);
    ctx.scale(scale, scale);

    // Glowing Badge Pill
    const badgeW = isLandscape ? 280 : 380;
    const badgeH = isLandscape ? 38 : 50;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
    drawRoundedRect(ctx, -badgeW / 2, -badgeH - (isLandscape ? 130 : 180), badgeW, badgeH, badgeH / 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#93c5fd';
    ctx.font = `800 ${isLandscape ? 15 : 20}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AVELIXA BUSINESS EXPLAINER', 0, -badgeH / 2 - (isLandscape ? 130 : 180));

    // MAIN TITLE
    // "3 MISTAKES" (Bold Red-Orange Alert Color)
    ctx.fillStyle = '#f87171';
    ctx.font = `900 ${isLandscape ? 62 : 88}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('3 MISTAKES', 0, isLandscape ? -65 : -90);

    // "SMALL BUSINESSES" (Crisp White)
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${isLandscape ? 48 : 68}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('SMALL BUSINESSES', 0, isLandscape ? 2 : 2);

    // "MAKE ONLINE" (Royal Blue Gradient)
    const titleGrad = ctx.createLinearGradient(-150, 0, 150, 0);
    titleGrad.addColorStop(0, '#60a5fa');
    titleGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = titleGrad;
    ctx.font = `900 ${isLandscape ? 50 : 72}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('MAKE ONLINE', 0, isLandscape ? 70 : 96);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-160, isLandscape ? 116 : 160);
    ctx.lineTo(160, isLandscape ? 116 : 160);
    ctx.stroke();

    // Subheadline
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `600 ${isLandscape ? 18 : 26}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('How to fix them & win real customers', 0, isLandscape ? 148 : 208);

    ctx.restore();
  }
}

// ----------------------------------------------------
// SCENE 2: MISTAKE #1 — MAKING CUSTOMERS SEARCH FOR INFO
// Realistic Instagram Business Profile + Zoom into Bio + Red X
// ----------------------------------------------------
function renderScene2Mistake1(
  rc: RenderContext,
  scene: AvelixaScene,
  progress: number
) {
  const { ctx, width, height, isLandscape } = rc;
  const padX = isLandscape ? width * 0.08 : width * 0.07;
  const topY = isLandscape ? height * 0.16 : height * 0.13;

  ctx.save();

  // Top Section: Mistake Badge & Headline
  drawMistakeBadge(ctx, padX, topY, 'MISTAKE #1', isLandscape);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 34 : 44}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Making customers search', padX, topY + (isLandscape ? 44 : 54));
  ctx.fillText('for information', padX, topY + (isLandscape ? 84 : 106));

  // Phone Mockup Size & Coordinates
  const phoneW = isLandscape ? width * 0.42 : width * 0.86;
  const phoneH = isLandscape ? height * 0.62 : height * 0.45;
  const phoneX = isLandscape ? padX : (width - phoneW) / 2;
  const phoneY = isLandscape ? topY + 138 : topY + 172;

  // Smooth cinematic zoom into bio area as time passes
  const zoomFactor = 1 + 0.1 * Math.min(1, progress * 1.8);
  ctx.save();
  ctx.translate(phoneX + phoneW / 2, phoneY + phoneH * 0.35);
  ctx.scale(zoomFactor, zoomFactor);
  ctx.translate(-(phoneX + phoneW / 2), -(phoneY + phoneH * 0.35));

  drawRealisticPhoneFrame(ctx, phoneX, phoneY, phoneW, phoneH, () => {
    drawRealisticInstagramProfile(ctx, phoneX, phoneY, phoneW, phoneH, true);
  });
  ctx.restore();

  // Problem Analysis Breakdown Card
  const infoX = isLandscape ? width * 0.54 : padX;
  const infoY = isLandscape ? topY + 138 : phoneY + phoneH + 26;
  const infoW = isLandscape ? width * 0.38 : width * 0.86;

  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  drawRoundedRect(ctx, infoX, infoY, infoW, isLandscape ? 330 : 240, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Red X Indicator Badge
  drawRedCrossIcon(ctx, infoX + infoW - 40, infoY + 36, 20);

  ctx.fillStyle = '#fca5a5';
  ctx.font = `800 ${isLandscape ? 17 : 21}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('HIGH-FRICTION BIO BLUNDERS:', infoX + 24, infoY + 22);

  const issues = [
    '❌ No location, store address or city',
    '❌ No direct WhatsApp or tap-to-call link',
    '❌ Opening & closing hours completely hidden',
    '❌ "DM for price" loses 65%+ of ready buyers',
  ];

  ctx.fillStyle = '#f1f5f9';
  ctx.font = `600 ${isLandscape ? 15 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const spacing = isLandscape ? 40 : 34;
  issues.forEach((issue, idx) => {
    ctx.fillText(issue, infoX + 24, infoY + (isLandscape ? 68 : 62) + idx * spacing);
  });

  // Safe-area Bottom Rule Pill (on vertical screens)
  if (!isLandscape && infoY + 320 < height * 0.94) {
    const tipY = infoY + 252;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    drawRoundedRect(ctx, padX, tipY, width * 0.86, 50, 16);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💡 Rule: Customers must find answers in under 3 seconds', width / 2, tipY + 25);
  }

  ctx.restore();
}

// ----------------------------------------------------
// SCENE 3: MISTAKE #2 — IGNORING GOOGLE
// Realistic Google Search + Maps local pack + Red X on unlisted business
// ----------------------------------------------------
function renderScene3Mistake2(
  rc: RenderContext,
  scene: AvelixaScene,
  progress: number
) {
  const { ctx, width, height, isLandscape } = rc;
  const padX = isLandscape ? width * 0.08 : width * 0.07;
  const topY = isLandscape ? height * 0.16 : height * 0.13;

  ctx.save();

  drawMistakeBadge(ctx, padX, topY, 'MISTAKE #2', isLandscape);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 34 : 44}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Ignoring Google', padX, topY + (isLandscape ? 44 : 54));

  ctx.fillStyle = '#94a3b8';
  ctx.font = `600 ${isLandscape ? 17 : 23}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Where ready-to-buy customers search locally first', padX, topY + (isLandscape ? 88 : 110));

  // Phone frame displaying Google Search UI
  const phoneW = isLandscape ? width * 0.44 : width * 0.86;
  const phoneH = isLandscape ? height * 0.62 : height * 0.46;
  const phoneX = isLandscape ? padX : (width - phoneW) / 2;
  const phoneY = isLandscape ? topY + 138 : topY + 168;

  drawRealisticPhoneFrame(ctx, phoneX, phoneY, phoneW, phoneH, () => {
    drawRealisticGoogleSearch(ctx, phoneX, phoneY, phoneW, phoneH, true);
  });

  // Problem Analysis Breakdown Card
  const infoX = isLandscape ? width * 0.55 : padX;
  const infoY = isLandscape ? topY + 138 : phoneY + phoneH + 24;
  const infoW = isLandscape ? width * 0.37 : width * 0.86;

  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  drawRoundedRect(ctx, infoX, infoY, infoW, isLandscape ? 330 : 230, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRedCrossIcon(ctx, infoX + infoW - 40, infoY + 36, 20);

  ctx.fillStyle = '#fca5a5';
  ctx.font = `800 ${isLandscape ? 17 : 21}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('THE COST OF ZERO GOOGLE PRESENCE:', infoX + 24, infoY + 22);

  const points = [
    '❌ Invisible on Google Maps local search',
    '❌ Nearby competitors steal ready buyers',
    '❌ Zero verified customer star reviews',
    '❌ Customers assume the business is closed',
  ];

  ctx.fillStyle = '#f1f5f9';
  ctx.font = `600 ${isLandscape ? 15 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const spacing = isLandscape ? 40 : 34;
  points.forEach((p, idx) => {
    ctx.fillText(p, infoX + 24, infoY + (isLandscape ? 68 : 62) + idx * spacing);
  });

  if (!isLandscape && infoY + 310 < height * 0.94) {
    const tipY = infoY + 246;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    drawRoundedRect(ctx, padX, tipY, width * 0.86, 50, 16);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📍 Free Google Business profile = instant local discovery', width / 2, tipY + 25);
  }

  ctx.restore();
}

// ----------------------------------------------------
// SCENE 4: MISTAKE #3 — FORGETTING MOBILE USERS
// First shows poor mobile experience with Red X,
// then transitions to responsive mobile site with Green Check!
// ----------------------------------------------------
function renderScene4Mistake3(
  rc: RenderContext,
  scene: AvelixaScene,
  progress: number
) {
  const { ctx, width, height, isLandscape } = rc;
  const padX = isLandscape ? width * 0.08 : width * 0.07;
  const topY = isLandscape ? height * 0.16 : height * 0.13;

  ctx.save();

  drawMistakeBadge(ctx, padX, topY, 'MISTAKE #3', isLandscape);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 34 : 44}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Forgetting mobile users', padX, topY + (isLandscape ? 44 : 54));

  ctx.fillStyle = '#94a3b8';
  ctx.font = `600 ${isLandscape ? 17 : 23}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Over 75% of your web visitors browse on a smartphone', padX, topY + (isLandscape ? 88 : 110));

  // Determine transition between Broken Site (first 50% of scene) vs Responsive Site (second 50%)
  const isResponsiveTransition = progress > 0.52;

  const phoneW = isLandscape ? width * 0.42 : width * 0.86;
  const phoneH = isLandscape ? height * 0.62 : height * 0.46;
  const phoneX = isLandscape ? padX : (width - phoneW) / 2;
  const phoneY = isLandscape ? topY + 138 : topY + 168;

  drawRealisticPhoneFrame(ctx, phoneX, phoneY, phoneW, phoneH, () => {
    drawRealisticBusinessWebsite(ctx, phoneX, phoneY, phoneW, phoneH, isResponsiveTransition);
  });

  // Problem / Solution Comparison Card
  const infoX = isLandscape ? width * 0.54 : padX;
  const infoY = isLandscape ? topY + 138 : phoneY + phoneH + 24;
  const infoW = isLandscape ? width * 0.38 : width * 0.86;

  if (!isResponsiveTransition) {
    // Problem state (Red X)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    drawRoundedRect(ctx, infoX, infoY, infoW, isLandscape ? 330 : 230, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawRedCrossIcon(ctx, infoX + infoW - 40, infoY + 36, 20);

    ctx.fillStyle = '#fca5a5';
    ctx.font = `800 ${isLandscape ? 17 : 21}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('MOBILE DESIGN DISASTERS:', infoX + 24, infoY + 22);

    const points = [
      '❌ Tiny text that forces manual pinch & zoom',
      '❌ Horizontal sideways scroll & clipped banners',
      '❌ Slow 6+ second load times on cellular',
      '❌ Tiny unclickable buttons that frustrate buyers',
    ];

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `600 ${isLandscape ? 15 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const spacing = isLandscape ? 40 : 34;
    points.forEach((p, idx) => {
      ctx.fillText(p, infoX + 24, infoY + (isLandscape ? 68 : 62) + idx * spacing);
    });
  } else {
    // Solution state (Green Checkmark!)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    drawRoundedRect(ctx, infoX, infoY, infoW, isLandscape ? 330 : 230, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawGreenCheckIcon(ctx, infoX + infoW - 40, infoY + 36, 20);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = `800 ${isLandscape ? 17 : 21}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('THE SOLUTION: MOBILE-FIRST STORE:', infoX + 24, infoY + 22);

    const solutions = [
      '✓ Clean vertical stack layout for all screen sizes',
      '✓ Large bold readable typography',
      '✓ 1-tap WhatsApp and checkout buttons',
      '✓ Under 2-second lightning mobile load speed',
    ];

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `600 ${isLandscape ? 15 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const spacing = isLandscape ? 40 : 34;
    solutions.forEach((s, idx) => {
      ctx.fillText(s, infoX + 24, infoY + (isLandscape ? 68 : 62) + idx * spacing);
    });
  }

  if (!isLandscape && infoY + 310 < height * 0.94) {
    const tipY = infoY + 246;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    drawRoundedRect(ctx, padX, tipY, width * 0.86, 50, 16);
    ctx.fill();
    ctx.fillStyle = isResponsiveTransition ? '#34d399' : '#38bdf8';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📱 Build mobile-first: If it fails on phone, it fails.', width / 2, tipY + 25);
  }

  ctx.restore();
}

// ----------------------------------------------------
// SCENE 5: OUTRO BRAND & CALL TO ACTION
// "Make it easy for customers to find you."
// "Follow Avelixa for more business tips."
// ----------------------------------------------------
function renderScene5Outro(
  rc: RenderContext,
  scene: AvelixaScene,
  progress: number
) {
  const { ctx, width, height, isLandscape, brand, customLogoImg } = rc;

  ctx.save();
  const centerX = width / 2;
  const centerY = isLandscape ? height * 0.48 : height * 0.44;

  // Background glow
  const glow = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, width * 0.55);
  glow.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Brand Centerpiece Logo
  const logoSize = isLandscape ? 90 : 120;
  if (customLogoImg && customLogoImg.complete && customLogoImg.naturalWidth > 0) {
    ctx.drawImage(customLogoImg, centerX - logoSize / 2, centerY - (isLandscape ? 170 : 250), logoSize, logoSize);
  } else {
    const cx = centerX;
    const cy = centerY - (isLandscape ? 140 : 220);
    const r = logoSize / 2;

    ctx.beginPath();
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

  // Primary Headline: "Make it easy for customers to find you."
  ctx.fillStyle = '#38bdf8';
  ctx.font = `800 ${isLandscape ? 26 : 38}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('Make it easy for customers to find you.', centerX, centerY - (isLandscape ? 10 : 50));

  // 3 Golden Checklist Rules
  const cardW = isLandscape ? width * 0.64 : width * 0.88;
  const cardH = isLandscape ? 150 : 200;
  const cardX = centerX - cardW / 2;
  const cardY = centerY + (isLandscape ? 40 : 15);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const rules = [
    '✓ 1. Clear social profile info & 1-tap WhatsApp link',
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

  // Call to Action Button
  const ctaY = cardY + cardH + (isLandscape ? 24 : 36);
  ctx.fillStyle = '#2563eb';
  drawRoundedRect(ctx, cardX, ctaY, cardW, isLandscape ? 56 : 76, isLandscape ? 28 : 38);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isLandscape ? 20 : 28}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Follow Avelixa for more business tips.', centerX, ctaY + (isLandscape ? 28 : 38));

  // Handle & Website
  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${isLandscape ? 14 : 19}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${brand.website}  •  ${brand.handle}`, centerX, ctaY + (isLandscape ? 66 : 94));

  ctx.restore();
}

// ----------------------------------------------------
// REALISTIC DIGITAL INTERFACE GENERATION MODULES
// ----------------------------------------------------

/**
 * Realistic Smartphone Frame (Bezel, speaker, clean glass screen)
 */
function drawRealisticPhoneFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  renderContent: () => void
) {
  ctx.save();

  // Phone body outer chassis
  ctx.fillStyle = '#0b0f19';
  drawRoundedRect(ctx, x, y, w, h, 28);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Glass Screen (inner clipped area)
  const pad = 6;
  const screenX = x + pad;
  const screenY = y + pad;
  const screenW = w - pad * 2;
  const screenH = h - pad * 2;

  ctx.save();
  drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 22);
  ctx.clip();

  // White base background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(screenX, screenY, screenW, screenH);

  // Render internal application mockup
  renderContent();

  // Smartphone Top Speaker / Dynamic Notch
  const notchW = Math.min(100, screenW * 0.35);
  const notchH = 14;
  ctx.fillStyle = '#0b0f19';
  drawRoundedRect(ctx, screenX + (screenW - notchW) / 2, screenY, notchW, notchH, 7);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

/**
 * Realistic Instagram Business Profile
 */
function drawRealisticInstagramProfile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  highlightFriction: boolean
) {
  ctx.save();

  // White canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);

  // 1. Instagram Top Bar
  const barH = 50;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, barH);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + barH);
  ctx.lineTo(x + w, y + barH);
  ctx.stroke();

  // Username in top bar
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('aurora_boutique_official', x + w / 2, y + barH / 2);

  // 2. Profile Photo & Followers/Following Row
  const rowY = y + barH + 20;

  // Profile Avatar with Instagram Story Gradient Ring
  const avatarX = x + 44;
  const avatarY = rowY + 28;
  const avatarR = 28;

  // Gradient story ring
  const ringGrad = ctx.createLinearGradient(avatarX - avatarR, avatarY - avatarR, avatarX + avatarR, avatarY + avatarR);
  ringGrad.addColorStop(0, '#f59e0b');
  ringGrad.addColorStop(0.5, '#ec4899');
  ringGrad.addColorStop(1, '#8b5cf6');
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR + 3, 0, Math.PI * 2);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner avatar circle
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AB', avatarX, avatarY);

  // Stats Counters (Posts, Followers, Following)
  const statsX = x + 95;
  const statColW = (w - 110) / 3;
  const stats = [
    { num: '148', label: 'Posts' },
    { num: '9.2K', label: 'Followers' },
    { num: '320', label: 'Following' },
  ];
  stats.forEach((s, idx) => {
    const cx = statsX + idx * statColW + statColW / 2;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(s.num, cx, rowY + 20);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(s.label, cx, rowY + 38);
  });

  // 3. Bio Information Area
  const bioY = rowY + 68;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Business Name & Category
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Aurora Boutique • Women Fashion', x + 20, bioY);

  ctx.fillStyle = '#64748b';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Clothing Brand · Retail & Orders', x + 20, bioY + 20);

  if (highlightFriction) {
    // Red highlighted box pointing out the missing details
    const boxY = bioY + 42;
    const boxH = 92;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    drawRoundedRect(ctx, x + 16, boxY, w - 32, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚠️ Location: (MISSING — WHERE ARE YOU?)', x + 26, boxY + 12);
    ctx.fillText('⚠️ Opening Hours: (NOT LISTED)', x + 26, boxY + 32);
    ctx.fillText('⚠️ Contact Link: (NO WHATSAPP / TAP TO CALL)', x + 26, boxY + 52);
    ctx.fillText('⚠️ Price Info: "DM FOR PRICE ONLY" (FRICTION)', x + 26, boxY + 72);
  } else {
    // Clean standard bio
    ctx.fillStyle = '#334155';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Trendy modern styles, bags & accessories ✨', x + 20, bioY + 42);
    ctx.fillText('Worldwide shipping available 📦', x + 20, bioY + 60);
  }

  // 4. Action Buttons (Follow, Message, Contact)
  const btnY = bioY + (highlightFriction ? 144 : 90);
  const btnW = (w - 48) / 2;

  ctx.fillStyle = '#0284c7';
  drawRoundedRect(ctx, x + 20, btnY, btnW, 32, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Follow', x + 20 + btnW / 2, btnY + 16);

  ctx.fillStyle = '#f1f5f9';
  drawRoundedRect(ctx, x + 28 + btnW, btnY, btnW, 32, 8);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Message', x + 28 + btnW + btnW / 2, btnY + 16);

  // 5. Story Highlights Circles
  const storyY = btnY + 46;
  const storyR = 18;
  const stories = ['New In', 'Outfits', 'Reviews', 'Sale'];
  const storySpacing = (w - 40) / 4;

  stories.forEach((st, idx) => {
    const cx = x + 20 + idx * storySpacing + storySpacing / 2;
    ctx.beginPath();
    ctx.arc(cx, storyY + storyR, storyR, 0, Math.PI * 2);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(st, cx, storyY + storyR * 2 + 12);
  });

  // 6. Photo Grid (3 columns)
  const gridY = storyY + 60;
  const colW = (w - 36) / 3;
  const rowH = 46;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const gx = x + 14 + c * (colW + 4);
      const gy = gridY + r * (rowH + 4);
      if (gy + rowH <= y + h - 10) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#f8fafc' : '#f1f5f9';
        drawRoundedRect(ctx, gx, gy, colW, rowH, 4);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/**
 * Realistic Google Search & Maps Local Results Interface
 */
function drawRealisticGoogleSearch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  highlightMissingListing: boolean
) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);

  // 1. Google Search Header & Query Bar
  const searchY = y + 16;
  ctx.fillStyle = '#f8fafc';
  drawRoundedRect(ctx, x + 16, searchY, w - 32, 46, 23);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Google G Icon
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4285F4';
  ctx.fillText('G', x + 34, searchY + 23);

  // Search Query: "boutiques near me"
  ctx.fillStyle = '#0f172a';
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('boutiques near me', x + 58, searchY + 23);

  // Search magnifier
  ctx.fillStyle = '#64748b';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('🔍', x + w - 34, searchY + 23);

  // 2. Google Maps Result Banner
  const mapY = searchY + 58;
  const mapH = 90;
  ctx.fillStyle = '#e2e8f0';
  drawRoundedRect(ctx, x + 16, mapY, w - 32, mapH, 14);
  ctx.fill();

  // Stylized map streets
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 16, mapY + 35);
  ctx.lineTo(x + w - 16, mapY + 55);
  ctx.moveTo(x + w * 0.42, mapY);
  ctx.lineTo(x + w * 0.46, mapY + mapH);
  ctx.stroke();

  // Competitor Green/Red Pins on Map
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(x + w * 0.35, mapY + 40, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(x + w * 0.72, mapY + 55, 8, 0, Math.PI * 2);
  ctx.fill();

  // 3. Local Business Listings (3-Pack)
  const listY = mapY + mapH + 14;

  // #1: Verified Competitor with 4.9 Stars
  const card1H = 68;
  ctx.fillStyle = '#f8fafc';
  drawRoundedRect(ctx, x + 16, listY, w - 32, card1H, 12);
  ctx.fill();
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Downtown Chic Boutique', x + 28, listY + 10);
  ctx.fillStyle = '#eab308';
  ctx.font = '13px sans-serif';
  ctx.fillText('★ 4.9 (248 reviews) · Women clothing', x + 28, listY + 30);
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('✓ Open now · Directions · Call (555) 0192', x + 28, listY + 48);

  // #2: Target Business (Unlisted / Missing)
  const list2Y = listY + card1H + 12;
  const card2H = 72;
  if (list2Y + card2H <= y + h - 10) {
    if (highlightMissingListing) {
      ctx.fillStyle = '#fef2f2';
      drawRoundedRect(ctx, x + 16, list2Y, w - 32, card2H, 12);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Your Store: (NOT LISTED ON GOOGLE)', x + 28, list2Y + 10);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('❌ 0 Reviews · No Map Pin · Invisible to Searchers', x + 28, list2Y + 32);
      ctx.fillText('❌ Ready local buyers go straight to competitors', x + 28, list2Y + 50);
    } else {
      ctx.fillStyle = '#f8fafc';
      drawRoundedRect(ctx, x + 16, list2Y, w - 32, card2H, 12);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('The Style Room', x + 28, list2Y + 10);
      ctx.fillStyle = '#eab308';
      ctx.font = '13px sans-serif';
      ctx.fillText('★ 4.7 (89 reviews) · Closes 8 PM', x + 28, list2Y + 30);
    }
  }

  ctx.restore();
}

/**
 * Realistic WhatsApp Business Customer Chat
 */
function drawRealisticWhatsAppChat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = '#0b141a'; // WhatsApp Dark Theme
  ctx.fillRect(x, y, w, h);

  // WhatsApp Header
  const headerH = 54;
  ctx.fillStyle = '#202c33';
  ctx.fillRect(x, y, w, headerH);

  // Avatar circle
  ctx.beginPath();
  ctx.arc(x + 36, y + headerH / 2, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#2563eb';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', x + 36, y + headerH / 2);

  // Name & Status
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e9edef';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Avelixa Business Support', x + 64, y + 20);
  ctx.fillStyle = '#8696a0';
  ctx.font = '12px sans-serif';
  ctx.fillText('Official Business Account • Online', x + 64, y + 36);

  // Chat Bubbles
  const bubble1Y = y + 80;
  // Customer Message (Left / Gray bubble)
  ctx.fillStyle = '#202c33';
  drawRoundedRect(ctx, x + 18, bubble1Y, w * 0.74, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#e9edef';
  ctx.font = '13px sans-serif';
  ctx.fillText('Hi! Where is your boutique located?', x + 28, bubble1Y + 18);
  ctx.fillText('And can I visit today at 6 PM?', x + 28, bubble1Y + 36);

  // Business Instant Reply (Right / WhatsApp Green bubble)
  const bubble2Y = bubble1Y + 70;
  ctx.fillStyle = '#005c4b';
  drawRoundedRect(ctx, x + w * 0.22, bubble2Y, w * 0.74, 62, 12);
  ctx.fill();
  ctx.fillStyle = '#e9edef';
  ctx.fillText('Hello! We are open until 8 PM today at', x + w * 0.22 + 14, bubble2Y + 18);
  ctx.fillText('420 Market Street. See you soon! 🛍️', x + w * 0.22 + 14, bubble2Y + 36);
  ctx.fillStyle = '#53bdeb';
  ctx.font = '11px sans-serif';
  ctx.fillText('10:42 AM  ✓✓', x + w * 0.22 + w * 0.74 - 72, bubble2Y + 50);

  ctx.restore();
}

/**
 * Realistic Business Website (Broken Non-responsive vs Clean Responsive)
 */
function drawRealisticBusinessWebsite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isResponsive: boolean
) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);

  // Browser Address bar
  const navH = 46;
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(x, y, w, navH);
  ctx.fillStyle = '#475569';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔒 https://boutiquestore.com', x + w / 2, y + navH / 2);

  if (!isResponsive) {
    // ----------------------------------------------------
    // BROKEN NON-RESPONSIVE DESKTOP LAYOUT SQUEEZED
    // ----------------------------------------------------
    // Warning banner across top
    const warnY = y + navH;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x, warnY, w, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠️ DESKTOP SITE SQUEEZED ON PHONE SCREEN', x + w / 2, warnY + 14);

    // Overflowing huge image clipped sideways
    const imgY = warnY + 38;
    ctx.fillStyle = '#94a3b8';
    drawRoundedRect(ctx, x + 12, imgY, w * 1.5, 96, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('[Desktop banner overflowing off-screen ➜]', x + 24, imgY + 54);

    // Tiny micro unreadable text
    ctx.fillStyle = '#475569';
    ctx.font = '7px sans-serif';
    for (let i = 0; i < 7; i++) {
      ctx.fillText(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem.',
        x + 12,
        imgY + 115 + i * 11
      );
    }

    // Annoying pop-up banner covering content with clipped close button
    const popY = imgY + 200;
    if (popY + 60 <= y + h) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      drawRoundedRect(ctx, x + 16, popY, w - 32, 60, 10);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Subscribe to newsletter', x + w / 2, popY + 24);
      ctx.fillStyle = '#f87171';
      ctx.fillText('[Close button is cut off screen]', x + w / 2, popY + 44);
    }
  } else {
    // ----------------------------------------------------
    // CLEAN RESPONSIVE MOBILE WEBSITE
    // ----------------------------------------------------
    const bodyY = y + navH + 10;

    // Clean Mobile Hero Card
    ctx.fillStyle = '#2563eb';
    drawRoundedRect(ctx, x + 14, bodyY, w - 28, 110, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('New Spring Collection', x + w / 2, bodyY + 36);

    ctx.font = '13px sans-serif';
    ctx.fillText('Fast 1-click mobile ordering', x + w / 2, bodyY + 62);

    // 1-Tap WhatsApp Button
    const ctaY = bodyY + 76;
    ctx.fillStyle = '#22c55e';
    drawRoundedRect(ctx, x + w / 2 - 80, ctaY, 160, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Order on WhatsApp 🛍️', x + w / 2, ctaY + 13);

    // 2-Column Responsive Product Cards
    const prodY = bodyY + 124;
    const prodW = (w - 38) / 2;
    const prodH = 68;

    for (let c = 0; c < 2; c++) {
      const px = x + 14 + c * (prodW + 10);
      ctx.fillStyle = '#f8fafc';
      drawRoundedRect(ctx, px, prodY, prodW, prodH, 10);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(c === 0 ? 'Silk Dress' : 'Leather Bag', px + prodW / 2, prodY + 24);
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(c === 0 ? '$45.00' : '$68.00', px + prodW / 2, prodY + 46);
    }
  }

  ctx.restore();
}

// ----------------------------------------------------
// UI ICONS & DRAWING HELPERS
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

function drawGreenCheckIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.45, cy);
  ctx.lineTo(cx - radius * 0.1, cy + radius * 0.38);
  ctx.lineTo(cx + radius * 0.45, cy - radius * 0.35);
  ctx.stroke();

  ctx.restore();
}

function drawBottomTimeline(rc: RenderContext) {
  const { ctx, width, height, time, totalDuration } = rc;
  const barH = 6;
  const barY = height - barH;
  const ratio = Math.min(1, Math.max(0, time / totalDuration));

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, barY, width, barH);

  const fillGrad = ctx.createLinearGradient(0, barY, width, barY);
  fillGrad.addColorStop(0, '#3b82f6');
  fillGrad.addColorStop(1, '#60a5fa');
  ctx.fillStyle = fillGrad;
  ctx.fillRect(0, barY, width * ratio, barH);
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
