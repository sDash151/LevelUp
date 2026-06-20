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

  async getGithubAuthUrl(state) {
    const clientId = env.GITHUB_CLIENT_ID;
    const redirectUri = env.GITHUB_CALLBACK_URL;
    const scope = 'repo read:user user:email';
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${encodeURIComponent(state)}`;
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
}

export const projectsService = new ProjectsService();
