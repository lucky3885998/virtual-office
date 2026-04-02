/**
 * OpenClaw Sessions Bridge - HTTP API Server
 * 
 * 读取 OpenClaw sessions.json，提供 REST API 给虚拟办公室
 * 支持本地 (localhost) 和网络访问
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ============ 配置 ============

const PORT = parseInt(process.env.PORT || '18792', 10);
const SESSIONS_PATH = process.env.SESSIONS_PATH || 
  path.join(process.env.USERPROFILE || process.env.HOME || '', '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');

// ============ 状态 ============

let sessionsData = null;

console.log(`[Bridge] Sessions path: ${SESSIONS_PATH}`);
console.log(`[Bridge] File exists: ${fs.existsSync(SESSIONS_PATH)}`);

// ============ 读取 sessions.json ============

function loadSessions() {
  try {
    const raw = fs.readFileSync(SESSIONS_PATH, 'utf8');
    const data = JSON.parse(raw);
    
    // sessions.json 格式是扁平对象: { "key1": {...}, "key2": {...}, ... }
    // 转换为数组
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // 检查是否已经是扁平结构 (无 count/sessions 外层)
      const keys = Object.keys(data);
      const isFlat = keys.length > 0 && typeof data[keys[0]] === 'object';
      
      if (isFlat && !data.sessionsArray) {
        // 扁平结构，直接转换
        data.sessionsArray = Object.entries(data).map(([key, val]) => ({ key, ...val }));
      } else if (data.sessions && typeof data.sessions === 'object') {
        // 有 sessions 外层
        data.sessionsArray = Object.entries(data.sessions).map(([key, val]) => ({ key, ...val }));
      }
    } else {
      data = { sessionsArray: [] };
    }
    
    console.log(`[Bridge] sessionsArray length: ${data.sessionsArray?.length || 0}`);
    return data;
  } catch (error) {
    console.error('[Bridge] Load error:', error.message);
    return { sessionsArray: [] };
  }
}

// ============ 数据转换 ============

function toAgents(data) {
  if (!data?.sessionsArray?.length) return [];
  
  const now = Date.now();
  const active = 30 * 60 * 1000;  // 30 min
  const recent = 2 * 60 * 60 * 1000; // 2 hours
  
  const agents = [];
  
  // 主会话 - OpenClaw 核心成员
  const main = data.sessionsArray.find(s => s.key === 'agent:main:main');
  if (main) {
    const isActive = (now - main.updatedAt) < active;
    // 从 skillsSnapshot 提取已启用的技能
    const enabledSkills = main.skillsSnapshot?.skills?.map(s => s.name) || [];
    
    agents.push({
      id: 'openclaw-main',
      name: 'Lucky-COO',
      title: 'AI 首席运营官',
      subtitle: main.model || 'MiniMax-M2.7',
      status: isActive ? 'working' : 'idle',
      department: 'COO',
      color: isActive ? '#22c55e' : '#eab308',
      // 详细信息
      model: main.model,
      totalTokens: main.totalTokens || 0,
      inputTokens: main.inputTokens || 0,
      outputTokens: main.outputTokens || 0,
      lastChannel: main.lastChannel || 'webchat',
      updatedAt: main.updatedAt,
      startedAt: main.startedAt,
      skills: enabledSkills,
      skillsCount: enabledSkills.length,
      contextTokens: main.contextTokens || 0,
      cacheRead: main.cacheRead || 0,
      costUsd: main.estimatedCostUsd || 0,
      isMain: true,
      statusText: main.status || 'running'
    });
  }
  
  // 子 Agent 会话 - 任务执行记录 (OpenAI Codex 等)
  const subAgents = data.sessionsArray.filter(s => s.key.startsWith('agent:main:openai:'));
  
  // 按状态分组统计
  const doneCount = subAgents.filter(s => s.status === 'done').length;
  const failedCount = subAgents.filter(s => s.status === 'failed').length;
  const recentSubs = subAgents
    .filter(s => (now - s.updatedAt) < recent)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5); // 最近 5 个任务
  
  // OpenAI 子任务汇总
  if (subAgents.length > 0) {
    agents.push({
      id: 'subagents-openai',
      name: 'AI 任务助手',
      title: `OpenAI Codex 任务`,
      subtitle: `${subAgents.length} 个任务 · ${doneCount} 成功 · ${failedCount} 失败`,
      status: subAgents.some(s => s.status === 'done' && (now - s.updatedAt) < active) ? 'working' : 
             recentSubs.length > 0 ? 'idle' : 'offline',
      department: 'IT',
      color: '#10b981',
      // 汇总数据
      totalTasks: subAgents.length,
      doneTasks: doneCount,
      failedTasks: failedCount,
      totalRuntimeMs: subAgents.reduce((sum, s) => sum + (s.runtimeMs || 0), 0),
      latestTasks: recentSubs.map(s => ({
        id: s.sessionId,
        status: s.status,
        runtimeMs: s.runtimeMs,
        updatedAt: s.updatedAt,
        endedAt: s.endedAt,
        startedAt: s.startedAt,
        skills: s.skillsSnapshot?.skills?.map(sk => sk.name) || []
      })),
      updatedAt: subAgents[0]?.updatedAt || 0,
      isSubAgent: true
    });
  }
  
  // 按渠道分组 (其他渠道)
  const channels = {};
  data.sessionsArray.forEach(s => {
    if (s.key === 'agent:main:main') return;
    if (s.key.startsWith('agent:main:openai:')) return; // 已处理
    const parts = s.key.split(':');
    const ch = parts[2] || 'other';
    if (!channels[ch]) channels[ch] = { sessions: [], latest: 0 };
    channels[ch].sessions.push(s);
    channels[ch].latest = Math.max(channels[ch].latest, s.updatedAt);
  });
  
  const chNames = { telegram: 'Telegram', discord: 'Discord', 
                    whatsapp: 'WhatsApp', signal: 'Signal', webchat: 'Web 聊天' };
  const chColors = { telegram: '#0088cc', discord: '#5865f2',
                      whatsapp: '#25d366', signal: '#3ecf8e', webchat: '#8b5cf6' };
  
  Object.entries(channels).forEach(([ch, grp]) => {
    const isActive = grp.sessions.some(s => (now - s.updatedAt) < active);
    const isRecent = (now - grp.latest) < recent;
    agents.push({
      id: `channel-${ch}`,
      name: `${chNames[ch] || ch} 渠道`,
      title: `${chNames[ch] || ch}`,
      subtitle: `${grp.sessions.length} 个会话`,
      status: isActive ? 'working' : isRecent ? 'idle' : 'offline',
      department: 'COO',
      color: chColors[ch] || '#71717a',
      channel: ch,
      sessionCount: grp.sessions.length,
      updatedAt: grp.latest
    });
  });
  
  return agents;
}

function toStats(data) {
  if (!data?.sessionsArray) return { totalSessions: 0, activeSessions: 0, totalTokens: 0, channels: [] };
  const now = Date.now();
  const active = 30 * 60 * 1000;
  const main = data.sessionsArray.find(s => s.key === 'agent:main:main');
  const activeSessions = data.sessionsArray.filter(s => (now - s.updatedAt) < active);
  const totalTokens = data.sessionsArray.reduce((sum, s) => sum + (s.totalTokens || 0), 0);
  const channelSet = new Set(data.sessionsArray.map(s => s.key.split(':')[2]).filter(Boolean));
  const subAgents = data.sessionsArray.filter(s => s.key.startsWith('agent:main:openai:'));
  
  return {
    totalSessions: data.sessionsArray.length,
    activeSessions: activeSessions.length,
    mainSessionActive: main ? (now - main.updatedAt) < active : false,
    totalTokens,
    totalCostUsd: data.sessionsArray.reduce((sum, s) => sum + (s.estimatedCostUsd || 0), 0),
    channels: Array.from(channelSet),
    subAgentTasks: {
      total: subAgents.length,
      done: subAgents.filter(s => s.status === 'done').length,
      failed: subAgents.filter(s => s.status === 'failed').length
    }
  };
}

// 初始加载
sessionsData = loadSessions();

// ============ HTTP Server ============

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  const send = (code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json', ...cors, 'X-Powered-By': 'OpenClaw-Bridge/1.0' });
    res.end(JSON.stringify(obj, null, 2));
  };

  // 健康检查
  if (pathname === '/health' || pathname === '/') {
    const main = sessionsData?.sessionsArray?.find(s => s.key === 'agent:main:main');
    return send(200, {
      status: 'ok',
      version: '1.0.0',
      sessionsPath: SESSIONS_PATH,
      sessionsCount: sessionsData?.sessionsArray?.length || 0,
      mainSession: main ? { status: main.status, updatedAt: main.updatedAt } : null,
      uptime: Math.floor(process.uptime())
    });
  }

  // 刷新数据
  if (pathname === '/api/refresh') {
    sessionsData = loadSessions();
    const stats = toStats(sessionsData);
    return send(200, { success: true, stats });
  }

  // 成员列表
  if (pathname === '/api/agents') {
    const agents = toAgents(sessionsData);
    return send(200, { success: true, count: agents.length, agents });
  }

  // 统计
  if (pathname === '/api/stats') {
    return send(200, { success: true, stats: toStats(sessionsData) });
  }

  // 原始 sessions
  if (pathname === '/api/sessions') {
    return send(200, { success: true, ...sessionsData });
  }

  // 404
  send(404, { error: true, message: `Not found: ${pathname}` });
});

server.listen(PORT, () => {
  console.log(`
🦞 OpenClaw Sessions Bridge 已启动

📡 HTTP API:    http://localhost:${PORT}
📁 Sessions:   ${SESSIONS_PATH}
👥 Sessions:   ${sessionsData?.sessionsArray?.length || 0} 个

📌 Endpoints:
   GET /              健康检查
   GET /api/agents    成员列表 (虚拟办公室用)
   GET /api/sessions  原始 sessions
   GET /api/stats     统计
   GET /api/refresh   强制刷新

🌐 网络访问:
   http://${getLocalIP()}:${PORT}/api/agents
`);

  // 定时刷新 (每 10 秒)
  setInterval(() => {
    const prev = sessionsData?.sessionsArray?.length || 0;
    sessionsData = loadSessions();
    const curr = sessionsData?.sessionsArray?.length || 0;
    if (curr !== prev) {
      console.log(`[Bridge] Sessions updated: ${prev} → ${curr}`);
    }
  }, 10000);
});

function getLocalIP() {
  const nets = require('os').networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

process.on('SIGINT', () => {
  console.log('\n[Bridge] Shutting down...');
  server.close(() => process.exit(0));
});
