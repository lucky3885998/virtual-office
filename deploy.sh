#!/bin/bash
# ============================================
# 纳灵虚拟办公室 - 部署脚本
#
# 支持: Linux / macOS / Windows (Git Bash / WSL)
#
# 使用方法:
#   ./deploy.sh              # 交互式部署
#   ./deploy.sh --docker     # Docker 部署
#   ./deploy.sh --local      # 本地直接运行
#   ./deploy.sh --stop       # 停止服务
#   ./deploy.sh --restart    # 重启服务
#   ./deploy.sh --logs       # 查看日志
#   ./deploy.sh --update     # 更新镜像
#
# ============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
APP_NAME="naling-virtual-office"
APP_PORT="${APP_PORT:-3000}"
IMAGE_NAME="naling/virtual-office"
CONTAINER_NAME="naling-virtual-office"

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查依赖
check_dependencies() {
    local deps=("docker" "docker-compose")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            log_error "$dep 未安装"
            echo "请先安装 $dep: https://docs.docker.com/get-docker/"
            exit 1
        fi
    done
    
    if ! command -v curl &> /dev/null; then
        log_warn "curl 未安装，部分功能可能不可用"
    fi
}

# 构建 Docker 镜像
build_image() {
    log_info "正在构建 Docker 镜像..."
    docker build -t $IMAGE_NAME:latest .
    log_success "镜像构建完成"
}

# 拉取最新镜像
pull_image() {
    log_info "正在拉取最新镜像..."
    docker pull $IMAGE_NAME:latest
    log_success "镜像拉取完成"
}

# 启动服务 (Docker)
start_docker() {
    log_info "正在启动服务..."
    
    # 检查端口是否被占用
    if lsof -ti:$APP_PORT &> /dev/null || netstat -an | grep -q ":$APP_PORT "; then
        log_warn "端口 $APP_PORT 已被占用，尝试停止现有容器..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
    fi
    
    # 加载环境变量
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # 启动容器
    docker-compose up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 5
    
    # 检查健康状态
    if curl -sf http://localhost:$APP_PORT/health > /dev/null; then
        log_success "服务启动成功!"
        echo ""
        echo "=========================================="
        echo "  虚拟办公室已启动"
        echo "  访问地址: http://localhost:$APP_PORT"
        echo "  健康检查: http://localhost:$APP_PORT/health"
        echo "=========================================="
    else
        log_error "服务启动失败，请检查日志"
        show_logs
        exit 1
    fi
}

# 停止服务
stop_services() {
    log_info "正在停止服务..."
    docker-compose down
    log_success "服务已停止"
}

# 重启服务
restart_services() {
    stop_services
    start_docker
}

# 查看日志
show_logs() {
    docker-compose logs -f --tail=100
}

# 更新部署
update_deploy() {
    log_info "正在更新部署..."
    pull_image
    docker-compose up -d --build
    log_success "更新完成"
}

# 本地开发模式
start_local() {
    log_info "启动本地开发服务器..."
    npm install
    npm run dev
}

# 构建生产版本
build_prod() {
    log_info "构建生产版本..."
    npm install
    npm run build
    log_success "构建完成，产物在 dist/ 目录"
}

# 部署到远程服务器
deploy_remote() {
    log_info "准备远程部署..."
    
    if [ -z "$REMOTE_HOST" ]; then
        echo "请设置 REMOTE_HOST 环境变量:"
        echo "  export REMOTE_HOST=user@your-server.com"
        echo ""
        echo "或创建 ~/.ssh/config 配置跳板机"
        exit 1
    fi
    
    # 构建
    build_prod
    
    # 打包
    log_info "打包部署文件..."
    tar -czvf deploy-package.tar.gz \
        dist/ \
        Dockerfile \
        docker-compose.yml \
        .env.example \
        deploy/nginx.conf \
        --exclude="node_modules" \
        --exclude=".git" \
        --exclude="deploy-package.tar.gz"
    
    # 上传并部署
    log_info "上传到远程服务器..."
    scp deploy-package.tar.gz $REMOTE_HOST:/tmp/
    
    ssh $REMOTE_HOST << 'ENDSSH'
        cd /opt/naling-virtual-office
        tar -xzvf /tmp/deploy-package.tar.gz
        docker-compose up -d --build
        docker system prune -f
ENDSSH
    
    log_success "远程部署完成!"
}

# 显示状态
show_status() {
    docker ps -a --filter "name=$APP_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# 显示帮助
show_help() {
    echo ""
    echo "纳灵虚拟办公室 - 部署脚本"
    echo ""
    echo "用法: ./deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  --docker     使用 Docker 部署 (默认)"
    echo "  --local      本地开发模式"
    echo "  --build      仅构建生产版本"
    echo "  --stop       停止服务"
    echo "  --restart    重启服务"
    "  --logs       查看日志"
    echo "  --update     更新部署 (拉取最新镜像)"
    echo "  --status     显示服务状态"
    echo "  --help       显示此帮助"
    echo ""
    echo "环境变量:"
    echo "  APP_PORT     部署端口 (默认: 3000)"
    echo "  REMOTE_HOST  远程部署主机"
    echo ""
}

# 主程序
main() {
    check_dependencies
    
    case "${1:-}" in
        --docker)
            start_docker
            ;;
        --local)
            start_local
            ;;
        --build)
            build_prod
            ;;
        --stop)
            stop_services
            ;;
        --restart)
            restart_services
            ;;
        --logs)
            show_logs
            ;;
        --update)
            update_deploy
            ;;
        --status)
            show_status
            ;;
        --deploy-remote)
            deploy_remote
            ;;
        --help|-h)
            show_help
            ;;
        "")
            start_docker
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
