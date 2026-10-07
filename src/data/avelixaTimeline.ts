/**
 * Avelixa Video Data & Storyboard Timeline Definition
 * Video: "3 Mistakes Small Businesses Make Online"
 * Brand: Avelixa
 * Dynamic target duration: 15s, 30s, 40s (default), 45s, 60s, 90s
 * Multiple Visual Sourcing:
 *  - High-fidelity realistic UI recreation (default)
 *  - User uploaded image
 *  - User provided image URL
 *  - Webpage / reference URL screenshot
 */

export type VisualSourceType = 'generated_realistic' | 'uploaded_image' | 'image_url' | 'webpage_url';

export interface SceneVisualSource {
  type: VisualSourceType;
  customImageUrl?: string; // Data URL or external image URL
  webpageUrl?: string;     // Reference webpage URL
  altDescription?: string;
  loadedImage?: HTMLImageElement | null;
}

export interface AvelixaScene {
  id: string;
  sceneNumber: number;
  title: string;
  topic: string;
  start: number;
  end: number;
  duration: number;
  visualDescription: string;
  visualSource: SceneVisualSource;
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

export const DURATION_OPTIONS = [15, 30, 40, 45, 60, 90] as const;
export type TargetDurationOption = (typeof DURATION_OPTIONS)[number];

export const DEFAULT_AVELIXA_DURATION = 40.0; // 40 seconds

/**
 * Default base proportions for the 5 scenes:
 * Scene 1 (Opening): 10% of total time (~4.0s for 40s)
 * Scene 2 (Mistake #1): 22.5% (~9.0s for 40s)
 * Scene 3 (Mistake #2): 22.5% (~9.0s for 40s)
 * Scene 4 (Mistake #3): 25.0% (~10.0s for 40s)
 * Scene 5 (Ending): 20.0% (~8.0s for 40s)
 */
export const SCENE_BASE_RATIOS = [0.10, 0.225, 0.225, 0.25, 0.20];

export const INITIAL_SCENES: AvelixaScene[] = [
  {
    id: 'avelixa_scene_1',
    sceneNumber: 1,
    title: 'Opening Montage & Strong Hook',
    topic: '3 Mistakes Small Businesses Make Online',
    start: 0,
    end: 4.0,
    duration: 4.0,
    visualDescription: 'Fast realistic UI montage: Instagram business profile (0-0.8s) -> Google search "boutiques near me" (0.8-1.6s) -> Small business website (1.6-2.4s) -> WhatsApp customer chat (2.4-3.2s) -> Bold title card.',
    visualSource: {
      type: 'generated_realistic',
    },
    keyTextOverlay: {
      badge: 'AVELIXA BUSINESS GUIDE',
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
    duration: 9.0,
    visualDescription: 'Realistic Instagram business profile on a smartphone. Smooth zoom into the profile and bio area. Highlights missing store location, no contact link, hidden opening hours, and "DM for price" friction.',
    visualSource: {
      type: 'generated_realistic',
    },
    keyTextOverlay: {
      badge: 'MISTAKE #1',
      headline: 'Making customers search for information',
      bulletPoints: [
        'Hidden store address & location',
        'No direct WhatsApp or contact link',
        'Unclear opening hours',
        'Frustrating "DM for price" friction'
      ],
      callToAction: 'Rule: Make vital information clear in under 3 seconds',
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
    duration: 9.0,
    visualDescription: 'Realistic Google Search & Google Maps interface for "boutiques near me". Demonstrates local map pack with verified 5-star businesses vs unlisted businesses that lose nearby ready-to-buy customers.',
    visualSource: {
      type: 'generated_realistic',
    },
    keyTextOverlay: {
      badge: 'MISTAKE #2',
      headline: 'Ignoring Google',
      bulletPoints: [
        'No Google Business profile',
        'Missing from local Google Maps search',
        'Losing ready-to-buy local customers',
        'Zero verified customer reviews'
      ],
      callToAction: 'Over 80% of local purchases begin with a Google search',
    },
    visualType: 'mistake2_google_search',
    problemHighlight: 'Business invisible on Google Maps & Local search',
    hasRedCross: true,
  },
  {
    id: 'avelixa_scene_4',
    sceneNumber: 4,
    title: 'Mistake #3 — Bad Mobile Experience',
    topic: 'Forgetting mobile users',
    start: 22.0,
    end: 32.0,
    duration: 10.0,
    visualDescription: 'Business website on a smartphone. First shows a poor mobile experience with tiny unreadable text, broken desktop layout, and red X. Then smoothly transitions to a clean, fast responsive mobile site with green checkmark.',
    visualSource: {
      type: 'generated_realistic',
    },
    keyTextOverlay: {
      badge: 'MISTAKE #3',
      headline: 'Forgetting mobile users',
      bulletPoints: [
        'Tiny text forcing manual zoom',
        'Broken horizontal layout overflow',
        'Slow 6+ second mobile load time',
        'Unclickable tiny buttons'
      ],
      callToAction: '70%+ of your web traffic comes directly from mobile phones',
    },
    visualType: 'mistake3_mobile_responsiveness',
    problemHighlight: 'Poor desktop layout on mobile vs Clean responsive mobile site',
    hasRedCross: true,
  },
  {
    id: 'avelixa_scene_5',
    sceneNumber: 5,
    title: 'Ending — Avelixa Call to Action',
    topic: 'Summary & Call to Action',
    start: 32.0,
    end: 40.0,
    duration: 8.0,
    visualDescription: 'Clean professional ending with Avelixa logo, 3-step solution checklist, and bold closing action: "Make it easy for customers to find you." -> "Follow Avelixa for more business tips."',
    visualSource: {
      type: 'generated_realistic',
    },
    keyTextOverlay: {
      badge: 'TAKEAWAY',
      headline: 'Make it easy for customers to find you.',
      bulletPoints: [
        '✓ Clear social profiles & contact links',
        '✓ Optimized Google Maps & search presence',
        '✓ Lightning-fast mobile-friendly website'
      ],
      callToAction: 'Follow Avelixa for more business tips.',
    },
    visualType: 'outro_brand_summary',
    hasRedCross: false,
  },
];

/**
 * Re-calculates scene timestamps when durations change or target duration changes
 */
export function recalculateSceneTimeline(
  scenes: AvelixaScene[],
  targetDuration?: number
): AvelixaScene[] {
  if (targetDuration && targetDuration > 0) {
    // Scale existing durations proportionally to match targetDuration
    const currentSum = scenes.reduce((acc, s) => acc + s.duration, 0);
    const scale = currentSum > 0 ? targetDuration / currentSum : 1;

    let cursor = 0;
    return scenes.map((scene, idx) => {
      // For the last scene, snap to exact targetDuration
      let newDur: number;
      if (idx === scenes.length - 1) {
        newDur = Math.max(1, +(targetDuration - cursor).toFixed(1));
      } else {
        newDur = +(scene.duration * scale).toFixed(1);
      }
      const start = +cursor.toFixed(1);
      const end = +(cursor + newDur).toFixed(1);
      cursor = end;
      return {
        ...scene,
        start,
        end,
        duration: newDur,
      };
    });
  }

  // Recalculate start and end from raw duration values
  let cursor = 0;
  return scenes.map((scene) => {
    const start = +cursor.toFixed(1);
    const end = +(cursor + scene.duration).toFixed(1);
    cursor = end;
    return {
      ...scene,
      start,
      end,
      duration: +scene.duration.toFixed(1),
    };
  });
}

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
  accentColor: '#2563eb', // Royal Blue
  secondaryColor: '#10b981', // Clean Emerald
  website: 'avelixa.com',
  handle: '@avelixa',
};
