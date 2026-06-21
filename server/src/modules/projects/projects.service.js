import crypto from 'crypto';
import { projectsRepository } from './projects.repository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';
import { env } from '../../config/env.js';

// ==================== TOKEN ENCRYPTION ====================

const ALGO = 'aes-256-gcm';

function encrypt(text) {
  const key = crypto.scryptSync(env.JWT_SECRET, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

function decrypt(hash) {
  const key = crypto.scryptSync(env.JWT_SECRET, 'salt', 32);
  const [ivHex, tagHex, encrypted] = hash.split(':');
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ==================== OWNERSHIP HELPER ====================

async function _checkOwnership(userId, projectId) {
  const project = await projectsRepository.findById(projectId);
  if (!project) throw new NotFoundError('Project');
  if (project.userId !== userId) throw new UnauthorizedError('Not your project');
  return project;
}

// ==================== SERVICE ====================

class ProjectsService {
  // ── Projects CRUD ──

  async list(userId, filters, page, limit) {
    return projectsRepository.findAllByUser(userId, filters, page, limit);
  }

  async get(userId, id) {
    return _checkOwnership(userId, id);
  }

  async create(userId, data) {
    const project = await projectsRepository.create(userId, data);

    // Create initial metrics record
    await projectsRepository.upsertMetrics(project.id, {
      commitCount: 0,
      prCount: 0,
      issueCount: 0,
      buildStreak: 0,
      velocityScore: 0,
      qualityScore: 0,
      portfolioScore: 0,
    });

    // Re-fetch with metrics included
    return projectsRepository.findById(project.id);
  }

  async update(userId, id, data) {
    await _checkOwnership(userId, id);
    return projectsRepository.update(id, data);
  }

  async delete(userId, id) {
    await _checkOwnership(userId, id);
    return projectsRepository.delete(id);
  }

  // ── Stats & Pipeline ──

  async stats(userId) {
    return projectsRepository.getStats(userId);
  }

  async pipeline(userId) {
    return projectsRepository.getPipeline(userId);
  }

  async moveProject(userId, projectId, newStatus) {
    await _checkOwnership(userId, projectId);
    return projectsRepository.moveProject(projectId, newStatus);
  }

  // ── Metrics ──

  async getMetrics(userId, projectId) {
    await _checkOwnership(userId, projectId);
    return projectsRepository.getProjectMetrics(projectId);
  }

  // ── Tasks ──

  async createTask(userId, projectId, data) {
    await _checkOwnership(userId, projectId);
    return projectsRepository.createTask(projectId, data);
  }

  async updateTask(userId, taskId, data) {
    const task = await projectsRepository.findTaskById(taskId);
    if (!task) throw new NotFoundError('Task');
    if (task.project.userId !== userId) throw new UnauthorizedError('Not your project');
    return projectsRepository.updateTask(taskId, data);
  }

  // ── Learnings ──

  async getLearnings(userId, projectId, filters) {
    await _checkOwnership(userId, projectId);
    return projectsRepository.findLearnings(projectId, filters);
  }

  async createLearning(userId, projectId, data) {
    await _checkOwnership(userId, projectId);
    return projectsRepository.createLearning(projectId, data);
  }

  // ── Intelligence ──

  async getIntelligence(userId) {
    return projectsRepository.getIntelligence(userId);
  }

  // ── GitHub Integration ──

  async getGithubAuthUrl(frontendState) {
    const clientId = env.GITHUB_CLIENT_ID;
    const redirectUri = env.GITHUB_CALLBACK_URL;
    const scope = 'repo read:user user:email';
    const combinedState = `projects:${frontendState || ''}`;
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${encodeURIComponent(combinedState)}`;
  }

  async connectGithub(userId, code) {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      throw new UnauthorizedError(`GitHub OAuth failed: ${tokenData.error_description || tokenData.error}`);
    }

    // Fetch GitHub user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const ghUser = await userResponse.json();
    if (!ghUser.id) {
      throw new UnauthorizedError('Failed to fetch GitHub user profile');
    }

    // Encrypt the access token before storing
    const encryptedToken = encrypt(tokenData.access_token);

    await projectsRepository.upsertGithubConnection(userId, {
      githubId: String(ghUser.id),
      username: ghUser.login,
      avatar: ghUser.avatar_url || null,
      email: ghUser.email || null,
      accessToken: encryptedToken,
      scope: tokenData.scope || null,
      connectedAt: new Date(),
    });

    return { username: ghUser.login, avatar: ghUser.avatar_url };
  }

  async getGithubRepos(userId) {
    const connection = await projectsRepository.findGithubConnection(userId);
    if (!connection) throw new NotFoundError('GitHub connection');

    let token;
    try {
      token = decrypt(connection.accessToken);
    } catch (err) {
      await projectsRepository.deleteGithubConnection(userId);
      throw new UnauthorizedError('GitHub connection corrupted. Please reconnect.');
    }

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedError('Failed to fetch GitHub repos — token may be expired');
    }

    const repos = await response.json();

    // Update lastSyncedAt
    await projectsRepository.upsertGithubConnection(userId, {
      githubId: connection.githubId,
      username: connection.username,
      accessToken: connection.accessToken,
      lastSyncedAt: new Date(),
    });

    return {
      connection: {
        username: connection.username,
        avatar: connection.avatar,
        connectedAt: connection.connectedAt,
        lastSyncedAt: new Date(),
      },
      repos: repos.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        updatedAt: r.updated_at,
        isPrivate: r.private,
        defaultBranch: r.default_branch,
      })),
    };
  }

  async disconnectGithub(userId) {
    const connection = await projectsRepository.findGithubConnection(userId);
    if (!connection) throw new NotFoundError('GitHub connection');
    return projectsRepository.deleteGithubConnection(userId);
  }

  async syncGithubActivity(userId) {
    const connection = await projectsRepository.findGithubConnection(userId);
    if (!connection) return { status: 'no_connection' };

    let token;
    try {
      token = decrypt(connection.accessToken);
    } catch (err) {
      throw new UnauthorizedError('GitHub connection corrupted');
    }

    const projects = await projectsRepository.findAllByUser(userId, {}, 1, 100);
    const linkedProjects = projects.data.filter(p => p.repoUrl);

    let totalCommits = 0;
    let totalPRs = 0;
    let lastPush = null;

    for (const project of linkedProjects) {
      // Extract owner/repo from URL (e.g., https://github.com/owner/repo)
      const urlMatch = project.repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!urlMatch) continue;
      let [, owner, repo] = urlMatch;
      repo = repo.replace(/\.git$/, '');

      try {
        // Fetch repo details for last push
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
        });
        if (!repoRes.ok) continue;
        const repoData = await repoRes.json();

        // Fetch total commits reliably using /commits endpoint
        const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
        });
        
        let repoCommits = 0;
        if (commitsRes.ok) {
          const link = commitsRes.headers.get('link');
          if (link) {
            const match = link.match(/page=(\d+)>; rel="last"/);
            if (match) repoCommits = parseInt(match[1], 10);
          } else {
            const data = await commitsRes.json();
            repoCommits = data.length;
          }
        }

        // Fetch pulls
        const pullsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
        });
        let repoPRs = 0;
        if (pullsRes.ok) {
          const pullsData = await pullsRes.json();
          repoPRs = pullsData.length || 0;
        }

        // Update Project Metrics
        const pushedDate = new Date(repoData.pushed_at || repoData.updated_at);
        if (!lastPush || pushedDate > lastPush) lastPush = pushedDate;

        totalCommits += repoCommits;
        totalPRs += repoPRs;

        await projectsRepository.upsertMetrics(project.id, {
          commitCount: repoCommits,
          prCount: repoPRs,
          lastCommitAt: pushedDate,
        });

      } catch (err) {
        console.error(`Failed to sync github for ${owner}/${repo}`, err);
      }
    }

    return { totalCommits, totalPRs, lastPush };
  }

  async getGithubLanguages(userId) {
    const connection = await projectsRepository.findGithubConnection(userId);
    if (!connection) return {};

    let token;
    try {
      token = decrypt(connection.accessToken);
    } catch (err) {
      return {};
    }

    const projects = await projectsRepository.findAllByUser(userId, {}, 1, 100);
    const linkedProjects = projects.data.filter(p => p.repoUrl);

    const aggregatedLanguages = {};

    for (const project of linkedProjects) {
      const urlMatch = project.repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!urlMatch) continue;
      let [, owner, repo] = urlMatch;
      repo = repo.replace(/\.git$/, '');

      try {
        const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
        });
        
        if (langRes.ok) {
          const langs = await langRes.json();
          for (const [lang, bytes] of Object.entries(langs)) {
            aggregatedLanguages[lang] = (aggregatedLanguages[lang] || 0) + bytes;
          }
        }
      } catch (err) {
        console.error(`Failed to fetch languages for ${owner}/${repo}`, err);
      }
    }

    return aggregatedLanguages;
  }

  async getGithubActivityGraph(userId) {
    const connection = await projectsRepository.findGithubConnection(userId);
    if (!connection) return [0, 0, 0, 0, 0, 0, 0];

    let token;
    try {
      token = decrypt(connection.accessToken);
    } catch (err) {
      return [0, 0, 0, 0, 0, 0, 0];
    }

    const projects = await projectsRepository.findAllByUser(userId, {}, 1, 100);
    const linkedProjects = projects.data.filter(p => p.repoUrl);

    // Array mapped to [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    const weeklyCommits = [0, 0, 0, 0, 0, 0, 0];
    
    // Calculate 7 days ago
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 7);
    const sinceISO = sinceDate.toISOString();

    for (const project of linkedProjects) {
      const urlMatch = project.repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!urlMatch) continue;
      let [, owner, repo] = urlMatch;
      repo = repo.replace(/\.git$/, '');

      try {
        const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=100`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
        });
        
        if (!commitsRes.ok) continue;
        const commitsData = await commitsRes.json();

        for (const commit of commitsData) {
          // Filter out commits that aren't by the linked user (if author data exists)
          if (commit.author && String(commit.author.id) !== connection.githubId) {
            continue;
          }

          const date = new Date(commit.commit.author.date);
          // getDay() returns 0 (Sun) to 6 (Sat). We want 0 (Mon) to 6 (Sun)
          const dayIndex = (date.getDay() + 6) % 7;
          weeklyCommits[dayIndex]++;
        }
      } catch (err) {
        console.error(`Failed to fetch commits graph for ${owner}/${repo}`, err);
      }
    }

    return weeklyCommits;
  }

  async getGithubContextForAi(userId, repoUrl) {
    if (!repoUrl) return null;
    
    const connection = await projectsRepository.findGithubConnection(userId);
    if (!connection) return null;

    let token;
    try {
      token = decrypt(connection.accessToken);
    } catch (err) {
      return null;
    }

    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) return null;
    let [, owner, repo] = urlMatch;
    repo = repo.replace(/\.git$/, '');

    const context = {};

    try {
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      if (langRes.ok) {
        context.languages = await langRes.json();
      }
    } catch (e) {}

    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content && readmeData.encoding === 'base64') {
          const decoded = Buffer.from(readmeData.content, 'base64').toString('utf8');
          context.readme = decoded.substring(0, 2000); // Limit to 2000 chars
        }
      }
    } catch (e) {}

    return Object.keys(context).length > 0 ? context : null;
  }
}

export const projectsService = new ProjectsService();
