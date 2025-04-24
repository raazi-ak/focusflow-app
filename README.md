# FocusFlow - Smart Task Planning

FocusFlow is an AI-powered task planning and productivity application built with Next.js. It helps users organize tasks, manage projects, and stay focused with features like AI planning, focus mode, and document analysis.

![FocusFlow Dashboard](public/placeholder.jpg)

## Features

- **AI-Powered Task Planning**: Generate structured task plans using Google's Gemini AI
- **Document Analysis**: Upload images or PDFs for OCR and AI analysis
- **Focus Mode**: Pomodoro timer with task tracking and statistics
- **Project Management**: Organize tasks into projects with progress tracking
- **Theme Customization**: Personalize the app with accent colors and theme settings
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/focusflow-app.git
cd focusflow-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

## Development

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm start

# Run linting
npm run lint
```

## Deployment on Vercel

### Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) (optional for local deployments)
3. Google Gemini API key for AI features

### Deployment Steps

1. **Using Vercel Dashboard**:
   - Connect your GitHub repository to Vercel
   - Configure environment variables (see below)
   - Deploy with default settings

2. **Using Vercel CLI**:
   ```bash
   # Login to Vercel
   vercel login

   # Deploy to development
   vercel

   # Deploy to production
   vercel --prod
   ```

3. **Using GitHub Actions** (CI/CD):
   - The repository includes a GitHub Actions workflow in `.github/workflows/ci.yml`
   - Set up the following secrets in your GitHub repository:
     - `VERCEL_TOKEN`: Your Vercel API token
     - `GEMINI_API_KEY`: Your Google Gemini API key

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `NEXT_PUBLIC_APP_URL` | URL of your application (e.g., https://your-app.vercel.app) | No |

## Monitoring with Grafana

FocusFlow includes a comprehensive monitoring setup using Prometheus and Grafana. This allows you to track application performance, user activity, and system health.

### Metrics Collected

- **HTTP Requests**: Count, duration, status codes
- **Task Activity**: Creation, completion rates
- **Focus Sessions**: Count, duration, completion
- **AI Usage**: Request count, response time
- **System Health**: Memory usage, CPU load

### Setup Options

#### Option 1: Grafana Cloud (Recommended)

1. Sign up for [Grafana Cloud](https://grafana.com/products/cloud/) (free tier available)
2. Create a new Prometheus data source
3. Import the dashboard from `docs/grafana-dashboard.json`
4. Configure your application to send metrics to Grafana Cloud:
   ```bash
   # Add these to your .env.local
   GRAFANA_CLOUD_API_KEY=your_api_key
   GRAFANA_CLOUD_URL=your_instance_url
   ```

#### Option 2: Self-hosted with Docker

1. Start the monitoring stack:
   ```bash
   docker-compose up -d
   ```

2. Access Grafana at `http://localhost:3001`
   - Default login: admin/admin
   - Prometheus is available at `http://localhost:9090`

3. Import the dashboard from `docs/grafana-dashboard.json`

### Viewing Metrics

1. Open Grafana (cloud or self-hosted)
2. Navigate to Dashboards → Import
3. Upload or paste the content of `docs/grafana-dashboard.json`
4. Select your Prometheus data source
5. Click Import

For more detailed instructions, see the [Deployment Guide](docs/deployment-guide.md).

## Continuous Deployment (CD)

FocusFlow includes a GitHub Actions workflow for continuous deployment:

1. **Automatic Deployments**:
   - Pushes to `main` branch trigger production deployments
   - Pull requests trigger preview deployments

2. **Setup Steps**:
   - Go to your GitHub repository → Settings → Secrets
   - Add the following secrets:
     - `VERCEL_TOKEN`: Your Vercel API token
     - `VERCEL_ORG_ID`: Your Vercel organization ID
     - `VERCEL_PROJECT_ID`: Your Vercel project ID

3. **Customizing the Workflow**:
   - Edit `.github/workflows/ci.yml` to customize the CI/CD pipeline
   - Add additional steps like testing, linting, or notifications

For detailed CD instructions, see the [Deployment Guide](docs/deployment-guide.md).

## Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: Radix UI, Framer Motion
- **State Management**: React Context API with localStorage persistence
- **AI Integration**: Google Gemini API
- **OCR**: Tesseract.js
- **Monitoring**: Prometheus, Grafana
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## License

MIT

---

Made with ❤️ by [Your Name]