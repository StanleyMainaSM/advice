/**
 * Complete synchronized storyboard timeline for the mentor advice recording.
 * Duration: 210 seconds (03:30).
 * 46 distinct visual sections matching dialogue line-for-line and phrase-for-phrase.
 * Pure static photorealistic imagery with clean hard cuts on dialogue boundaries.
 * 
 * Supports both:
 * - 9:16 Vertical compositions (Instagram Reels / TikTok / YouTube Shorts)
 * - 16:9 Horizontal compositions (Normal YouTube Videos)
 */

// 15 Photorealistic 9:16 Vertical Assets
import mentorCloseup from '../assets/images/mentor_intense_closeup_1790526165248.jpg';
import youngManReaction from '../assets/images/young_man_reaction_1790526175969.jpg';
import overShoulder from '../assets/images/over_shoulder_mentor_1790526191711.jpg';
import twoShot from '../assets/images/two_shot_conversation_1790526201836.jpg';
import mentorHands from '../assets/images/mentor_hands_desk_1790526214745.jpg';
import stocksChart from '../assets/images/stocks_chart_desk_1790602267594.jpg';
import coinsSavings from '../assets/images/coins_savings_shillings_1790602280850.jpg';
import businessPlans from '../assets/images/business_workshop_plans_1790602332334.jpg';
import patiencePlant from '../assets/images/patience_growing_plant_1790602344783.jpg';
import avoidScams from '../assets/images/avoid_scams_caution_1790602358525.jpg';
import hourglassTime from '../assets/images/antique_hourglass_time_1790602370355.jpg';
import youngManNotes from '../assets/images/young_man_notes_1790602385484.jpg';
import mentorSmile from '../assets/images/mentor_warm_smile_1790602395743.jpg';
import familyBookshelf from '../assets/images/family_bookshelf_warmth_1790602408151.jpg';
import multipleIncome from '../assets/images/multiple_income_streams_1790602420879.jpg';

// Dedicated Native 16:9 Landscape Assets (Widescreen cinematic compositions)
import mentorTwoShot16x9 from '../assets/images/mentor_two_shot_16x9_1790606251443.jpg';
import mentorClose16x9 from '../assets/images/mentor_close_16x9_1790606275011.jpg';
import youngMan16x9 from '../assets/images/young_man_16x9_1790606288164.jpg';
import financeDesk16x9 from '../assets/images/finance_desk_16x9_1790606303618.jpg';
import mentorSmile16x9 from '../assets/images/mentor_smile_16x9_1790606317928.jpg';

export type StoryboardImageKey =
  | 'mentor_closeup'
  | 'young_man_reaction'
  | 'over_shoulder'
  | 'two_shot'
  | 'mentor_hands'
  | 'stocks_chart'
  | 'coins_savings'
  | 'business_plans'
  | 'patience_plant'
  | 'avoid_scams'
  | 'hourglass_time'
  | 'young_man_notes'
  | 'mentor_smile'
  | 'family_bookshelf'
  | 'multiple_income';

// 9:16 Vertical image assets map
export const SHOT_IMAGES_9_16: Record<StoryboardImageKey, string> = {
  mentor_closeup: mentorCloseup,
  young_man_reaction: youngManReaction,
  over_shoulder: overShoulder,
  two_shot: twoShot,
  mentor_hands: mentorHands,
  stocks_chart: stocksChart,
  coins_savings: coinsSavings,
  business_plans: businessPlans,
  patience_plant: patiencePlant,
  avoid_scams: avoidScams,
  hourglass_time: hourglassTime,
  young_man_notes: youngManNotes,
  mentor_smile: mentorSmile,
  family_bookshelf: familyBookshelf,
  multiple_income: multipleIncome,
};

// 16:9 Horizontal landscape image assets map
// Uses native widescreen compositions for character scenes, ensuring natural 16:9 framing without distortion
export const SHOT_IMAGES_16_9: Record<StoryboardImageKey, string> = {
  mentor_closeup: mentorClose16x9,
  young_man_reaction: youngMan16x9,
  over_shoulder: mentorTwoShot16x9,
  two_shot: mentorTwoShot16x9,
  mentor_hands: financeDesk16x9,
  stocks_chart: financeDesk16x9,
  coins_savings: financeDesk16x9,
  business_plans: businessPlans,
  patience_plant: patiencePlant,
  avoid_scams: avoidScams,
  hourglass_time: financeDesk16x9,
  young_man_notes: youngMan16x9,
  mentor_smile: mentorSmile16x9,
  family_bookshelf: familyBookshelf,
  multiple_income: multipleIncome,
};

// Backward-compatible default export
export const SHOT_IMAGES = SHOT_IMAGES_9_16;

export type CameraShotType = StoryboardImageKey;

export interface DialogueLine {
  id: string;
  start: number; // seconds
  end: number;   // seconds
  text: string;
  shot: StoryboardImageKey;
  cameraMotion: 'static';
  emotion: 'grave_mentor' | 'direct_warning' | 'introspective' | 'warm_grandfather' | 'measured_conviction';
  topicTag: string;
}

export const TOTAL_DURATION = 210; // 3 minutes 30 seconds
export const SHORT_DURATION = 40;  // 40 seconds YouTube Short

// The full 46-section storyboard (3m 30s)
export const DIALOGUE_TIMELINE: DialogueLine[] = [
  {
    id: 'shot_1',
    start: 0.0,
    end: 2.0,
    text: 'Listen to me young man.',
    shot: 'mentor_closeup',
    cameraMotion: 'static',
    emotion: 'grave_mentor',
    topicTag: 'Opening Words',
  },
  {
    id: 'shot_2',
    start: 2.0,
    end: 4.5,
    text: 'If you remember only one thing I tell you today,',
    shot: 'over_shoulder',
    cameraMotion: 'static',
    emotion: 'grave_mentor',
    topicTag: 'The Core Rule',
  },
  {
    id: 'shot_3',
    start: 4.5,
    end: 7.5,
    text: 'let it be this: Getting rich is not about how much money you make.',
    shot: 'mentor_closeup',
    cameraMotion: 'static',
    emotion: 'direct_warning',
    topicTag: 'Wealth Definition',
  },
  {
    id: 'shot_4',
    start: 7.5,
    end: 11.5,
    text: "It's about what you do with the money that comes into your hands.",
    shot: 'mentor_hands',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Wealth Definition',
  },
  {
    id: 'shot_5',
    start: 11.5,
    end: 16.5,
    text: 'When I was your age, I thought success meant having a big salary, an expensive car, and a house people would admire.',
    shot: 'two_shot',
    cameraMotion: 'static',
    emotion: 'introspective',
    topicTag: 'Youth Illusion',
  },
  {
    id: 'shot_6',
    start: 16.5,
    end: 19.0,
    text: 'I was wrong.',
    shot: 'mentor_closeup',
    cameraMotion: 'static',
    emotion: 'grave_mentor',
    topicTag: 'The Hard Truth',
  },
  {
    id: 'shot_7',
    start: 19.0,
    end: 23.0,
    text: 'I eventually learned that money has only three jobs. You either spend it, save it, or make it work for you.',
    shot: 'coins_savings',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: '3 Jobs of Money',
  },
  {
    id: 'shot_8',
    start: 23.0,
    end: 27.0,
    text: 'And the people who become financially successful, learn to control all three.',
    shot: 'young_man_notes',
    cameraMotion: 'static',
    emotion: 'introspective',
    topicTag: 'Mastering Control',
  },
  {
    id: 'shot_9',
    start: 27.0,
    end: 32.0,
    text: "Don't spend your money just to look successful. A new phone can impress people for a week,",
    shot: 'mentor_closeup',
    cameraMotion: 'static',
    emotion: 'direct_warning',
    topicTag: 'False Status',
  },
  {
    id: 'shot_10',
    start: 32.0,
    end: 37.0,
    text: 'a nice car can impress them for a month, but having money invested and growing quietly, that can change your entire life.',
    shot: 'patience_plant',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Quiet Growth',
  },
  {
    id: 'shot_11',
    start: 37.0,
    end: 42.0,
    text: "Here's another secret I wish someone had told me when I was young. Don't wait until you have a lot of money before you start investing.",
    shot: 'two_shot',
    cameraMotion: 'static',
    emotion: 'warm_grandfather',
    topicTag: 'Start Early',
  },
  {
    id: 'shot_12',
    start: 42.0,
    end: 46.5,
    text: 'Start learning while the amount is still small. If you cannot manage 1,000 shillings wisely,',
    shot: 'young_man_reaction',
    cameraMotion: 'static',
    emotion: 'introspective',
    topicTag: 'Small Amounts',
  },
  {
    id: 'shot_13',
    start: 46.5,
    end: 51.0,
    text: "having 100,000 won't magically make you disciplined.",
    shot: 'coins_savings',
    cameraMotion: 'static',
    emotion: 'direct_warning',
    topicTag: 'Discipline',
  },
  {
    id: 'shot_14',
    start: 51.0,
    end: 53.5,
    text: 'Learn to save.',
    shot: 'coins_savings',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Saving Habit',
  },
  {
    id: 'shot_15',
    start: 53.5,
    end: 55.5,
    text: 'Learn to invest.',
    shot: 'stocks_chart',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Investing',
  },
  {
    id: 'shot_16',
    start: 55.5,
    end: 57.5,
    text: 'Learn how businesses make money.',
    shot: 'business_plans',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Business Logic',
  },
  {
    id: 'shot_17',
    start: 57.5,
    end: 60.0,
    text: 'Learn how stocks work.',
    shot: 'stocks_chart',
    cameraMotion: 'static',
    emotion: 'grave_mentor',
    topicTag: 'Stocks Understanding',
  },
  {
    id: 'shot_18',
    start: 60.0,
    end: 63.0,
    text: 'Learn how to increase your income. And most importantly, learn to delay pleasure.',
    shot: 'multiple_income',
    cameraMotion: 'static',
    emotion: 'grave_mentor',
    topicTag: 'Delay Pleasure',
  },
  {
    id: 'shot_19',
    start: 63.0,
    end: 66.5,
    text: "You don't need to buy everything you can afford.",
    shot: 'young_man_notes',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Affordability vs Discipline',
  },
  {
    id: 'shot_20',
    start: 66.5,
    end: 69.0,
    text: "Sometimes the smartest financial decision is saying, 'not yet'.",
    shot: 'mentor_hands',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Not Yet',
  },
  {
    id: 'shot_21',
    start: 69.0,
    end: 75.0,
    text: 'Because every shilling you spend today, is a shilling that cannot work for your future.',
    shot: 'coins_savings',
    cameraMotion: 'static',
    emotion: 'direct_warning',
    topicTag: 'Compounding Shilling',
  },
  {
    id: 'shot_22',
    start: 75.0,
    end: 80.0,
    text: "But remember this too. Don't become obsessed with saving so much, that you forget to live.",
    shot: 'mentor_smile',
    cameraMotion: 'static',
    emotion: 'warm_grandfather',
    topicTag: 'Life Balance',
  },
  {
    id: 'shot_23',
    start: 80.0,
    end: 85.0,
    text: 'Money is a tool, not the purpose of your life. Take care of yourself.',
    shot: 'two_shot',
    cameraMotion: 'static',
    emotion: 'warm_grandfather',
    topicTag: 'Money As A Tool',
  },
  {
    id: 'shot_24',
    start: 85.0,
    end: 89.0,
    text: 'Help your family when you can. Enjoy the things that genuinely matter.',
    shot: 'family_bookshelf',
    cameraMotion: 'static',
    emotion: 'warm_grandfather',
    topicTag: 'Family & Living',
  },
  {
    id: 'shot_25',
    start: 89.0,
    end: 93.0,
    text: "Just don't sacrifice your future to impress people who won't be there when the money is gone.",
    shot: 'young_man_reaction',
    cameraMotion: 'static',
    emotion: 'introspective',
    topicTag: 'True Priorities',
  },
  {
    id: 'shot_26',
    start: 93.0,
    end: 100.0,
    text: 'And young man, never depend on only one source of income, if you can build another.',
    shot: 'mentor_closeup',
    cameraMotion: 'static',
    emotion: 'direct_warning',
    topicTag: 'Multiple Incomes Rule',
  },
  {
    id: 'shot_27',
    start: 100.0,
    end: 104.0,
    text: 'Your job can pay your bills.',
    shot: 'over_shoulder',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Job Income',
  },
  {
    id: 'shot_28',
    start: 104.0,
    end: 109.0,
    text: 'A business can increase your income. Investments can build your wealth.',
    shot: 'business_plans',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Business & Investments',
  },
  {
    id: 'shot_29',
    start: 109.0,
    end: 116.0,
    text: 'Skills can give you opportunities nobody can take away.',
    shot: 'young_man_notes',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Skills Capital',
  },
  {
    id: 'shot_30',
    start: 116.0,
    end: 124.0,
    text: 'And please, stay away from shortcuts that promise easy money.',
    shot: 'mentor_closeup',
    cameraMotion: 'static',
    emotion: 'direct_warning',
    topicTag: 'Avoid Easy Money',
  },
  {
    id: 'shot_31',
    start: 124.0,
    end: 131.0,
    text: 'If someone promises you huge returns with zero risk, stop and ask questions.',
    shot: 'avoid_scams',
    cameraMotion: 'static',
    emotion: 'direct_warning',
    topicTag: 'Scam Scrutiny',
  },
  {
    id: 'shot_32',
    start: 131.0,
    end: 135.0,
    text: 'Real wealth is usually boring.',
    shot: 'mentor_hands',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Boring Wealth',
  },
  {
    id: 'shot_33',
    start: 135.0,
    end: 138.0,
    text: 'It grows through patience, discipline, knowledge, consistency, and time.',
    shot: 'patience_plant',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Patience & Compounding',
  },
  {
    id: 'shot_34',
    start: 138.0,
    end: 145.0,
    text: "You don't need to become rich overnight. You need to become better with money every single year.",
    shot: 'mentor_smile',
    cameraMotion: 'static',
    emotion: 'warm_grandfather',
    topicTag: 'Yearly Improvement',
  },
  {
    id: 'shot_35',
    start: 145.0,
    end: 150.0,
    text: 'So start where you are. With the money you have. With the knowledge you have.',
    shot: 'coins_savings',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Start With What You Have',
  },
  {
    id: 'shot_36',
    start: 150.0,
    end: 154.0,
    text: 'And with whatever opportunities are available to you.',
    shot: 'multiple_income',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Action In The Present',
  },
  {
    id: 'shot_37',
    start: 154.0,
    end: 161.0,
    text: "Because the greatest financial advantage you can have when you're young, isn't a huge bank account.",
    shot: 'two_shot',
    cameraMotion: 'static',
    emotion: 'grave_mentor',
    topicTag: 'The Youth Advantage',
  },
  {
    id: 'shot_38',
    start: 161.0,
    end: 166.0,
    text: 'It is time.',
    shot: 'hourglass_time',
    cameraMotion: 'static',
    emotion: 'introspective',
    topicTag: 'Time Is Wealth',
  },
  {
    id: 'shot_39',
    start: 166.0,
    end: 171.0,
    text: 'You have time to learn. Time to make mistakes.',
    shot: 'young_man_reaction',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Time To Learn',
  },
  {
    id: 'shot_40',
    start: 171.0,
    end: 175.0,
    text: 'Time to recover. Time to invest.',
    shot: 'stocks_chart',
    cameraMotion: 'static',
    emotion: 'measured_conviction',
    topicTag: 'Time To Recover',
  },
  {
    id: 'shot_41',
    start: 175.0,
    end: 182.0,
    text: 'And time to let small decisions become big results.',
    shot: 'patience_plant',
    cameraMotion: 'static',
    emotion: 'warm_grandfather',
    topicTag: 'Big Results',
  },
  {
    id: 'shot_42',
    start: 182.0,
    end: 190.0,
    text: "So don't waste your youth trying to look rich. Use your youth to become financially strong.",
    shot: 'mentor_closeup',
    cameraMotion: 'static',
    emotion: 'direct_warning',
    topicTag: 'Financial Strength',
  },
  {
    id: 'shot_43',
    start: 190.0,
    end: 196.0,
    text: "One day, you'll look back and realize the money wasn't built in one day,",
    shot: 'young_man_notes',
    cameraMotion: 'static',
    emotion: 'introspective',
    topicTag: 'The Realisation',
  },
  {
    id: 'shot_44',
    start: 196.0,
    end: 203.0,
    text: 'the person who knew how to build it was.',
    shot: 'mentor_smile',
    cameraMotion: 'static',
    emotion: 'warm_grandfather',
    topicTag: 'Final Life Wisdom',
  },
  {
    id: 'shot_45',
    start: 203.0,
    end: 207.0,
    text: '',
    shot: 'two_shot',
    cameraMotion: 'static',
    emotion: 'introspective',
    topicTag: 'Silent Contemplation',
  },
  {
    id: 'shot_46',
    start: 207.0,
    end: 210.0,
    text: '',
    shot: 'mentor_closeup',
    cameraMotion: 'static',
    emotion: 'grave_mentor',
    topicTag: 'Cinematic Fade Out',
  }
];

// YouTube Short Storyboard (40 seconds condensed attention-grabbing cut)
// Contains 11 fast-paced visual changes across the opening 40 seconds
export const SHORT_TIMELINE: DialogueLine[] = DIALOGUE_TIMELINE
  .filter(item => item.start < SHORT_DURATION)
  .map(item => ({
    ...item,
    end: Math.min(item.end, SHORT_DURATION),
  }));
