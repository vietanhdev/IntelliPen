#!/bin/bash

# IntelliPen Documentation Server
# Starts the MkDocs development server

echo "🚀 Starting IntelliPen Documentation Server..."
echo ""

# Add local bin to PATH
export PATH="$HOME/.local/bin:$PATH"

# Check if mkdocs is installed
if ! command -v mkdocs &> /dev/null; then
    echo "❌ MkDocs not found!"
    echo ""
    echo "Install with:"
    echo "  pip3 install --user -r requirements.txt"
    echo ""
    exit 1
fi

echo "📚 MkDocs version: $(mkdocs --version)"
echo ""
echo "🌐 Server will be available at: http://127.0.0.1:8000/"
echo "📝 Press Ctrl+C to stop the server"
echo ""

# Start server
mkdocs serve
