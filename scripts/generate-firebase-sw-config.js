import dotenv from 'dotenv';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

(async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }

    const templatePath = path.resolve(__dirname, 'firebase-messaging-sw-template.js');
    if (!fs.existsSync(templatePath)) {
      console.error(`Template not found: ${templatePath}`);
      process.exitCode = 2;
      return;
    }

    const template = fs.readFileSync(templatePath, 'utf8');

    const firebaseConfigObject = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    // Warn about missing vars
    const missing = Object.entries(firebaseConfigObject)
      .filter(([_, v]) => !v)
      .map(([k]) => k);
    if (missing.length > 0) {
      console.warn('Warning: missing firebase env vars:', missing.join(', '));
    }

    const configContent = template.replace(
      /{{FIREBASE_CONFIG}}/g,
      JSON.stringify(firebaseConfigObject, null, 2),
    );

    const outputPath = path.resolve(__dirname, '../public/firebase-messaging-sw.js');
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, configContent, 'utf8');

    console.log('');
    console.log('Firebase Service Worker config generated:');
    console.log(`  -> ${outputPath}`);
    console.log('Ensure public/firebase-messaging-sw.js is gitignored and CI injects env vars.');
    console.log('');
  } catch (err) {
    console.error('Failed to generate firebase-messaging-sw.js');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
