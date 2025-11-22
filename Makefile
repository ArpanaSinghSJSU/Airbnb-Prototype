# GoTour Airbnb Prototype - Makefile
# Simplified commands for development

.PHONY: help setup server frontend stop-all stop-backend stop-frontend health logs clean seed kafka-status kafka-topics kafka-logs kafka-test k8s-deploy k8s-status k8s-logs k8s-cleanup k8s-test

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
	@echo "📨 Kafka:"
	@echo "  make kafka-status    - Check Kafka & Zookeeper status"
	@echo "  make kafka-topics    - List all Kafka topics"
	@echo "  make kafka-logs      - View Kafka logs (all services)"
	@echo "  make kafka-test      - Complete Kafka flow test guide"
	@echo ""
	@echo "☸️  Kubernetes:"
	@echo "  make k8s-deploy      - Deploy to Minikube"
	@echo "  make k8s-status      - Check K8s pods & services"
	@echo "  make k8s-logs        - View K8s logs"
	@echo "  make k8s-cleanup     - Remove all K8s resources"
	@echo "  make k8s-test        - Test K8s deployment"
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
	@echo "📨 Kafka:"
	@echo "  📨 Kafka Broker:       http://localhost:9092"
	@echo "  🗂️  Zookeeper:          http://localhost:2181"
	@echo "  💡 Run 'make kafka-status' for Kafka details"
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
	@if docker ps | grep -q gotour-kafka; then \
		echo "✅ Kafka             - http://localhost:9092"; \
	else \
		echo "❌ Kafka             - Not running"; \
	fi
	@if docker ps | grep -q gotour-zookeeper; then \
		echo "✅ Zookeeper         - http://localhost:2181"; \
	else \
		echo "❌ Zookeeper         - Not running"; \
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
	@echo ""
	@# Check if MongoDB is running
	@if ! docker ps | grep -q gotour-mongodb; then \
		echo "❌ MongoDB is not running!"; \
		echo ""; \
		echo "Starting MongoDB..."; \
		docker-compose up -d mongodb; \
		echo "⏳ Waiting for MongoDB to initialize..."; \
		sleep 5; \
		echo "✅ MongoDB started"; \
		echo ""; \
	fi
	@echo "📊 Useful commands:"
	@echo "  db.users.find().pretty()"
	@echo "  db.properties.find().pretty()"
	@echo "  db.bookings.find().pretty()"
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

# ============================================
# KAFKA COMMANDS (PHASE 4)
# ============================================

kafka-status:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║              📨 Kafka & Zookeeper Status                   ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@# Check Zookeeper
	@if docker ps | grep -q gotour-zookeeper; then \
		echo "✅ Zookeeper is running"; \
		echo "   Container: gotour-zookeeper"; \
		echo "   Port: 2181"; \
	else \
		echo "❌ Zookeeper is not running"; \
	fi
	@echo ""
	@# Check Kafka
	@if docker ps | grep -q gotour-kafka; then \
		echo "✅ Kafka is running"; \
		echo "   Container: gotour-kafka"; \
		echo "   Port: 9092"; \
	else \
		echo "❌ Kafka is not running"; \
	fi
	@echo ""
	@# Check Kafka health
	@if docker ps | grep -q gotour-kafka; then \
		echo "🔍 Checking Kafka broker health..."; \
		docker exec gotour-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1 && \
		echo "✅ Kafka broker is healthy" || \
		echo "⚠️  Kafka broker is not responding"; \
	fi
	@echo ""
	@# Show consumer groups
	@if docker ps | grep -q gotour-kafka; then \
		echo "👥 Active Consumer Groups:"; \
		docker exec gotour-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list 2>/dev/null || echo "   (none yet)"; \
	fi
	@echo ""

kafka-topics:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║                  📋 Kafka Topics                           ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@if ! docker ps | grep -q gotour-kafka; then \
		echo "❌ Kafka is not running!"; \
		echo "Start services: make server"; \
		exit 1; \
	fi
	@echo "📝 Topics List:"
	@echo "───────────────────────────────────────────────────────────"
	@docker exec gotour-kafka kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null || echo "No topics found"
	@echo ""
	@echo "📊 Topic Details:"
	@echo "───────────────────────────────────────────────────────────"
	@docker exec gotour-kafka kafka-topics --bootstrap-server localhost:9092 --describe 2>/dev/null || echo "No topics to describe"
	@echo ""

kafka-logs:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║              📨 Kafka Service Logs (Live)                  ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🔍 Watching Kafka-related logs from all services..."
	@echo "   - Booking Service (Producer + Consumer)"
	@echo "   - Traveler Service (Consumer)"
	@echo "   - Owner Service (Consumer)"
	@echo "   - Kafka Broker"
	@echo ""
	@echo "💡 Look for:"
	@echo "   📤 'Published to' - Message sent"
	@echo "   📩 'Received message from' - Message received"
	@echo "   ✅ 'Kafka Producer connected'"
	@echo "   ✅ 'Kafka Consumer connected'"
	@echo ""
	@echo "Press Ctrl+C to exit"
	@echo "═══════════════════════════════════════════════════════════"
	@echo ""
	@docker-compose logs -f booking-service traveler-service owner-service kafka 2>&1 | grep -i "kafka\|📤\|📩\|topic\|consumer\|producer" --line-buffered --color=always

kafka-logs-booking:
	@echo "📅 Booking Service Kafka logs:"
	@docker-compose logs -f booking-service | grep -i "kafka\|📤\|📩" --line-buffered --color=always

kafka-logs-traveler:
	@echo "🧑 Traveler Service Kafka logs:"
	@docker-compose logs -f traveler-service | grep -i "kafka\|📤\|📩" --line-buffered --color=always

kafka-logs-owner:
	@echo "🏠 Owner Service Kafka logs:"
	@docker-compose logs -f owner-service | grep -i "kafka\|📤\|📩" --line-buffered --color=always

kafka-logs-broker:
	@echo "📨 Kafka Broker logs:"
	@docker logs -f gotour-kafka

kafka-monitor:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║          📊 Kafka Topic Monitor (owner-notifications)     ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🔍 Consuming messages from owner-notifications topic..."
	@echo "This will show all booking creation events."
	@echo ""
	@echo "Press Ctrl+C to exit"
	@echo "═══════════════════════════════════════════════════════════"
	@echo ""
	@docker exec -it gotour-kafka kafka-console-consumer \
		--bootstrap-server localhost:9092 \
		--topic owner-notifications \
		--from-beginning \
		--property print.timestamp=true \
		--property print.key=true

kafka-monitor-status:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║          📊 Kafka Topic Monitor (booking-status-updates)  ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🔍 Consuming messages from booking-status-updates topic..."
	@echo "This will show all booking status changes (accept/cancel)."
	@echo ""
	@echo "Press Ctrl+C to exit"
	@echo "═══════════════════════════════════════════════════════════"
	@echo ""
	@docker exec -it gotour-kafka kafka-console-consumer \
		--bootstrap-server localhost:9092 \
		--topic booking-status-updates \
		--from-beginning \
		--property print.timestamp=true \
		--property print.key=true

kafka-test:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║              🧪 Kafka Flow Testing Guide                   ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📋 STEP-BY-STEP KAFKA TESTING:"
	@echo "═══════════════════════════════════════════════════════════"
	@echo ""
	@echo "✅ Step 1: Verify Kafka is Running"
	@echo "   make kafka-status"
	@echo ""
	@echo "✅ Step 2: Check Topics Exist"
	@echo "   make kafka-topics"
	@echo "   Expected: booking-requests, owner-notifications, booking-status-updates"
	@echo ""
	@echo "✅ Step 3: Open Kafka Logs (in 3 terminals)"
	@echo "   Terminal 1: make kafka-logs-booking"
	@echo "   Terminal 2: make kafka-logs-owner"
	@echo "   Terminal 3: make kafka-logs-traveler"
	@echo ""
	@echo "✅ Step 4: Test Booking Creation Flow"
	@echo "   a) Open frontend: http://localhost:3000"
	@echo "   b) Login as traveler: john.traveler@example.com / password123"
	@echo "   c) Create a booking"
	@echo "   d) Watch logs for:"
	@echo "      - Booking Service: '📤 Published to owner-notifications'"
	@echo "      - Owner Service: '📩 Received message from owner-notifications'"
	@echo ""
	@echo "✅ Step 5: Test Booking Acceptance Flow"
	@echo "   a) Login as owner: robert.owner@example.com / password123"
	@echo "   b) Go to 'Manage Bookings'"
	@echo "   c) Accept a pending booking"
	@echo "   d) Watch logs for:"
	@echo "      - Booking Service: '📤 Published BOOKING_ACCEPTED event'"
	@echo "      - Traveler Service: '📩 Received message from booking-status-updates'"
	@echo ""
	@echo "✅ Step 6: Monitor Topics (optional)"
	@echo "   make kafka-monitor           # Watch booking creation events"
	@echo "   make kafka-monitor-status    # Watch status updates"
	@echo ""
	@echo "═══════════════════════════════════════════════════════════"
	@echo ""
	@echo "📚 Full Documentation:"
	@echo "   - KAFKA_BOOKING_FLOW.md      - Complete flow explanation"
	@echo "   - KAFKA_TESTING_GUIDE.md     - Detailed testing scenarios"
	@echo "   - KAFKA_QUICKSTART.md        - Quick start guide"
	@echo ""
	@echo "💡 TIP: Run 'make kafka-status' to verify Kafka is healthy!"
	@echo ""

kafka-reset:
	@echo "⚠️  WARNING: This will reset ALL Kafka data!"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	@echo ""
	@echo "🔄 Resetting Kafka..."
	@docker-compose restart zookeeper kafka
	@echo "⏳ Waiting for Kafka to restart..."
	@sleep 10
	@echo "✅ Kafka reset complete!"
	@echo ""
	@echo "Run 'make kafka-topics' to see topics recreated on next service start."

# ============================================
# 7. KUBERNETES COMMANDS
# ============================================

k8s-deploy:
	@echo "☸️  Deploying to Kubernetes (Minikube)..."
	@chmod +x k8s/deploy.sh
	@./k8s/deploy.sh

k8s-status:
	@echo "☸️  Kubernetes Status"
	@echo "══════════════════════════════════════════════════════════"
	@echo ""
	@echo "📦 Pods:"
	@kubectl get pods -n gotour 2>/dev/null || echo "❌ No pods found. Run 'make k8s-deploy' first"
	@echo ""
	@echo "🌐 Services:"
	@kubectl get services -n gotour 2>/dev/null || echo "❌ No services found"
	@echo ""
	@echo "📈 HPAs:"
	@kubectl get hpa -n gotour 2>/dev/null || echo "❌ No HPAs found"
	@echo ""
	@echo "💾 PVCs:"
	@kubectl get pvc -n gotour 2>/dev/null || echo "❌ No PVCs found"

k8s-logs:
	@echo "☸️  Select a service to view logs:"
	@echo "1) traveler-service"
	@echo "2) owner-service"
	@echo "3) property-service"
	@echo "4) booking-service"
	@echo "5) ai-agent-service"
	@echo "6) frontend"
	@echo "7) mongodb"
	@echo "8) kafka"
	@read -p "Enter choice (1-8): " choice; \
	case $$choice in \
		1) kubectl logs -f deployment/traveler-service -n gotour ;; \
		2) kubectl logs -f deployment/owner-service -n gotour ;; \
		3) kubectl logs -f deployment/property-service -n gotour ;; \
		4) kubectl logs -f deployment/booking-service -n gotour ;; \
		5) kubectl logs -f deployment/ai-agent-service -n gotour ;; \
		6) kubectl logs -f deployment/frontend -n gotour ;; \
		7) kubectl logs -f statefulset/mongodb -n gotour ;; \
		8) kubectl logs -f statefulset/kafka -n gotour ;; \
		*) echo "Invalid choice" ;; \
	esac

k8s-cleanup:
	@echo "🧹 Cleaning up Kubernetes resources..."
	@chmod +x k8s/cleanup.sh
	@./k8s/cleanup.sh

k8s-test:
	@echo "🧪 Testing Kubernetes Deployment"
	@echo "══════════════════════════════════════════════════════════"
	@echo ""
	@echo "1️⃣  Getting frontend URL..."
	@minikube service frontend-service -n gotour --url 2>/dev/null || echo "❌ Frontend not accessible"
	@echo ""
	@echo "2️⃣  Testing health endpoints..."
	@kubectl exec -it deployment/traveler-service -n gotour -- curl -s http://localhost:3001/health 2>/dev/null || echo "❌ Traveler service not healthy"
	@kubectl exec -it deployment/booking-service -n gotour -- curl -s http://localhost:3004/health 2>/dev/null || echo "❌ Booking service not healthy"
	@echo ""
	@echo "3️⃣  Testing MongoDB..."
	@kubectl exec -it mongodb-0 -n gotour -- mongosh --eval "db.adminCommand('ping')" 2>/dev/null || echo "❌ MongoDB not accessible"
	@echo ""
	@echo "4️⃣  Testing Kafka..."
	@kubectl exec -it kafka-0 -n gotour -- kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null || echo "❌ Kafka not accessible"
	@echo ""
	@echo "✅ Test complete! Check output above for any errors."
