# CI/CD Deployment Guide: Self-Hosted Web Server

## Table of Contents
1. [Overview](#overview)
2. [Deployment Options Comparison](#deployment-options-comparison)
3. [Option 1: GitHub Actions Self-Hosted Runner](#option-1-github-actions-self-hosted-runner)
4. [Option 2: Webhook-Based Deployment](#option-2-webhook-based-deployment)
5. [Option 3: Git Hooks Deployment](#option-3-git-hooks-deployment)
6. [Option 4: Dual Deployment Strategy](#option-4-dual-deployment-strategy)
7. [Prerequisites for Self-Hosting](#prerequisites-for-self-hosting)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)
10. [Cost Analysis](#cost-analysis)

---

## Overview

This guide covers multiple approaches to deploy the News Search App to a self-hosted web server on your PC with automated CI/CD workflows. Each method provides different learning opportunities and real-world applicability.

### What is CI/CD?

**Continuous Integration (CI):** Automatically build and test code when changes are pushed
**Continuous Deployment (CD):** Automatically deploy successfully built code to production

### Your Current Workflow (Already CI/CD!)
```
You edit code → git push → GitHub Actions → Build → Deploy to GitHub Pages → Live
```

This guide extends this to deploy to your own PC web server.

---

## Deployment Options Comparison

| Method | Difficulty | Learning Value | Enterprise Usage | Setup Time | Maintenance |
|--------|------------|----------------|------------------|------------|-------------|
| **GitHub Pages** (current) | Easy | High | Very Common | 10 min | None |
| **Self-Hosted Runner** | Medium | Very High | Common | 30 min | Low |
| **Webhook Deploy** | Medium | High | Moderate | 45 min | Medium |
| **Git Hooks** | Easy | Medium | Rare | 20 min | Low |
| **Vercel/Netlify** | Easy | Medium | Very Common | 5 min | None |

### Learning Value Breakdown

**CI/CD Concepts You'll Learn:**
- Automated build pipelines
- Deployment automation
- Infrastructure as code
- Webhook event handling
- Git server-side hooks
- Self-hosted CI/CD agents
- Environment variable management
- Zero-downtime deployments
- Rollback strategies

---

## Option 1: GitHub Actions Self-Hosted Runner

### Overview
Install a GitHub Actions runner on your PC that listens for jobs from GitHub. This is how enterprise companies run builds on their own infrastructure.

### Architecture
```
Developer → Git Push → GitHub → Sends Job → Your PC Runner → Builds → Deploys → Live
```

### Step-by-Step Setup

#### 1. Register Self-Hosted Runner

**A. Navigate to GitHub Repository Settings**
```
Your Repo → Settings → Actions → Runners → New self-hosted runner
```

**B. Select Operating System**
- Choose: Windows (64-bit)
- GitHub will show custom download instructions

**C. Download Runner on Your PC**
```powershell
# Create a folder for the runner
mkdir C:\actions-runner
cd C:\actions-runner

# Download (GitHub provides the exact link)
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.xxx/actions-runner-win-x64-2.xxx.zip -OutFile actions-runner.zip

# Extract
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner.zip", "$PWD")
```

**D. Configure Runner**
```powershell
# Run configuration (GitHub provides the exact command with token)
.\config.cmd --url https://github.com/YOUR-USERNAME/news-search-app --token YOUR-TOKEN

# Enter runner name: news-app-runner
# Enter runner group: Default
# Enter labels: self-hosted,Windows,X64
# Enter work folder: _work
```

**E. Install as Windows Service (Runs on Startup)**
```powershell
# Install service
.\svc.sh install

# Start service
.\svc.sh start

# Check status
.\svc.sh status
```

#### 2. Create Deployment Workflow

Create `.github/workflows/deploy-self-hosted.yml`:

```yaml
name: Deploy to Self-Hosted Server

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Allow manual trigger

jobs:
  build-and-deploy:
    runs-on: self-hosted  # Uses your PC runner

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        env:
          VITE_NEWS_API_KEY: ${{ secrets.VITE_NEWS_API_KEY }}
        run: npm run build

      - name: Stop existing server
        shell: powershell
        run: |
          Get-Process -Name "node" -ErrorAction SilentlyContinue |
          Where-Object {$_.Path -like "*http-server*"} |
          Stop-Process -Force
        continue-on-error: true

      - name: Deploy to web server
        shell: powershell
        run: |
          # Create web server directory if not exists
          if (-not (Test-Path "C:\WebServer\news-app")) {
            New-Item -ItemType Directory -Path "C:\WebServer\news-app" -Force
          }

          # Copy built files
          Copy-Item -Path "dist\*" -Destination "C:\WebServer\news-app" -Recurse -Force

          Write-Host "Files deployed to C:\WebServer\news-app"

      - name: Start web server
        shell: powershell
        run: |
          cd C:\WebServer\news-app
          Start-Process powershell -ArgumentList "http-server -p 80 -d false" -WindowStyle Hidden
          Write-Host "Web server started on port 80"

      - name: Verify deployment
        run: |
          Start-Sleep -Seconds 5
          curl http://localhost/
        shell: powershell

      - name: Deployment summary
        run: |
          Write-Host "✅ Deployment successful!"
          Write-Host "🌐 App is live at: http://your-domain.ddns.net"
          Write-Host "📁 Files location: C:\WebServer\news-app"
        shell: powershell
```

#### 3. Workflow in Action

**When you make changes:**
```bash
# Edit your code
code src/App.jsx

# Commit changes
git add .
git commit -m "Updated feature X"

# Push to trigger deployment
git push origin main
```

**What happens automatically:**
1. GitHub receives your push
2. Workflow triggers
3. GitHub sends job to YOUR PC's runner
4. Your PC:
   - Checks out latest code
   - Installs dependencies
   - Builds production bundle
   - Stops old server
   - Copies new files to web directory
   - Starts new server
5. View logs in GitHub Actions tab
6. Your site is live with changes!

#### 4. Monitoring Deployments

**View Logs:**
- Go to GitHub repository → Actions tab
- Click on the latest workflow run
- Expand each step to see detailed logs
- See build time, success/failure status

**Local Monitoring:**
```powershell
# Check runner status
cd C:\actions-runner
.\run.cmd --check

# View runner logs
Get-Content C:\actions-runner\_diag\Runner_*.log -Tail 50

# Check if web server is running
Get-Process -Name node | Where-Object {$_.Path -like "*http-server*"}
```

### Advantages
- ✅ Professional enterprise-grade CI/CD
- ✅ Full visibility in GitHub Actions UI
- ✅ Easy rollback (redeploy previous commit)
- ✅ Can run tests before deployment
- ✅ Supports matrix builds, parallel jobs
- ✅ Secrets management through GitHub

### Disadvantages
- ❌ PC must run 24/7 for runner to work
- ❌ Runner uses CPU/memory during builds
- ❌ Slightly more complex setup

---

## Option 2: Webhook-Based Deployment

### Overview
Your PC runs a webhook listener that triggers a deployment script when GitHub sends a push event.

### Architecture
```
Developer → Git Push → GitHub → Webhook → Your PC Listener → Deploy Script → Live
```

### Step-by-Step Setup

#### 1. Install Webhook Tools

```powershell
# Install Node.js webhook package globally
npm install -g github-webhook-handler http-server

# Or use Python alternative
pip install flask
```

#### 2. Create Deployment Script

**Create `C:\WebServer\scripts\deploy.ps1`:**

```powershell
# News App Deployment Script
# Triggered by GitHub webhook

$ErrorActionPreference = "Stop"
$LogFile = "C:\WebServer\logs\deploy.log"

function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

Write-Log "🚀 Starting deployment..."

try {
    # Navigate to repository
    Write-Log "📂 Navigating to repository..."
    Set-Location "C:\Dev\Test123\news-search-app"

    # Pull latest changes
    Write-Log "⬇️  Pulling latest code from GitHub..."
    git pull origin main

    # Install dependencies
    Write-Log "📦 Installing dependencies..."
    npm install

    # Build project
    Write-Log "🔨 Building production bundle..."
    $env:VITE_NEWS_API_KEY = "e87d178585e24f839333b39436fa2e27"
    npm run build

    # Stop existing server
    Write-Log "🛑 Stopping existing web server..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue |
    Where-Object {$_.Path -like "*http-server*"} |
    Stop-Process -Force

    Start-Sleep -Seconds 2

    # Deploy files
    Write-Log "📋 Copying files to web server directory..."
    Copy-Item -Path "dist\*" -Destination "C:\WebServer\news-app" -Recurse -Force

    # Start new server
    Write-Log "▶️  Starting web server..."
    Set-Location "C:\WebServer\news-app"
    Start-Process powershell -ArgumentList "http-server -p 80 -d false" -WindowStyle Hidden

    Start-Sleep -Seconds 3

    # Verify deployment
    Write-Log "✅ Verifying deployment..."
    $Response = Invoke-WebRequest -Uri "http://localhost/" -TimeoutSec 5

    if ($Response.StatusCode -eq 200) {
        Write-Log "✅ DEPLOYMENT SUCCESSFUL! App is live."
    } else {
        throw "Health check failed with status code: $($Response.StatusCode)"
    }

} catch {
    Write-Log "❌ DEPLOYMENT FAILED: $_"

    # Send notification (optional)
    # Send-MailMessage -To "you@example.com" -Subject "Deployment Failed" -Body $_

    exit 1
}

Write-Log "🎉 Deployment completed successfully!"
```

#### 3. Create Webhook Listener

**Option A: Node.js Listener**

Create `C:\WebServer\scripts\webhook-server.js`:

```javascript
const http = require('http');
const createHandler = require('github-webhook-handler');
const { exec } = require('child_process');

const handler = createHandler({
  path: '/webhook',
  secret: 'your-secret-key-here'
});

http.createServer((req, res) => {
  handler(req, res, (err) => {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(9000);

console.log('✅ Webhook server listening on port 9000');

handler.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

handler.on('push', (event) => {
  console.log('📨 Received push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);

  // Trigger deployment script
  exec('powershell -File C:\\WebServer\\scripts\\deploy.ps1',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Deployment error: ${error}`);
        return;
      }
      console.log(`Deployment output: ${stdout}`);
    });
});

handler.on('issues', (event) => {
  console.log('Received issue event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title);
});
```

**Run webhook server:**
```powershell
node C:\WebServer\scripts\webhook-server.js
```

**Option B: Python Flask Listener**

Create `C:\WebServer\scripts\webhook-server.py`:

```python
from flask import Flask, request, jsonify
import subprocess
import hmac
import hashlib

app = Flask(__name__)
SECRET = b'your-secret-key-here'

def verify_signature(payload, signature):
    mac = hmac.new(SECRET, msg=payload, digestmod=hashlib.sha256)
    return hmac.compare_digest('sha256=' + mac.hexdigest(), signature)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Hub-Signature-256')

    if not signature or not verify_signature(request.data, signature):
        return jsonify({'error': 'Invalid signature'}), 403

    event = request.headers.get('X-GitHub-Event')

    if event == 'push':
        print('📨 Received push event, triggering deployment...')

        # Run deployment script
        result = subprocess.run(
            ['powershell', '-File', 'C:\\WebServer\\scripts\\deploy.ps1'],
            capture_output=True,
            text=True
        )

        return jsonify({
            'status': 'success',
            'message': 'Deployment triggered',
            'output': result.stdout
        }), 200

    return jsonify({'status': 'ignored', 'event': event}), 200

if __name__ == '__main__':
    print('✅ Webhook server listening on port 9000')
    app.run(host='0.0.0.0', port=9000)
```

#### 4. Configure Windows Firewall

```powershell
# Allow port 9000 for webhook listener
New-NetFirewallRule -DisplayName "Webhook Listener" -Direction Inbound -LocalPort 9000 -Protocol TCP -Action Allow

# Allow port 80 for web server
New-NetFirewallRule -DisplayName "Web Server HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

#### 5. Configure Router Port Forwarding

Access your router admin panel (usually `192.168.1.1` or `192.168.0.1`):

1. Find "Port Forwarding" or "Virtual Server" section
2. Add new rule:
   - Service Name: Webhook
   - External Port: 9000
   - Internal Port: 9000
   - Internal IP: Your PC's local IP (find with `ipconfig`)
   - Protocol: TCP
3. Save and apply

#### 6. Set Up Dynamic DNS

Since your ISP likely changes your IP address, use a DDNS service:

**Using No-IP.com (Free):**
1. Sign up at https://www.noip.com
2. Create a hostname (e.g., `deepaknews.ddns.net`)
3. Download and install No-IP DUC (Dynamic Update Client)
4. Configure client with your credentials
5. Client keeps your hostname pointing to your current IP

**Using DuckDNS.org (Free, simpler):**
1. Sign up at https://www.duckdns.org
2. Create a subdomain (e.g., `deepaknews.duckdns.org`)
3. Get your token
4. Create update script `C:\WebServer\scripts\update-ddns.ps1`:

```powershell
$Domain = "deepaknews"
$Token = "your-duckdns-token"
Invoke-WebRequest "https://www.duckdns.org/update?domains=$Domain&token=$Token" -UseBasicParsing
```

5. Schedule task to run every 5 minutes:
```powershell
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\WebServer\scripts\update-ddns.ps1"
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName "UpdateDDNS" -Action $Action -Trigger $Trigger
```

#### 7. Configure GitHub Webhook

1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. Fill in:
   - **Payload URL:** `http://deepaknews.ddns.net:9000/webhook`
   - **Content type:** `application/json`
   - **Secret:** `your-secret-key-here` (same as in listener)
   - **Events:** Just the push event
   - **Active:** ✓
4. Save webhook

#### 8. Test the Webhook

```bash
# Make a test change
echo "// Test deployment" >> src/App.jsx

# Commit and push
git add .
git commit -m "Test webhook deployment"
git push origin main
```

**Monitor the process:**
- Check webhook listener console output
- View deployment log: `Get-Content C:\WebServer\logs\deploy.log -Tail 20 -Wait`
- Check GitHub webhook delivery in Settings → Webhooks → Recent Deliveries

### Advantages
- ✅ Simpler than self-hosted runner
- ✅ Learn webhook security and validation
- ✅ Independent of GitHub Actions
- ✅ Custom deployment logic possible

### Disadvantages
- ❌ Webhook port must be exposed to internet
- ❌ No build logs in GitHub UI
- ❌ Must maintain webhook listener uptime

---

## Option 3: Git Hooks Deployment

### Overview
Use Git's built-in post-receive hook to automatically deploy when you push code directly to your PC.

### Architecture
```
Developer → git push production → Your PC Git Server → Post-Receive Hook → Build & Deploy → Live
```

### Step-by-Step Setup

#### 1. Create Bare Repository on Your PC

```powershell
# Create directory for Git repositories
New-Item -ItemType Directory -Path "C:\GitRepos" -Force

# Navigate to repos directory
cd C:\GitRepos

# Initialize bare repository
git init --bare news-app.git

# This creates a Git server repository that can receive pushes
```

#### 2. Create Post-Receive Hook

**Create `C:\GitRepos\news-app.git\hooks\post-receive`:**

```bash
#!/bin/sh

# Configuration
WORK_TREE="C:/WebServer/news-app-source"
PUBLIC_WWW="C:/WebServer/news-app"
API_KEY="e87d178585e24f839333b39436fa2e27"

echo "==================================="
echo "🚀 Deployment Hook Triggered"
echo "==================================="

# Checkout latest code to work tree
echo "📂 Checking out code..."
git --work-tree=$WORK_TREE --git-dir=$GIT_DIR checkout -f main

# Navigate to work tree
cd $WORK_TREE

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build project
echo "🔨 Building project..."
export VITE_NEWS_API_KEY=$API_KEY
npm run build

# Stop existing server
echo "🛑 Stopping web server..."
taskkill //F //IM node.exe //T 2>nul || true

# Copy built files to public directory
echo "📋 Deploying files..."
cp -rf dist/* $PUBLIC_WWW/

# Start web server
echo "▶️  Starting web server..."
cd $PUBLIC_WWW
nohup http-server -p 80 > /dev/null 2>&1 &

echo "✅ Deployment complete!"
echo "🌐 App is live at http://localhost"
echo "==================================="
```

**Make hook executable:**
```powershell
# On Windows, use Git Bash or WSL
# Navigate to hooks directory
cd C:\GitRepos\news-app.git\hooks

# Make executable (if using Git Bash)
chmod +x post-receive
```

#### 3. Add Your PC as Git Remote

```bash
# Navigate to your local project
cd C:\Dev\Test123\news-search-app

# Add production remote pointing to your PC
# Replace YOUR-PC-IP with your local IP (from ipconfig)
git remote add production deepak@YOUR-PC-IP:/c/GitRepos/news-app.git

# Verify remotes
git remote -v
```

#### 4. Deploy with Git Push

```bash
# Deploy to your PC with one command
git push production main

# You'll see the hook output in your terminal
```

#### 5. Create Deploy Script for Convenience

**Create `deploy.sh` in project root:**

```bash
#!/bin/bash

echo "🚀 Deploying to production server..."

# Push to GitHub (for backup and GitHub Pages)
git push origin main

# Push to production server (your PC)
git push production main

echo "✅ Deployment complete!"
echo "📱 GitHub Pages: https://deepaksx.github.io/news-search-app/"
echo "🖥️  Local Server: http://your-domain.ddns.net"
```

**Make it executable and use:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Advantages
- ✅ Simplest setup, no external services
- ✅ Direct push-to-deploy workflow
- ✅ Learn Git internals and server-side hooks
- ✅ Instant feedback in terminal

### Disadvantages
- ❌ No build logs in browser/GitHub
- ❌ SSH/Git access to PC required
- ❌ Manual rollback if deployment fails
- ❌ Less common in modern workflows

---

## Option 4: Dual Deployment Strategy (Recommended for Learning)

### Overview
Deploy to BOTH GitHub Pages (production) and your self-hosted server (learning/testing) with one push.

### Why This is Best for Learning
1. ✅ Production stays reliable on GitHub Pages
2. ✅ Experiment with self-hosting without risk
3. ✅ Learn enterprise patterns (multiple environments)
4. ✅ Compare performance and features
5. ✅ One workflow deploys everywhere

### Architecture
```
Developer → Git Push → GitHub Actions
                          ├─→ Job 1: Deploy to GitHub Pages (production)
                          └─→ Job 2: Deploy to Self-Hosted (staging/learning)
```

### Implementation

**Create `.github/workflows/deploy-dual.yml`:**

```yaml
name: Dual Deployment (GitHub Pages + Self-Hosted)

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  VITE_NEWS_API_KEY: ${{ secrets.VITE_NEWS_API_KEY }}

jobs:
  # Production deployment to GitHub Pages
  deploy-production:
    name: 🚀 Deploy to GitHub Pages (Production)
    runs-on: ubuntu-latest

    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: Production deployment complete
        run: |
          echo "✅ Deployed to: https://deepaksx.github.io/news-search-app/"

  # Staging deployment to self-hosted server
  deploy-staging:
    name: 🧪 Deploy to Self-Hosted (Staging)
    runs-on: self-hosted
    needs: []  # Runs in parallel with production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build for staging
        run: npm run build

      - name: Stop existing server
        shell: powershell
        run: |
          Get-Process -Name "node" -ErrorAction SilentlyContinue |
          Where-Object {$_.Path -like "*http-server*"} |
          Stop-Process -Force
        continue-on-error: true

      - name: Deploy to staging directory
        shell: powershell
        run: |
          $StagingPath = "C:\WebServer\staging\news-app"
          if (-not (Test-Path $StagingPath)) {
            New-Item -ItemType Directory -Path $StagingPath -Force
          }
          Copy-Item -Path "dist\*" -Destination $StagingPath -Recurse -Force

      - name: Start staging server
        shell: powershell
        run: |
          cd C:\WebServer\staging\news-app
          # Run on different port (8080) to not conflict with production
          Start-Process powershell -ArgumentList "http-server -p 8080 -d false" -WindowStyle Hidden

      - name: Verify staging deployment
        run: |
          Start-Sleep -Seconds 5
          curl http://localhost:8080/

      - name: Staging deployment complete
        run: |
          Write-Host "✅ Deployed to staging server"
          Write-Host "🌐 Staging URL: http://your-domain.ddns.net:8080"
        shell: powershell

  # Notification job (runs after both deployments)
  notify:
    name: 📢 Deployment Notification
    runs-on: ubuntu-latest
    needs: [deploy-production, deploy-staging]
    if: always()

    steps:
      - name: Deployment summary
        run: |
          echo "🎉 Dual Deployment Complete!"
          echo "================================"
          echo "✅ Production: https://deepaksx.github.io/news-search-app/"
          echo "🧪 Staging: http://your-domain.ddns.net:8080"
          echo "================================"
```

### Benefits of Dual Deployment

**Production (GitHub Pages):**
- Always reliable and fast
- Global CDN
- No maintenance
- For real users

**Staging (Self-Hosted):**
- Test deployments before affecting production
- Learn server management
- Experiment with custom features
- Debug in realistic environment

### Testing Workflow

```bash
# 1. Make changes locally
code src/App.jsx

# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "New feature"

# 4. Push once, deploys to both
git push origin main

# 5. Check both deployments
# - Production: https://deepaksx.github.io/news-search-app/
# - Staging: http://your-domain.ddns.net:8080

# 6. If staging looks good, it's already on production!
```

---

## Prerequisites for Self-Hosting

### Hardware Requirements
- ✅ Windows PC with minimum 4GB RAM
- ✅ 10GB free disk space
- ✅ Stable internet connection (at least 10 Mbps upload)
- ✅ PC that can run 24/7 (or accept downtime)

### Software Requirements
- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ Git ([Download](https://git-scm.com/))
- ✅ http-server: `npm install -g http-server`
- ✅ PowerShell 5.1+ (pre-installed on Windows 10/11)

### Network Requirements
- ✅ Router with port forwarding capability
- ✅ ISP that allows hosting (check terms of service)
- ✅ Dynamic DNS service (No-IP, DuckDNS)
- ⚠️ Static IP (optional, but makes setup easier)

### Directory Structure

```
C:\
├── WebServer\
│   ├── news-app\              # Production web files
│   ├── staging\
│   │   └── news-app\          # Staging web files
│   ├── scripts\
│   │   ├── deploy.ps1         # Deployment script
│   │   ├── webhook-server.js  # Webhook listener
│   │   └── update-ddns.ps1    # DDNS updater
│   └── logs\
│       └── deploy.log         # Deployment logs
├── GitRepos\
│   └── news-app.git\          # Bare Git repository
└── actions-runner\            # GitHub Actions runner
```

**Create directories:**
```powershell
$Dirs = @(
    "C:\WebServer\news-app",
    "C:\WebServer\staging\news-app",
    "C:\WebServer\scripts",
    "C:\WebServer\logs",
    "C:\GitRepos"
)

foreach ($Dir in $Dirs) {
    New-Item -ItemType Directory -Path $Dir -Force
}
```

---

## Security Considerations

### 1. Firewall Configuration

**Only open necessary ports:**
```powershell
# HTTP (required)
New-NetFirewallRule -DisplayName "HTTP Web Server" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# HTTPS (recommended)
New-NetFirewallRule -DisplayName "HTTPS Web Server" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Webhook (if using webhook deployment)
New-NetFirewallRule -DisplayName "Webhook Listener" -Direction Inbound -LocalPort 9000 -Protocol TCP -Action Allow

# Block all other incoming by default
Set-NetFirewallProfile -Profile Domain,Public,Private -DefaultInboundAction Block
```

### 2. Webhook Security

**Always validate webhook signatures:**
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### 3. Environment Variables

**Never hardcode secrets in scripts:**

```powershell
# Bad - hardcoded API key
$env:VITE_NEWS_API_KEY = "e87d178585e24f839333b39436fa2e27"

# Good - read from secure file
$SecretFile = "C:\WebServer\.secrets"
$Secrets = Get-Content $SecretFile | ConvertFrom-Json
$env:VITE_NEWS_API_KEY = $Secrets.API_KEY
```

**Protect secrets file:**
```powershell
# Create secrets file
$Secrets = @{
    API_KEY = "e87d178585e24f839333b39436fa2e27"
    WEBHOOK_SECRET = "your-webhook-secret"
} | ConvertTo-Json

$Secrets | Out-File "C:\WebServer\.secrets"

# Restrict permissions (only your user can read)
$Acl = Get-Acl "C:\WebServer\.secrets"
$Acl.SetAccessRuleProtection($true, $false)
$Rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    $env:USERNAME, "Read", "Allow"
)
$Acl.AddAccessRule($Rule)
Set-Acl "C:\WebServer\.secrets" $Acl
```

### 4. SSL/HTTPS Setup

**Why you need HTTPS:**
- ❌ Without HTTPS: Browsers show "Not Secure"
- ✅ With HTTPS: Secure padlock icon
- ✅ Required for modern web features (geolocation, camera, etc.)

**Getting Free SSL Certificate (Certbot/Let's Encrypt):**

```powershell
# Install Certbot for Windows
# Download from: https://certbot.eff.org/

# Run Certbot
certbot certonly --standalone -d your-domain.ddns.net

# Certificate will be saved to:
# C:\Certbot\live\your-domain.ddns.net\
```

**Use HTTPS with http-server:**
```powershell
http-server C:\WebServer\news-app `
  -p 443 `
  -S `
  -C C:\Certbot\live\your-domain.ddns.net\fullchain.pem `
  -K C:\Certbot\live\your-domain.ddns.net\privkey.pem
```

**Auto-renewal (certificates expire every 90 days):**
```powershell
# Create scheduled task to renew
$Action = New-ScheduledTaskAction -Execute "certbot" -Argument "renew --quiet"
$Trigger = New-ScheduledTaskTrigger -Weekly -At 3am -DaysOfWeek Sunday
Register-ScheduledTask -TaskName "RenewSSL" -Action $Action -Trigger $Trigger -RunLevel Highest
```

### 5. Rate Limiting

**Protect against abuse:**

```javascript
// In webhook-server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // max 10 requests per window
});

app.use('/webhook', limiter);
```

### 6. Monitoring & Alerts

**Get notified of issues:**

```powershell
# In deploy.ps1, add email notification on failure
if ($LASTEXITCODE -ne 0) {
    Send-MailMessage `
        -To "your-email@example.com" `
        -From "server@your-domain.ddns.net" `
        -Subject "Deployment Failed" `
        -Body "Check logs at C:\WebServer\logs\deploy.log" `
        -SmtpServer "smtp.gmail.com" `
        -Port 587 `
        -UseSsl `
        -Credential (Get-Credential)
}
```

### 7. Backup Strategy

**Automatic backups before deployment:**

```powershell
# Add to deploy.ps1 before copying new files
$BackupPath = "C:\WebServer\backups\news-app-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path "C:\WebServer\news-app" -Destination $BackupPath -Recurse

# Keep only last 5 backups
Get-ChildItem "C:\WebServer\backups" |
    Sort-Object CreationTime -Descending |
    Select-Object -Skip 5 |
    Remove-Item -Recurse -Force
```

---

## Troubleshooting

### Issue: "Cannot connect to http://your-domain.ddns.net"

**Possible Causes & Solutions:**

1. **Port forwarding not configured**
   ```powershell
   # Test if port is open from internet
   # Use https://www.yougetsignal.com/tools/open-ports/
   # Enter your public IP and port 80
   ```

2. **Firewall blocking**
   ```powershell
   # Check firewall rules
   Get-NetFirewallRule | Where-Object {$_.LocalPort -eq 80}

   # Temporarily disable to test
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
   # REMEMBER TO RE-ENABLE: -Enabled True
   ```

3. **Web server not running**
   ```powershell
   # Check if process is running
   Get-Process -Name node | Where-Object {$_.Path -like "*http-server*"}

   # Start manually
   cd C:\WebServer\news-app
   http-server -p 80
   ```

4. **ISP blocking port 80**
   ```powershell
   # Try alternative port (8080)
   http-server -p 8080

   # Update router port forwarding: 80 → 8080
   # Access via: http://your-domain.ddns.net:8080
   ```

### Issue: "GitHub Actions runner offline"

**Solutions:**

```powershell
# Check runner service status
cd C:\actions-runner
.\run.cmd --check

# View runner logs
Get-Content _diag\Runner_*.log -Tail 50

# Restart runner service
.\svc.sh stop
.\svc.sh start

# Re-register runner if needed
.\config.cmd remove
.\config.cmd --url https://github.com/deepaksx/news-search-app --token NEW-TOKEN
.\svc.sh install
.\svc.sh start
```

### Issue: "Webhook not triggering deployment"

**Debug steps:**

1. **Check webhook listener is running**
   ```powershell
   Get-Process -Name node | Where-Object {$_.Path -like "*webhook*"}

   # Start if not running
   node C:\WebServer\scripts\webhook-server.js
   ```

2. **Check GitHub webhook deliveries**
   - GitHub repo → Settings → Webhooks → Your webhook
   - Click "Recent Deliveries"
   - Check response codes and payloads

3. **Test webhook locally**
   ```powershell
   # Simulate GitHub webhook
   $Body = @{
       ref = "refs/heads/main"
       repository = @{
           name = "news-search-app"
       }
   } | ConvertTo-Json

   Invoke-WebRequest `
       -Uri "http://localhost:9000/webhook" `
       -Method POST `
       -Body $Body `
       -ContentType "application/json"
   ```

4. **Verify signature validation**
   - Check webhook secret matches in both GitHub and listener
   - Temporarily disable signature check for testing

### Issue: "Build succeeds but site shows old version"

**Solutions:**

1. **Clear browser cache**
   - Press Ctrl+Shift+R (hard refresh)
   - Or open in incognito mode

2. **Check files were actually copied**
   ```powershell
   # List files with timestamps
   Get-ChildItem C:\WebServer\news-app -Recurse |
       Sort-Object LastWriteTime -Descending |
       Select-Object -First 10 FullName, LastWriteTime
   ```

3. **Verify web server is serving new directory**
   ```powershell
   # Check what directory http-server is serving
   Get-Process -Name node |
       Get-ItemProperty -Name CommandLine
   ```

4. **Add cache-busting**
   ```javascript
   // In vite.config.js
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           entryFileNames: `assets/[name].[hash].js`,
           chunkFileNames: `assets/[name].[hash].js`,
           assetFileNames: `assets/[name].[hash].[ext]`
         }
       }
     }
   });
   ```

### Issue: "Deployment script fails silently"

**Add comprehensive error handling:**

```powershell
# Add to deploy.ps1
$ErrorActionPreference = "Stop"
$ErrorView = "NormalView"

try {
    # Your deployment steps
} catch {
    Write-Error "Deployment failed at line $($_.InvocationInfo.ScriptLineNumber): $($_.Exception.Message)"

    # Log full error
    $_ | Out-File "C:\WebServer\logs\error-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

    # Send notification
    Write-Host "Check error log for details"

    exit 1
}
```

### Issue: "npm build fails with memory error"

**Increase Node.js memory:**

```powershell
# Temporarily for current session
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run build

# Permanently in deploy script
$env:NODE_OPTIONS = "--max-old-space-size=4096"
```

### Issue: "DDNS not updating IP"

**Debug DDNS:**

```powershell
# Check current public IP
$PublicIP = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
Write-Host "Your public IP: $PublicIP"

# Check what IP DDNS is pointing to
nslookup your-domain.ddns.net

# Manually trigger DDNS update
Invoke-WebRequest "https://www.duckdns.org/update?domains=your-domain&token=your-token&ip=$PublicIP"

# Check update logs
Get-Content C:\WebServer\logs\ddns-update.log -Tail 20
```

---

## Cost Analysis

### GitHub Pages (Current Setup)
- **Hosting:** Free
- **Bandwidth:** Unlimited (soft limit 100GB/month)
- **Build minutes:** 2,000/month free
- **Domain:** $10-15/year (optional)
- **Total:** $0-15/year

### Self-Hosted on PC
- **Hardware:** $0 (existing PC)
- **Electricity:** $5-20/month (24/7 operation)
- **Internet:** $0 (assuming existing connection)
- **Static IP:** $5-10/month (if required by ISP)
- **Domain:** $10-15/year
- **DDNS:** Free (No-IP, DuckDNS)
- **SSL Certificate:** Free (Let's Encrypt)
- **Total:** $70-270/year

### Cloud Hosting (Vercel/Netlify)
- **Hosting:** Free tier (sufficient for most projects)
- **Bandwidth:** 100GB/month free
- **Build minutes:** 300-400/month free
- **Domain:** $10-15/year
- **Total:** $10-15/year

### Enterprise-Level Comparison
- **AWS EC2 (t2.micro):** ~$10/month = $120/year
- **DigitalOcean Droplet:** $6-12/month = $72-144/year
- **Azure App Service:** ~$13/month = $156/year

---

## Recommended Learning Path

### Phase 1: Foundation (Week 1)
1. ✅ Keep existing GitHub Pages deployment
2. ✅ Study how current CI/CD workflow works
3. ✅ Read GitHub Actions documentation
4. ✅ Understand the `.github/workflows/deploy.yml` file

### Phase 2: Local Experimentation (Week 2)
1. Set up self-hosted runner locally
2. Create dual deployment workflow
3. Test deployments to localhost
4. Learn troubleshooting techniques

### Phase 3: Network Configuration (Week 3)
1. Set up Dynamic DNS (DuckDNS)
2. Configure router port forwarding
3. Test external access
4. Set up basic monitoring

### Phase 4: Security Hardening (Week 4)
1. Configure Windows Firewall rules
2. Set up SSL/HTTPS with Let's Encrypt
3. Implement webhook signature validation
4. Create backup strategy

### Phase 5: Advanced Features (Ongoing)
1. Add health checks and monitoring
2. Implement rollback mechanism
3. Set up email notifications
4. Optimize build pipeline
5. Add testing before deployment

---

## Additional Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Self-Hosted Runners Guide](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

### Tools
- [http-server NPM Package](https://www.npmjs.com/package/http-server)
- [github-webhook-handler](https://www.npmjs.com/package/github-webhook-handler)
- [Certbot (Let's Encrypt Client)](https://certbot.eff.org/)
- [No-IP DDNS](https://www.noip.com/)
- [DuckDNS DDNS](https://www.duckdns.org/)

### Testing Tools
- [YouGetSignal Port Checker](https://www.yougetsignal.com/tools/open-ports/)
- [What's My IP](https://www.whatismyip.com/)
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- [Webhook.site (Test Webhooks)](https://webhook.site/)

---

## Next Steps

Choose your deployment strategy:

1. **For learning CI/CD concepts:** Option 1 (Self-Hosted Runner)
2. **For webhook/event-driven systems:** Option 2 (Webhook Deployment)
3. **For Git internals:** Option 3 (Git Hooks)
4. **For best of both worlds:** Option 4 (Dual Deployment)

**My recommendation:** Start with **Option 4 (Dual Deployment)** to:
- Keep production reliable
- Learn self-hosting safely
- Experience real-world multi-environment setup
- Build confidence before fully switching

---

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review deployment logs: `C:\WebServer\logs\deploy.log`
3. Check GitHub Actions logs: Repository → Actions tab
4. Test components individually (webhook, server, DNS)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-06
**Project:** News Search App
**Author:** BMad CI/CD Guide
