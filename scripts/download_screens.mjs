import fs from 'fs';
import path from 'path';

const screensData = JSON.parse(fs.readFileSync('C:/Users/sourish joshy/.gemini/antigravity-ide/brain/ac6a8b77-597c-4352-a02a-82b27b2c09fd/.system_generated/steps/18/output.txt', 'utf8'));

fs.mkdirSync('stitch_screens', { recursive: true });

async function downloadAll() {
  for (const screen of screensData.screens) {
    const screenId = screen.name.split('/').pop();
    const cleanTitle = screen.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const outPath = path.join('stitch_screens', `${cleanTitle}.html`);
    console.log(`Downloading ${screen.title} -> ${outPath}`);
    if (screen.htmlCode && screen.htmlCode.downloadUrl) {
      try {
        const res = await fetch(screen.htmlCode.downloadUrl);
        const text = await res.text();
        fs.writeFileSync(outPath, text, 'utf8');
        console.log(`Saved ${text.length} bytes`);
      } catch (err) {
        console.error(`Error downloading ${screen.title}:`, err);
      }
    }
  }
}

downloadAll();
