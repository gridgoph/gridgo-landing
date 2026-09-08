import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const videosPath = resolve(scriptDir, '../src/components/HowItWorksVideos.tsx');
assert(
  existsSync(videosPath),
  'HowItWorksVideos component should exist.',
);
const app = readFileSync(resolve(scriptDir, '../src/App.tsx'), 'utf8');
const videos = readFileSync(videosPath, 'utf8');
const ecosystem = readFileSync(
  resolve(scriptDir, '../src/components/EcosystemSection.tsx'),
  'utf8',
);
const source = `${app}\n${videos}\n${ecosystem}`;

assert(
  app.includes('<HowItWorksVideos'),
  'How it Works section should render the walkthrough carousel.',
);
assert(
  videos.includes('youtube.com/embed/nFvyJB_Xiw4'),
  'Landing page should embed the GRIDGO Organizations walkthrough.',
);
assert(
  videos.includes('playlist=nFvyJB_Xiw4'),
  'GRIDGO Organizations video should include the playlist parameter for looping.',
);
assert(
  videos.includes('youtube.com/embed/Oqo_ZUgPStk'),
  'Landing page should embed the GRIDGO Supplier walkthrough.',
);
assert(
  videos.includes('playlist=Oqo_ZUgPStk'),
  'GRIDGO Supplier video should include the playlist parameter for looping.',
);
assert(
  videos.includes("iframeTitle: 'GRIDGO Organizations'"),
  'Organizations iframe should have an accessible title.',
);
assert(
  videos.includes("iframeTitle: 'GRIDGO Supplier'"),
  'Supplier iframe should have an accessible title.',
);
assert(
  videos.includes("label: 'GRIDGO Organizations'"),
  'Carousel should label the first video GRIDGO Organizations.',
);
assert(
  videos.includes("label: 'GRIDGO Supplier'"),
  'Carousel should label the second video GRIDGO Supplier.',
);
assert(videos.includes('allowFullScreen'), 'Video iframes should allow full-screen playback.');
assert(
  videos.includes('useReducedMotion'),
  'Walkthrough carousel should honour prefers-reduced-motion.',
);
assert(
  videos.includes('if (playing || reduceMotion) return'),
  'Carousel auto-advance should pause while a video is playing or reduced motion is requested.',
);
assert(
  videos.includes('aria-roledescription="carousel"'),
  'Walkthrough videos should be presented as a carousel.',
);
assert(
  !source.includes('youtube.com/embed/XumhDPA8rB4'),
  'The previous single demo walkthrough embed should be replaced.',
);
assert(
  !source.includes('youtube.com/embed/67Jrr34StKg'),
  'The previous single demo walkthrough embed should be replaced.',
);
assert(
  app.includes('>Deliver</h3>'),
  'How it Works step 03 should be labelled Deliver.',
);
assert(
  !app.includes('>Receive</h3>'),
  'How it Works step 03 should not use the old Receive label.',
);
assert(
  ecosystem.includes('GRIDGO Organizations'),
  'Ecosystem B2B card should be labelled GRIDGO Organizations.',
);
assert(
  !ecosystem.includes('GRIDGO Businesses'),
  'Ecosystem B2B card should not use the old GRIDGO Businesses label.',
);
