import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('.env') });

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_bytes_long';

function decrypt(text) {
  if (!text) return null;
  const [ivHex, encryptedHex] = text.split(':');
  if (!ivHex || !encryptedHex) throw new Error('Invalid encryption format');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function debug() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found.");
    return;
  }
  const userId = users[0].id;
  console.log(`User ID: ${userId}`);

  const connection = await prisma.githubConnection.findUnique({ where: { userId } });
  if (!connection) {
    console.log("No GitHub connection found.");
    return;
  }
  console.log(`GitHub Connection: ${connection.username} (ID: ${connection.githubId})`);

  const token = decrypt(connection.accessToken);
  
  const projects = await prisma.project.findMany({ where: { userId } });
  const linked = projects.filter(p => p.repoUrl);
  console.log(`Linked Projects: ${linked.length}`);

  for (const project of linked) {
    console.log(`\nProject: ${project.title}`);
    console.log(`Repo URL: ${project.repoUrl}`);
    
    const urlMatch = project.repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) {
      console.log("Invalid Repo URL format.");
      continue;
    }
    let [, owner, repo] = urlMatch;
    repo = repo.replace(/\.git$/, '');
    
    console.log(`Owner: ${owner}, Repo: ${repo}`);

    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'LevelUP-App' }
    });
    
    console.log(`Commits Status: ${commitsRes.status}`);
    if (commitsRes.ok) {
      const data = await commitsRes.json();
      console.log(`Fetched ${data.length} commits. Latest commit author:`, data[0]?.author?.id, data[0]?.author?.login);
      console.log(`Does it match connection.githubId (${connection.githubId})? ${String(data[0]?.author?.id) === connection.githubId}`);
    } else {
      console.log(await commitsRes.text());
    }
  }
}

debug().catch(console.error).finally(() => prisma.$disconnect());
