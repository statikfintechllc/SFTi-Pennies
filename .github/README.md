# .github Directory

**📁 Location:** `/.github`

## Overview

This directory contains GitHub-specific configurations, automation scripts, documentation, and templates that power the SFTi-Pennies trading journal system. It houses the entire backend automation pipeline, including GitHub Actions workflows, Python processing scripts, and comprehensive documentation.

## Directory Structure

```
.github/
├── README.md                      # This file
├── CODE_OF_CONDUCT.md            # Community guidelines
├── CONTRIBUTING.md               # Contribution guidelines
├── FUNDING.yml                   # Sponsorship configuration
├── PULL_REQUEST_TEMPLATE.md      # PR template
├── SECURITY.md                   # Security policy
├── copilot-instructions.md       # AI assistant instructions
│
├── ISSUE_TEMPLATE/               # Issue templates
│   ├── bug-report.md
│   ├── feature-request.md
│   └── ibkr-integration.md
│
├── docs/                         # Comprehensive documentation
│   ├── README.md                # Documentation index
│   └── [various .md files]      # Technical documentation
│
├── scripts/                      # Automation scripts
│   ├── parse_trades.py          # Parse trade markdown to JSON
│   ├── generate_summaries.py   # Generate period summaries
│   ├── generate_charts.py      # Create visualizations
│   └── [other scripts]
│
├── templates/                    # Content templates
│   ├── trade.md.template        # Trade entry template
│   └── weekly-summary.md.template
│
└── workflows/                    # GitHub Actions workflows
    └── trade_pipeline.yml       # Main automation pipeline
```

## Quick Links

### Documentation
- [📚 Main Documentation Hub](./docs/README.md) - Start here for all documentation
- [🚀 Quick Start Guide](./docs/QUICKSTART.md) - Get started in 5 minutes
- [👨‍💻 Developer Guide](./docs/README-DEV.md) - Complete developer documentation
- [⚙️ Trade Pipeline](./docs/TRADE_PIPELINE.md) - How automation works

### Configuration
- [🤝 Contributing](./CONTRIBUTING.md) - How to contribute
- [🔒 Security Policy](./SECURITY.md) - Security guidelines
- [📋 Code of Conduct](./CODE_OF_CONDUCT.md) - Community standards

### Automation
- [📜 Scripts Directory](./scripts/README.md) - Automation scripts
- [⚙️ Workflows Directory](./workflows/README.md) - GitHub Actions
- [📝 Templates Directory](./templates/README.md) - Content templates

### Issues & PRs
- [🐛 Issue Templates](./ISSUE_TEMPLATE/README.md) - Report bugs or request features
- [📄 Pull Request Template](./PULL_REQUEST_TEMPLATE.md) - PR guidelines

## Key Components

### GitHub Actions Pipeline
The core automation system that processes trades, generates analytics, and deploys the site automatically when trades are submitted.

**Main Workflow:** [`workflows/trade_pipeline.yml`](./workflows/trade_pipeline.yml)

### Python Scripts
Seven automation scripts that handle data processing, analytics generation, and content management:

1. **parse_trades.py** - Extracts trade data from markdown files
2. **generate_summaries.py** - Creates weekly/monthly/yearly reports
3. **generate_charts.py** - Generates equity curves and visualizations
4. **generate_index.py** - Creates master trade index
5. **generate_books_index.py** - Indexes PDF library
6. **generate_notes_index.py** - Indexes trading notes
7. **optimize_images.sh** - Optimizes uploaded screenshots

See [scripts/README.md](./scripts/README.md) for detailed documentation.

### Documentation
Comprehensive technical documentation covering:
- System architecture
- API references
- Data structures
- Setup and deployment
- Troubleshooting guides

See [docs/README.md](./docs/README.md) for the documentation index.

## How It Works

### Automated Workflow

```
User submits trade via web form
    ↓
GitHub API creates markdown file in repository
    ↓
GitHub Actions workflow triggers automatically
    ↓
Python scripts process data
    ↓
Charts and summaries generated
    ↓
Site redeployed with updated content
    ↓
User sees new trade on homepage
```

### Processing Pipeline

1. **Trigger** - Push to `trades/` or `SFTi.Tradez/` directories
2. **Parse** - Extract YAML frontmatter and trade data
3. **Analyze** - Calculate statistics and performance metrics
4. **Generate** - Create summaries, charts, and indices
5. **Optimize** - Process and optimize images
6. **Deploy** - Build and deploy to GitHub Pages

See [docs/TRADE_PIPELINE.md](./docs/TRADE_PIPELINE.md) for detailed pipeline documentation.

## For Contributors

If you're contributing to this project:

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
2. Review [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community standards
3. Check [docs/README-DEV.md](./docs/README-DEV.md) for technical details
4. Use issue templates when reporting bugs or requesting features
5. Follow the PR template when submitting changes

## For Users

If you're using this trading journal:

1. Start with [docs/QUICKSTART.md](./docs/QUICKSTART.md)
2. Review [docs/README-DEV.md](./docs/README-DEV.md) for detailed usage
3. Check [SECURITY.md](./SECURITY.md) for security best practices
4. Use issue templates to report problems or suggest features

## Maintenance

### Regular Updates
- Keep Python dependencies updated (requirements implicit in scripts)
- Review and update documentation as features evolve
- Monitor GitHub Actions usage and optimize workflows
- Archive outdated debug documentation

### Security
- Never commit Personal Access Tokens (PATs)
- Review SECURITY.md for vulnerability reporting
- Keep dependencies updated for security patches
- Audit script permissions regularly

## Related Documentation

- [Root README](../README.md) - Project overview
- [Trading Journal Documentation](../index.directory/README.md) - Journal structure
- [Assets Documentation](../index.directory/assets/README.md) - Asset organization

---

**Last Updated:** October 2025  
**Maintainer:** statikfintechllc  
**Purpose:** GitHub automation and documentation hub
