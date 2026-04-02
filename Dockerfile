# ============================================
# 纳灵虚拟办公室 - 生产镜像
# ============================================

# 第一阶段: 构建
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production=false

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# ============================================
# 第二阶段: 运行 (nginx)
# ============================================
FROM nginx:alpine AS runner

# 安装 bash 和 curl (用于健康检查)
RUN apk add --no-cache bash curl

# 复制 nginx 配置
COPY --from=builder /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# 端口
EXPOSE 80

# 启动
CMD ["sh", "-c", "nginx -g 'daemon off;'"]
