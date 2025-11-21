# GoTour Airbnb Prototype - Makefile
# Simplified commands for development

.PHONY: help setup server frontend stop-all stop-backend stop-frontend health logs clean seed

# Default target - show help
help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║           GoTour Airbnb Prototype - Commands               ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "⚙️  Setup (First Time):"
	@echo "  make setup           - Install dependencies & setup .env"
	@echo ""
	@echo "🚀 Main Commands:"
	@echo "  make server          - Start all backend services (Docker)"
	@echo "  make frontend        - Start frontend React app"
	@echo "  make seed            - Seed database with test data"
	@echo ""
	@echo "🛑 Stop Commands:"
	@echo "  make stop-all        - Stop everything (backend + frontend)"
	@echo "  make stop-backend    - Stop backend services only"
	@echo "  make stop-frontend   - Stop frontend only"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  make health          - Check health of all services"
	@echo "  make logs            - View logs from all services"
	@echo "  make ps              - List running containers"
	@echo ""
	@echo "🔧 Utilities:"
	@echo "  make clean           - Clean Docker cache"
	@echo ""

# ============================================
# 0. INITIAL SETUP
# ============================================

setup:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║              🚀 GoTour Initial Setup                       ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📦 Installing root dependencies..."
	@npm install
	@echo "✅ Root dependencies installed"
	@echo ""
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✅ Frontend dependencies installed"
	@echo ""
	@# Check if .env file exists
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file from template..."; \
		cp env.template .env; \
		echo "✅ .env file created"; \
		echo ""; \
		echo "⚠️  IMPORTANT: Edit .env and add your API keys:"; \
		echo "   - OPENAI_API_KEY"; \
		echo "   - TAVILY_API_KEY"; \
		echo "   - OPENWEATHER_API_KEY (optional)"; \
		echo ""; \
	else \
		echo "✅ .env file already exists"; \
		echo ""; \
	fi
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║              ✅ Setup Complete!                            ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📋 Next steps:"
	@echo "  1. Edit .env file and add your API keys"
	@echo "  2. Run 'make server' to start backend services"
	@echo "  3. Run 'make seed' to populate test data"
	@echo "  4. Run 'make frontend' to start the React app"
	@echo ""

# ============================================
# 1. START BACKEND SERVICES
# ============================================

server:
	@echo "🚀 Starting all backend services..."
	@echo ""
	@# Check if .env file exists
	@if [ ! -f .env ]; then \
		echo "⚠️  Warning: .env file not found!"; \
		echo "📝 Creating .env from template..."; \
		cp env.template .env; \
		echo ""; \
		echo "⚠️  IMPORTANT: Edit .env and add your API keys:"; \
		echo "   - OPENAI_API_KEY"; \
		echo "   - TAVILY_API_KEY"; \
		echo ""; \
		echo "Then run 'make server' again."; \
		exit 1; \
	fi
	@# Check if Docker is running
	@if ! docker info > /dev/null 2>&1; then \
		echo "❌ Docker is not running!"; \
		echo "Please start Docker Desktop and try again."; \
		exit 1; \
	fi
	@echo "✅ Docker is running"
	@echo ""
	@# Clean old cache
	@echo "🧹 Cleaning old Docker cache..."
	@docker image prune -f > /dev/null 2>&1
	@echo "✅ Cache cleaned"
	@echo ""
	@# Start services (rebuild to pick up code changes)
	@echo "🐳 Building and starting Docker containers..."
	docker-compose up -d --build
	@echo ""
	@echo "⏳ Waiting for services to be healthy..."
	@sleep 5
	@echo ""
	@make health
	@echo ""
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║              ✅ Backend Services Started!                  ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📊 Service URLs:"
	@echo "  🧑 Traveler Service:   http://localhost:3001"
	@echo "  🏠 Owner Service:      http://localhost:3002"
	@echo "  🏡 Property Service:   http://localhost:3003"
	@echo "  📅 Booking Service:    http://localhost:3004"
	@echo "  🤖 AI Agent:           http://localhost:8000"
	@echo ""
	@echo "💾 Database:"
	@echo "  📊 MongoDB:            mongodb://localhost:27017"
	@echo "  🌐 Mongo Express:      http://localhost:8081 (admin/admin123)"
	@echo ""
	@echo "🎨 Next step: Run 'make frontend' to start the React app"
	@echo ""

# ============================================
# 2. START FRONTEND
# ============================================

frontend:
	@echo "🎨 Starting frontend React app..."
	@echo ""
	@if [ ! -d frontend/node_modules ]; then \
		echo "📦 Installing frontend dependencies..."; \
		cd frontend && npm install; \
		echo ""; \
	fi
	@echo "🚀 Starting React development server..."
	@echo ""
	@cd frontend && npm start

# ============================================
# 3. STOP ALL (BACKEND + FRONTEND)
# ============================================

stop-all:
	@echo "🛑 Stopping all services..."
	@echo ""
	@# Stop Docker services
	@echo "Stopping backend services..."
	@docker-compose down
	@echo "✅ Backend services stopped"
	@echo ""
	@# Stop frontend (kill process on port 3000)
	@echo "Stopping frontend..."
	@-lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Frontend stopped" || echo "ℹ️  Frontend was not running"
	@echo ""
	@echo "✅ All services stopped!"

# ============================================
# 4. STOP BACKEND ONLY
# ============================================

stop-backend:
	@echo "🛑 Stopping backend services..."
	docker-compose down
	@echo "✅ Backend services stopped"

# ============================================
# 5. STOP FRONTEND ONLY
# ============================================

stop-frontend:
	@echo "🛑 Stopping frontend..."
	@-lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Frontend stopped" || echo "ℹ️  Frontend was not running"

# ============================================
# 6. HEALTH CHECK
# ============================================

health:
	@echo "🏥 Health Check Status:"
	@echo "═══════════════════════════════════════════════"
	@# Check each service
	@if curl -s http://localhost:3001/health > /dev/null 2>&1; then \
		echo "✅ Traveler Service  - http://localhost:3001"; \
	else \
		echo "❌ Traveler Service  - Not responding"; \
	fi
	@if curl -s http://localhost:3002/health > /dev/null 2>&1; then \
		echo "✅ Owner Service     - http://localhost:3002"; \
	else \
		echo "❌ Owner Service     - Not responding"; \
	fi
	@if curl -s http://localhost:3003/health > /dev/null 2>&1; then \
		echo "✅ Property Service  - http://localhost:3003"; \
	else \
		echo "❌ Property Service  - Not responding"; \
	fi
	@if curl -s http://localhost:3004/health > /dev/null 2>&1; then \
		echo "✅ Booking Service   - http://localhost:3004"; \
	else \
		echo "❌ Booking Service   - Not responding"; \
	fi
	@if curl -s http://localhost:8000/health > /dev/null 2>&1; then \
		echo "✅ AI Agent          - http://localhost:8000"; \
	else \
		echo "❌ AI Agent          - Not responding"; \
	fi
	@if docker ps | grep -q gotour-mongodb; then \
		echo "✅ MongoDB           - mongodb://localhost:27017"; \
	else \
		echo "❌ MongoDB           - Not running"; \
	fi

# ============================================
# MONITORING & LOGS
# ============================================

logs:
	@echo "📋 Viewing logs from all services..."
	@echo "Press Ctrl+C to exit"
	@echo ""
	docker-compose logs -f

logs-ai:
	@echo "🤖 AI Agent logs:"
	docker-compose logs -f ai-agent

logs-booking:
	@echo "📅 Booking Service logs:"
	docker-compose logs -f booking-service

logs-traveler:
	@echo "🧑 Traveler Service logs:"
	docker-compose logs -f traveler-service

logs-property:
	@echo "🏡 Property Service logs:"
	docker-compose logs -f property-service

logs-owner:
	@echo "🏠 Owner Service logs:"
	docker-compose logs -f owner-service

ps:
	@echo "📦 Running containers:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ============================================
# CLEAN & REBUILD
# ============================================

clean:
	@echo "🧹 Cleaning Docker cache..."
	@echo ""
	@docker-compose down 2>/dev/null || true
	@echo "✅ Containers stopped"
	@echo ""
	@echo "🗑️  Removing dangling images..."
	@docker image prune -f
	@echo ""
	@echo "🗑️  Removing build cache..."
	@docker builder prune -f
	@echo ""
	@echo "✅ Docker cache cleaned!"

clean-all:
	@echo "⚠️  WARNING: This will remove ALL containers, images, volumes!"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	@echo ""
	@echo "🧹 Deep cleaning Docker..."
	@docker-compose down -v 2>/dev/null || true
	@docker system prune -a --volumes -f
	@echo ""
	@echo "✅ Docker completely cleaned!"

# ============================================
# DATABASE
# ============================================

db-shell:
	@echo "🗄️  Opening MongoDB shell..."
	@echo "Use: db.bookings.find().pretty()"
	@echo ""
	docker-compose exec mongodb mongosh "mongodb://admin:admin123@localhost:27017/gotour_db?authSource=admin"

db-admin:
	@echo "🌐 Opening Mongo Express in browser..."
	@echo "URL: http://localhost:8081"
	@echo "Username: admin"
	@echo "Password: admin123"
	@open http://localhost:8081 2>/dev/null || xdg-open http://localhost:8081 2>/dev/null || echo "Open http://localhost:8081 in your browser"

seed:
	@echo "🌱 Seeding database with test data..."
	@echo ""
	@# Check if MongoDB is running
	@if ! docker ps | grep -q gotour-mongodb; then \
		echo "❌ MongoDB is not running!"; \
		echo "Please start backend services first: make server"; \
		exit 1; \
	fi
	@echo "✅ MongoDB is running"
	@echo ""
	@echo "📊 Seeding database..."
	@node seed-mongo.js
	@echo ""
	@echo "✅ Database seeded successfully!"

# ============================================
# UTILITIES
# ============================================

restart: stop-backend server

status:
	@echo "📊 GoTour Status"
	@echo "═══════════════════════════════════════════════"
	@make ps
	@echo ""
	@make health

# Check environment configuration
check-env:
	@echo "🔍 Checking environment configuration..."
	@if [ ! -f .env ]; then \
		echo "❌ .env file not found!"; \
		echo "Run: cp env.template .env"; \
		exit 1; \
	fi
	@if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then \
		echo "⚠️  OPENAI_API_KEY not set in .env"; \
	else \
		echo "✅ OPENAI_API_KEY is set"; \
	fi
	@if ! grep -q "TAVILY_API_KEY=tvly-" .env 2>/dev/null; then \
		echo "⚠️  TAVILY_API_KEY not set in .env"; \
	else \
		echo "✅ TAVILY_API_KEY is set"; \
	fi
