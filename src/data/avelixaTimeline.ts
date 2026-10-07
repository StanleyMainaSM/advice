/**
 * Avelixa Video Data & Storyboard Timeline Definition
 * Video: "3 Mistakes Small Businesses Make Online"
 * Brand: Avelixa
 * Duration: 40 seconds (approximately 35-45s)
 * Format: 9:16 Vertical (primary), plus 16:9 Landscape & Shorts/Reels/Status
 * Visuals-Only (Zero synthesized audio) - Ready for external voiceover
 */

export interface AvelixaScene {
  id: string;
  sceneNumber: number;
  title: string;
  topic: string;
  start: number;
  end: number;
  visualDescription: string;
  keyTextOverlay: {
    headline: string;
    subheadline?: string;
    badge?: string;
    bulletPoints?: string[];
    callToAction?: string;
  };
  visualType: 
    | 'montage_social_search_web' 
    | 'mistake1_instagram_bio' 
    | 'mistake2_google_search' 
    | 'mistake3_mobile_responsiveness' 
    | 'outro_brand_summary';
  problemHighlight?: string;
  hasRedCross?: boolean;
}

export const AVELIXA_TOTAL_DURATION = 40.0; // 40 seconds

export const AVELIXA_SCENES: AvelixaScene[] = [
  {
    id: 'avelixa_scene_1',
    sceneNumber: 1,
    title: 'Fast Visual Montage & Title',
    topic: '3 Mistakes Small Businesses Make Online',
    start: 0,
    end: 4.0,
    visualDescription: 'Rapid succession montage: Instagram profile -> Google search ("boutiques near me") -> Business website -> WhatsApp customer chat. Ends on punchy title card.',
    keyTextOverlay: {
      badge: 'AVELIXA DIGITAL GUIDE',
      headline: '3 MISTAKES\nSMALL BUSINESSES\nMAKE ONLINE',
      subheadline: 'How to fix them & win real customers',
    },
    visualType: 'montage_social_search_web',
    hasRedCross: false,
  },
  {
    id: 'avelixa_scene_2',
    sceneNumber: 2,
    title: 'Mistake #1 — Missing Information',
    topic: 'Making customers search for information',
    start: 4.0,
    end: 13.0,
    visualDescription: 'Instagram profile zoom-in. Incomplete bio with missing address, hidden opening hours, missing direct contact WhatsApp, and vague description.',
    keyTextOverlay: {
      badge: 'MISTAKE #1',
      headline: 'Making customers search for information',
      bulletPoints: [
        'Hidden store location & city',
        'No direct phone / WhatsApp link',
        'Unclear opening hours',
        'Vague "DM for price" friction'
      ],
      callToAction: 'Rule: Make your details instantly visible within 3 seconds',
    },
    visualType: 'mistake1_instagram_bio',
    problemHighlight: 'No clear address · Missing contact link · "DM for price"',
    hasRedCross: true,
  },
  {
    id: 'avelixa_scene_3',
    sceneNumber: 3,
    title: 'Mistake #2 — Ignoring Google Discovery',
    topic: 'Ignoring Google',
    start: 13.0,
    end: 22.0,
    visualDescription: 'Realistic Google Search & Google Maps UI: "boutiques near me". Highlight competitor showing 5-star ratings, phone button & maps direction while target business has no listing.',
    keyTextOverlay: {
      badge: 'MISTAKE #2',
      headline: 'Ignoring Google',
      bulletPoints: [
        'No Google Business profile',
        'Missing from Google Maps search',
        'Losing ready-to-buy local customers',
        'Zero verified customer reviews'
      ],
      callToAction: 'Over 80% of local purchases begin with a Google search',
    },
    visualType: 'mistake2_google_search',
    problemHighlight: 'Business not found on Google Maps & Local search',
    hasRedCross: true,
  },
  {
    id: 'avelixa_scene_4',
    sceneNumber: 4,
    title: 'Mistake #3 — Bad Mobile Experience',
    topic: 'Forgetting mobile users',
    start: 22.0,
    end: 32.0,
    visualDescription: 'Side-by-side / progressive preview of mobile phone: broken non-responsive desktop layout, tiny unreadable font, sideways scrolling, and huge loading delay.',
    keyTextOverlay: {
      badge: 'MISTAKE #3',
      headline: 'Forgetting mobile users',
      bulletPoints: [
        'Text too small to read without zooming',
        'Horizontal scroll & broken layout',
        'Slow 6+ second page load on 4G',
        'Buttons impossible to tap on phone'
      ],
      callToAction: '70%+ of your web traffic comes directly from mobile phones',
    },
    visualType: 'mistake3_mobile_responsiveness',
    problemHighlight: 'Broken mobile layout · Tiny text · Slow load speed',
    hasRedCross: true,
  },
  {
    id: 'avelixa_scene_5',
    sceneNumber: 5,
    title: 'Outro — Avelixa Brand & Summary',
    topic: 'Summary & Call to Action',
    start: 32.0,
    end: 40.0,
    visualDescription: 'Clean premium brand card with Avelixa logo, 3 quick summary checkmarks, and high-converting call to action.',
    keyTextOverlay: {
      badge: 'TAKEAWAY',
      headline: 'Make it easy for customers to find you.',
      bulletPoints: [
        '✓ Clear social profiles & contact links',
        '✓ Optimized Google Maps & search presence',
        '✓ Lightning-fast mobile-friendly website'
      ],
      callToAction: 'Follow Avelixa for more business tips',
    },
    visualType: 'outro_brand_summary',
    hasRedCross: false,
  },
];

export interface AvelixaBrandConfig {
  companyName: string;
  tagline: string;
  accentColor: string;
  secondaryColor: string;
  website: string;
  handle: string;
  logoDataUrl?: string;
}

export const DEFAULT_AVELIXA_CONFIG: AvelixaBrandConfig = {
  companyName: 'Avelixa',
  tagline: 'Digital Growth & Web Presence for Businesses',
  accentColor: '#3b82f6', // Premium bright royal blue
  secondaryColor: '#10b981', // Clean Emerald accent
  website: 'avelixa.com',
  handle: '@avelixa',
};
