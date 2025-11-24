#!/bin/bash

# Helper script to encode secrets for Kubernetes
# Usage: ./encode-secrets.sh

echo "🔐 Kubernetes Secrets Encoder"
echo "=============================="
echo ""

# Check if .env file exists
if [ ! -f "../../.env" ]; then
    echo "❌ .env file not found in project root"
    echo "Please create a .env file with your API keys first"
    exit 1
fi

# Source the .env file
set -a
source ../../.env
set +a

echo "Encoding secrets from .env file..."
echo ""

# Function to encode and print
encode_secret() {
    local name=$1
    local value=$2
    if [ -n "$value" ]; then
        local encoded=$(echo -n "$value" | base64)
        echo "  $name: $encoded"
    else
        echo "  $name: \"\"  # Not set in .env"
    fi
}

echo "Copy these values to k8s/config/secrets.yaml:"
echo ""
echo "data:"

encode_secret "MONGODB_USERNAME" "${MONGODB_USERNAME:-admin}"
encode_secret "MONGODB_PASSWORD" "${MONGODB_PASSWORD:-admin123}"
encode_secret "JWT_SECRET" "$JWT_SECRET"
encode_secret "INTERNAL_API_KEY" "$INTERNAL_API_KEY"
encode_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
encode_secret "TAVILY_API_KEY" "$TAVILY_API_KEY"
encode_secret "OPENWEATHER_API_KEY" "$OPENWEATHER_API_KEY"

echo ""
echo "✅ Done! Copy the above values to secrets.yaml"

