#!/bin/bash

# AI Concierge Agent Setup Script
echo "🤖 Setting up AI Concierge Agent..."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy env.example to .env:"
echo "   cp env.example .env"
echo ""
echo "2. Edit .env and add your API keys:"
echo "   - OPENAI_API_KEY"
echo "   - TAVILY_API_KEY"
echo ""
echo "3. Activate virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "4. Run the agent:"
echo "   python main.py"
echo ""
echo "🚀 Agent will be available at http://localhost:8000"
echo "📚 API docs at http://localhost:8000/docs"
echo ""

