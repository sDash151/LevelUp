import fs from 'fs';
import path from 'path';

const url = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const dest = path.join(process.cwd(), 'exercises_preview.json');

async function download() {
  try {
    const res = await fetch(url);
    const data = await res.text();
    fs.writeFileSync(dest, data);
    console.log('Successfully downloaded to ' + dest);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

download();
