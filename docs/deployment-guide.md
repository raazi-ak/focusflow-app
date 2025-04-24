# FocusFlow Deployment and Monitoring Guide

This guide provides detailed instructions for deploying FocusFlow to Vercel, setting up monitoring with Grafana, and implementing continuous deployment (CD) workflows.

## Table of Contents
- [Deploying to Vercel](#deploying-to-vercel)
- [Setting Up Monitoring with Grafana](#setting-up-monitoring-with-grafana)
- [Continuous Deployment (CD)](#continuous-deployment-cd)
- [Troubleshooting](#troubleshooting)

## Deploying to Vercel

### Prerequisites
- A [Vercel account](https://vercel.com/signup)
- The [Vercel CLI](https://vercel.com/docs/cli) installed (optional for CLI deployment)
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Method 1: Deploy via Vercel Dashboard

1. **Create a new project in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Import your Git repository (GitHub, GitLab, or Bitbucket)
   - If your repository is not listed, you may need to install the Vercel integration for your Git provider

2. **Configure project settings**
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run vercel-build
   - Output Directory: .next

3. **Set up environment variables**
   - Click on "Environment Variables"
   - Add the following variables:
     - `GEMINI_API_KEY`: Your Gemini API key
     - `NEXT_PUBLIC_APP_URL`: The URL of your deployed application (e.g., https://your-app.vercel.app)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Once deployed, you'll receive a URL for your application

### Method 2: Deploy via Vercel CLI

1. **Login to Vercel CLI**
   ```bash
   vercel login
   ```

2. **Deploy the application**
   ```bash
   # Navigate to your project directory
   cd path/to/focusflow-app

   # Deploy to Vercel
   vercel
   ```

3. **Set up environment variables**
   ```bash
   # Set environment variables
   vercel env add GEMINI_API_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   ```

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Method 3: Deploy via GitHub Actions (Recommended)

This method is covered in the [Continuous Deployment](#continuous-deployment-cd) section below.

## Setting Up Monitoring with Grafana

### Option 1: Grafana Cloud (Recommended for Quick Setup)

1. **Sign up for Grafana Cloud**
   - Go to [Grafana Cloud](https://grafana.com/products/cloud/)
   - Sign up for a free account
   - Create a new Grafana instance

2. **Set up Prometheus data source**
   - In your Grafana instance, go to Configuration > Data Sources
   - Click "Add data source"
   - Select "Prometheus"
   - Configure the URL to your Prometheus instance (Grafana Cloud provides one)
   - Click "Save & Test"

3. **Instrument your Next.js application**
   - Install required packages:
     ```bash
     npm install prom-client next-metrics
     ```

4. **Create a metrics API endpoint**
   - Create a new file at `app/api/metrics/route.ts`:
     ```typescript
     import { NextResponse } from 'next/server';
     import { register } from 'prom-client';
     import { collectDefaultMetrics } from 'prom-client';

     // Initialize default metrics
     collectDefaultMetrics({ register });

     // Create custom metrics
     const httpRequestCounter = new register.Counter({
       name: 'http_requests_total',
       help: 'Total number of HTTP requests',
       labelNames: ['method', 'route', 'status_code']
     });

     // Middleware to count HTTP requests
     export function middleware(req) {
       const method = req.method;
       const route = req.url.pathname;
       const statusCode = res.statusCode;
       
       httpRequestCounter.inc({ method, route, statusCode });
     }

     export async function GET() {
       return new NextResponse(await register.metrics(), {
         headers: {
           'Content-Type': register.contentType
         }
       });
     }
     ```

5. **Configure Grafana dashboards**
   - In Grafana, go to Dashboards > New Dashboard
   - Click "Add new panel"
   - Select your Prometheus data source
   - Create panels for:
     - HTTP request rate
     - Error rate
     - Response time
     - Memory usage
     - CPU usage

6. **Set up alerts**
   - In Grafana, go to Alerting > Alert Rules
   - Click "New alert rule"
   - Configure alerts for:
     - High error rate
     - Slow response time
     - High resource usage

### Option 2: Self-hosted Grafana with Docker

1. **Create a docker-compose.yml file**
   ```yaml
   version: '3'
   services:
     prometheus:
       image: prom/prometheus
       volumes:
         - ./prometheus.yml:/etc/prometheus/prometheus.yml
       ports:
         - "9090:9090"
       restart: always

     grafana:
       image: grafana/grafana
       depends_on:
         - prometheus
       ports:
         - "3001:3000"
       volumes:
         - grafana-storage:/var/lib/grafana
       restart: always

   volumes:
     grafana-storage:
   ```

2. **Create a prometheus.yml file**
   ```yaml
   global:
     scrape_interval: 15s

   scrape_configs:
     - job_name: 'focusflow'
       static_configs:
         - targets: ['your-app-url:3000']
       metrics_path: '/api/metrics'
   ```

3. **Start the monitoring stack**
   ```bash
   docker-compose up -d
   ```

4. **Access Grafana**
   - Open http://localhost:3001
   - Login with default credentials (admin/admin)
   - Follow steps 2-6 from Option 1 to set up dashboards and alerts

## Continuous Deployment (CD)

### Setting up GitHub Actions for CD

1. **Create Vercel deployment token**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Click "Create" to generate a new token
   - Copy the token value

2. **Add secrets to GitHub repository**
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `VERCEL_TOKEN`: Your Vercel deployment token
     - `VERCEL_ORG_ID`: Your Vercel organization ID (find in Vercel project settings)
     - `VERCEL_PROJECT_ID`: Your Vercel project ID (find in Vercel project settings)
     - `GEMINI_API_KEY`: Your Gemini API key

3. **Create or update GitHub Actions workflow**
   - The workflow file is already created at `.github/workflows/ci.yml`
   - Make sure it includes the following:

   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     lint:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run lint

     build:
       runs-on: ubuntu-latest
       needs: lint
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - name: Create .env.local
           run: |
             echo "GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}" > .env.local
             echo "NEXT_PUBLIC_APP_URL=https://focusflow-app.vercel.app" >> .env.local
         - run: npm run build
         - uses: actions/upload-artifact@v3
           with:
             name: build-output
             path: .next

     deploy:
       runs-on: ubuntu-latest
       needs: build
       if: github.event_name == 'push' && github.ref == 'refs/heads/main'
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - name: Install Vercel CLI
           run: npm install -g vercel
         - name: Pull Vercel Environment Information
           run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
         - name: Build Project Artifacts
           run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
         - name: Deploy Project Artifacts to Vercel
           run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
         - name: Notify Deployment
           run: |
             curl -X POST -H 'Content-type: application/json' --data '{"text":"🚀 New deployment of FocusFlow is live!"}' ${{ secrets.SLACK_WEBHOOK_URL || 'https://example.com' }}
   ```

4. **Commit and push the workflow file**
   - The workflow will run automatically on push to the main branch
   - For pull requests, it will run lint and build jobs but not deploy

### Setting up Vercel for GitHub Integration

1. **Connect Vercel to GitHub**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click on your profile picture > Settings > Git Integration
   - Connect your GitHub account if not already connected

2. **Configure GitHub integration**
   - Enable "GitHub Checks"
   - Enable "Auto-Expand Logs"
   - Enable "Comment on PRs"

3. **Set up branch protection rules in GitHub**
   - Go to your GitHub repository
   - Navigate to Settings > Branches > Branch protection rules
   - Click "Add rule"
   - Branch name pattern: `main`
   - Enable:
     - "Require status checks to pass before merging"
     - "Require branches to be up to date before merging"
   - Add status checks:
     - "lint"
     - "build"
   - Click "Create"

## Monitoring Deployments

### Setting up Deployment Notifications

1. **Slack notifications**
   - Create a Slack webhook URL in your Slack workspace
   - Add the webhook URL as a secret in GitHub: `SLACK_WEBHOOK_URL`
   - The GitHub Actions workflow will send notifications on successful deployments

2. **Email notifications**
   - In Vercel, go to Settings > Notifications
   - Add your email address
   - Select which events you want to be notified about

### Monitoring Deployment Performance

1. **Vercel Analytics**
   - In Vercel, go to your project > Analytics
   - View Web Vitals, API performance, and more

2. **Integrate with Grafana**
   - Add a Vercel data source to Grafana
   - Create dashboards for deployment metrics

## Troubleshooting

### Common Deployment Issues

1. **Build failures**
   - Check the build logs in Vercel or GitHub Actions
   - Ensure all environment variables are set correctly
   - Verify that the build command is correct

2. **API errors**
   - Check if the Gemini API key is set correctly
   - Verify that the API endpoints are accessible
   - Check for CORS issues

3. **Environment variable issues**
   - Ensure all required environment variables are set in Vercel
   - Check that the variables are being loaded correctly in the application

### Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Grafana Documentation](https://grafana.com/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FocusFlow GitHub Repository](https://github.com/yourusername/focusflow-app)