# 纳灵虚拟办公室 - 私有部署指南

**文档版本**: v1.0.0
**更新日期**: 2026-04-02

---

## 目录

1. [快速开始](#1-快速开始)
2. [部署方式](#2-部署方式)
   - [Docker 部署](#21-docker-部署)
   - [Docker Compose 部署](#22-docker-compose-部署)
   - [传统服务器部署](#23-传统服务器部署)
   - [反向代理配置](#24-反向代理配置)
3. [配置参考](#3-配置参考)
4. [域名与 HTTPS](#4-域名与-https)
5. [数据备份](#5-数据备份)
6. [故障排查](#6-故障排查)
7. [更新升级](#7-更新升级)

---

## 1. 快速开始

### 前置要求

| 软件 | 版本 | 说明 |
|------|------|------|
| Docker | 20.10+ | [安装指南](https://docs.docker.com/get-docker/) |
| Docker Compose | 2.0+ | 通常随 Docker Desktop 一起安装 |
| Git | 任意版本 | 用于克隆代码 |

### 一键部署

```bash
# 克隆代码
git clone https://github.com/lucky3885998/virtual-office.git
cd virtual-office

# 启动服务
docker-compose up -d

# 访问
open http://localhost:3000
```

---

## 2. 部署方式

### 2.1 Docker 部署

**步骤 1: 构建镜像**

```bash
docker build -t naling/virtual-office:latest .
```

**步骤 2: 运行容器**

```bash
docker run -d \
  --name naling-virtual-office \
  -p 3000:80 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  naling/virtual-office:latest
```

**参数说明**:

| 参数 | 说明 |
|------|------|
| `--name` | 容器名称 |
| `-p 3000:80` | 映射端口 (主机:容器) |
| `-e NODE_ENV=production` | 设置环境变量 |
| `--restart unless-stopped` | 自动重启 |

### 2.2 Docker Compose 部署

**步骤 1: 复制环境变量配置**

```bash
cp .env.example .env
# 编辑 .env 自定义配置
```

**步骤 2: 启动服务**

```bash
# 前台运行 (查看日志)
docker-compose up

# 后台运行
docker-compose up -d

# 带自定义端口
APP_PORT=8080 docker-compose up -d
```

**步骤 3: 查看状态**

```bash
docker-compose ps
docker-compose logs -f
```

### 2.3 传统服务器部署

适用于没有 Docker 的服务器。

**步骤 1: 安装依赖**

```bash
# Ubuntu / Debian
apt update
apt install -y nginx nodejs npm

# CentOS / Rocky
yum install -y epel-release
yum install -y nginx nodejs npm
```

**步骤 2: 构建应用**

```bash
npm install
npm run build
```

**步骤 3: 配置 Nginx**

```bash
# 复制 nginx 配置
sudo cp deploy/nginx.conf /etc/nginx/sites-available/virtual-office
sudo ln -s /etc/nginx/sites-available/virtual-office /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 nginx
sudo systemctl reload nginx
```

**步骤 4: 使用 systemd 管理**

```bash
# 创建服务文件
sudo nano /etc/systemd/system/virtual-office.service
```

```ini
[Unit]
Description=Naling Virtual Office
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/virtual-office
ExecStart=/usr/bin/npm run dev -- --port 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable virtual-office
sudo systemctl start virtual-office
```

### 2.4 反向代理配置

#### Nginx (主域名)

```nginx
server {
    listen 80;
    server_name office.example.com;

    # 重定向到 HTTPS
    return 301 https://office.example.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name office.example.com;

    ssl_certificate /etc/ssl/certs/office.example.com.pem;
    ssl_certificate_key /etc/ssl/private/office.example.com.key;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Nginx (子路径部署)

```nginx
server {
    listen 80;
    server_name example.com;

    location /office/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Apache

```apache
<VirtualHost *:80>
    ServerName office.example.com
    
    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteRule ^/(.*)$ https://%{SERVER_NAME}/$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName office.example.com
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/office.example.com.pem
    SSLCertificateKeyFile /etc/ssl/private/office.example.com.key

    <Location />
        ProxyPass http://localhost:3000/
        ProxyPassReverse http://localhost:3000/
        RequestHeader set X-Forwarded-Proto https
    </Location>
</VirtualHost>
```

#### Caddy

```caddy
office.example.com {
    reverse_proxy localhost:3000
}
```

---

## 3. 配置参考

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `APP_TITLE` | 纳灵虚拟办公室 | 应用标题 |
| `APP_PORT` | 3000 | 部署端口 |
| `APP_BASE_URL` | / | 基础路径 |
| `DATA_SOURCE` | local | 数据源类型 |
| `ENABLE_STATUS_SIMULATION` | true | 启用状态模拟 |
| `STATUS_UPDATE_INTERVAL` | 30000 | 更新间隔 (ms) |
| `TZ` | Asia/Shanghai | 时区 |

### 自定义配置

创建 `config/custom.js` 挂载到容器:

```javascript
// 自定义配置示例
window.VIRTUAL_OFFICE_CONFIG = {
  title: '纳灵虚拟办公室',
  logo: '/custom-logo.png',
  theme: {
    primaryColor: '#3b82f6',
    backgroundColor: '#09090b'
  },
  features: {
    enableChat: true,
    enableTaskBoard: true,
    enableMeetingRoom: true
  }
}
```

---

## 4. 域名与 HTTPS

### Let's Encrypt 免费证书

```bash
# 安装 certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d office.example.com

# 自动续期 (certbot 自动添加)
```

### 手动配置 SSL

```bash
# 创建 SSL 目录
sudo mkdir -p /etc/nginx/ssl

# 复制证书
sudo cp your-cert.pem /etc/nginx/ssl/cert.pem
sudo cp your-key.pem /etc/nginx/ssl/key.pem

# 设置权限
sudo chmod 600 /etc/nginx/ssl/*.pem
```

---

## 5. 数据备份

### 备份 LocalStorage 数据

应用数据存储在浏览器 LocalStorage 中。生产环境建议:

1. **启用后端存储** - 将数据存储在服务器数据库
2. **定期导出** - 用户端手动导出重要数据
3. **数据同步** - 使用后端 API 同步多端数据

### Docker 卷备份

```bash
# 备份数据卷
docker run --rm \
  -v naling_virtual_office_data:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/office-data-backup.tar.gz /data

# 恢复数据卷
docker run --rm \
  -v naling_virtual_office_data:/data \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/office-data-backup.tar.gz -C /
```

---

## 6. 故障排查

### 常见问题

**Q: 容器启动失败**

```bash
# 查看错误日志
docker-compose logs

# 检查端口占用
netstat -tlnp | grep 3000
# 或
lsof -i :3000
```

**Q: 页面空白**

```bash
# 检查容器健康状态
docker inspect naling-virtual-office | grep -A 10 "Health"

# 检查 nginx 日志
docker exec -it naling-virtual-office cat /var/log/nginx/error.log
```

**Q: WebSocket 连接失败**

检查反向代理配置是否包含 WebSocket 支持:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

**Q: 内存占用过高**

```bash
# 限制容器资源
docker update --memory=1G --memory-swap=2G naling-virtual-office
```

### 健康检查

```bash
# 本地检查
curl http://localhost:3000/health

# Docker 检查
docker exec naling-virtual-office curl -f http://localhost/health
```

---

## 7. 更新升级

### Docker 镜像更新

```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d

# 清理旧镜像
docker system prune -f
```

### 手动更新

```bash
# 拉取代码
git pull origin master

# 重新构建
docker-compose build --no-cache

# 重启
docker-compose up -d
```

### 回滚版本

```bash
# 查看历史镜像
docker images naling/virtual-office

# 回滚到指定版本
docker stop naling-virtual-office
docker rmi naling-virtual-office:latest
docker tag naling/virtual-office:v0.x.x naling/virtual-office:latest
docker start naling-virtual-office
```

---

## 生产环境检查清单

- [ ] 防火墙开放必要端口
- [ ] HTTPS 证书已配置
- [ ] 定期备份策略已设置
- [ ] 监控告警已配置
- [ ] 日志收集已配置
- [ ] 资源限制已设置
- [ ] 安全头已配置
- [ ] 定期安全更新已启用

---

## 技术支持

- **GitHub Issues**: https://github.com/lucky3885998/virtual-office/issues
- **文档**: https://github.com/lucky3885998/virtual-office#readme
