// Keeps the shared head, header and footer identical across every static page.
// Run `npm run shell` after changing navigation or branding; pages stay plain HTML
// (readable without JavaScript) and the check in tests/site.test.js guards drift.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { labs } from '../js/catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const nav = [
  ['story', 'index.html', 'Αφήγηση'],
  ['reading', 'reading.html', 'Κεφάλαια'],
  ['lab', 'lab.html', 'Εργαστήριο'],
  ['quiz', 'knowledge_quiz.html', 'Quiz'],
];

const lab = ['Εργαστήριο', 'lab.html'];
const vision = ['Υπολογιστική όραση', 'lab.html#vision'];
export const pages = {
  'index.html': { nav: 'story', crumbs: [] },
  'guide.html': { nav: null, crumbs: [['Οδηγός επίσκεψης']] },
  'reading.html': { nav: 'reading', crumbs: [['Κεφάλαια']] },
  'lab.html': { nav: 'lab', crumbs: [['Εργαστήριο']] },
  'journey.html': { nav: 'journey', crumbs: [['Η διαδρομή μου']] },
  'intro_quiz.html': {
    nav: null,
    crumbs: [['Η διαδρομή μου', 'journey.html'], ['Quiz αφετηρίας']],
  },
  'knowledge_quiz.html': { nav: 'quiz', crumbs: [['Τελικό quiz']] },
  'face_recognition.html': { nav: 'lab', crumbs: [lab, vision, ['Πρόσωπο']] },
  'hand_gestures.html': { nav: 'lab', crumbs: [lab, vision, ['Χέρια']] },
  'pose_detection.html': { nav: 'lab', crumbs: [lab, vision, ['Στάση σώματος']] },
};
for (const labInfo of Object.values(labs))
  if (labInfo.page.startsWith('lab-'))
    pages[labInfo.page] = { nav: 'lab', crumbs: [lab, [labInfo.title]] };

const escape = (text) =>
  String(text).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

export function head(page) {
  const story = page === 'index.html';
  return [
    '<link href="favicon/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />',
    '<link href="favicon/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />',
    '<link href="favicon/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />',
    '<link href="favicon/favicon.ico" rel="icon" sizes="any" />',
    '<link href="favicon/site.webmanifest" rel="manifest" />',
    '<link color="#4150f0" href="favicon/safari-pinned-tab.svg" rel="mask-icon" />',
    '<meta content="#4150f0" name="msapplication-TileColor" />',
    '<meta content="favicon/browserconfig.xml" name="msapplication-config" />',
    '<meta content="#080a1f" name="theme-color" />',
    '<link href="css/brand.css" rel="stylesheet" />',
    // Without JavaScript the collapsible menu cannot open, so the links stay in view.
    '<noscript><style>.uc-menu{display:none!important;}.uc-nav{position:static!important;visibility:visible!important;opacity:1!important;transform:none!important;flex-direction:row!important;overflow-x:auto;max-height:none!important;padding:0!important;background:none!important;border:0!important;font-size:12px!important;}.uc-nav a{min-height:40px!important;padding:0 10px!important;white-space:nowrap;}</style></noscript>',
    ...(story ? [] : ['<link href="css/site.css" rel="stylesheet" />']),
  ].join('\n    ');
}

export function header(page) {
  const config = pages[page];
  const links = nav
    .map(
      ([key, href, label]) =>
        `<a href="${href}"${config.nav === key ? ' aria-current="page"' : ''}>${label}</a>`,
    )
    .join('');
  const crumbs = config.crumbs
    .map(([label, href], index) =>
      href
        ? `<li><a href="${href}">${escape(label)}</a></li>`
        : `<li><span${index === config.crumbs.length - 1 ? ' aria-current="page"' : ''}>${escape(label)}</span></li>`,
    )
    .join('');
  return `<a class="uc-skip" href="#main">Μετάβαση στο περιεχόμενο</a>
    <header class="uc-bar${config.crumbs.length || page === 'index.html' ? ' has-crumbs' : ''}" data-uc-bar>
      <div class="uc-bar__inner">
        <a class="uc-brand" href="index.html" aria-label="Διάχυτη Υπολογιστική, αρχή της αφήγησης"
          ><img alt="" height="34" src="favicon/android-chrome-192x192.png" width="34" /><span
            class="uc-brand__word"
            aria-hidden="true"
            ><span>Διάχυτη</span><span>Υπολογιστική</span></span
          ></a
        >
        <nav aria-label="Βρίσκεσαι εδώ" class="uc-crumbs">
          <ol data-uc-crumbs>${crumbs}</ol>
        </nav>
        <button aria-controls="uc-nav" aria-expanded="false" class="uc-menu" type="button">
          <span class="uc-menu__icon" aria-hidden="true"></span><span class="uc-menu__label">Μενού</span>
        </button>
        <nav aria-label="Κύρια πλοήγηση" class="uc-nav" id="uc-nav">
          ${links}<a class="uc-journey" href="journey.html"${config.nav === 'journey' ? ' aria-current="page"' : ''}
            >Η διαδρομή μου <span class="uc-xp" data-uc-xp hidden></span
          ></a>
        </nav>
      </div>
      <div aria-hidden="true" class="uc-progress"><span></span></div>
    </header>`;
}

export function footer() {
  return `<footer class="uc-footer">
      <div class="uc-footer__inner">
        <div>
          <a class="uc-brand" href="index.html" aria-label="Διάχυτη Υπολογιστική"
            ><img alt="" height="34" loading="lazy" src="favicon/android-chrome-192x192.png" width="34" /><span
              class="uc-brand__word"
              aria-hidden="true"
              ><span>Διάχυτη</span><span>Υπολογιστική</span></span
            ></a
          >
          <p>
            Ψηφιακό έκθεμα για τη διάχυτη υπολογιστική, σχεδιασμένο ως πρόταση για το υπό ίδρυση
            Μουσείο Πληροφορικής και Τηλεπικοινωνιών του ΕΚΠΑ.
          </p>
          <p>Η πρόοδός σου αποθηκεύεται μόνο σε αυτή τη συσκευή.</p>
        </div>
        <div>
          <h2>Εξερεύνηση</h2>
          <ul>
            <li><a href="index.html">Αφήγηση</a></li>
            <li><a href="reading.html">Κεφάλαια</a></li>
            <li><a href="lab.html">Εργαστήριο</a></li>
            <li><a href="knowledge_quiz.html">Τελικό quiz</a></li>
            <li><a href="journey.html">Η διαδρομή μου</a></li>
            <li><a href="guide.html">Οδηγός επίσκεψης</a></li>
          </ul>
        </div>
        <div>
          <h2>Η εργασία</h2>
          <ul>
            <li><a href="guide.html#about">Σχετικά με την εργασία</a></li>
            <li><a href="https://pergamos.lib.uoa.gr/uoa/dl/object/3362706/file.pdf">Πλήρες κείμενο (PDF)</a></li>
            <li><a href="https://museum.di.uoa.gr/">Μουσείο Πληροφορικής ΕΚΠΑ</a></li>
            <li><a href="https://github.com/NikosMav/ubiquitous-computing.github.io">Κώδικας στο GitHub</a></li>
          </ul>
        </div>
      </div>
      <p class="uc-footer__base">
        Νικόλαος Μαυραπίδης · Πτυχιακή εργασία, Τμήμα Πληροφορικής και Τηλεπικοινωνιών, ΕΚΠΑ, 2023 ·
        Επιβλέπουσα: Μαρία Ρούσσου · Ολοκληρωμένη έκδοση 2026
      </p>
    </footer>`;
}

const block = (name) => new RegExp(`<!-- uc:${name} -->[\\s\\S]*?<!-- /uc:${name} -->`);
export function apply(page, source) {
  let out = source;
  for (const [name, render] of [
    ['head', head],
    ['header', header],
    ['footer', footer],
  ]) {
    if (!block(name).test(out)) throw new Error(`${page}: missing <!-- uc:${name} --> block`);
    out = out.replace(
      block(name),
      `<!-- uc:${name} -->\n    ${render(page)}\n    <!-- /uc:${name} -->`,
    );
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const page of Object.keys(pages)) {
    const file = path.join(root, page);
    const source = await readFile(file, 'utf8').catch(() => null);
    if (source === null) {
      console.warn('skipped (missing):', page);
      continue;
    }
    const next = apply(page, source);
    if (next !== source) {
      await writeFile(file, next);
      console.log('updated', page);
    }
  }
}
