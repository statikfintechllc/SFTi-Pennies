# Contributing to IB-G.Scanner

First off: thank you for being interested in contributing to this Interactive Brokers penny stock scanner project.

This is a professional financial technology application that integrates with Interactive Brokers TWS/Gateway to provide real-time stock scanning, AI-powered analysis, and comprehensive market insights.

## 🔧 Technical Requirements

- Node.js v20.19.4+ and npm 10.8.2+
- Familiarity with React 19, TypeScript, and Vite
- Understanding of financial markets and trading concepts is helpful
- Experience with Interactive Brokers API is a plus

## 🚀 Getting Started

### Setup
1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build the project: `npm run build`
5. Run linting: `npm run lint`

### Development Workflow
- The app runs on port 5000 (not the typical 5173)
- Backend services run on ports 3001 (HTTP) and 3002 (WebSocket)
- IBKR router service requires TWS/Gateway connection (expected to fail in development)

## 📝 How to Contribute

### Bug Reports
- Use the provided bug report template
- Include relevant logs, stack traces, or error messages
- Specify your environment (OS, Node version, IBKR setup)
- Be clear and concise about the issue

### Feature Requests
- Open an issue describing the feature and its benefits
- Explain how it relates to stock scanning or trading workflows
- Consider the impact on Interactive Brokers integration

### Code Contributions

1. **Fork the repo**
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Write clean code** following the existing patterns
4. **Test thoroughly** - verify UI loads and functionality works
5. **Submit a PR** using the provided template

### Code Style Guide

- **TypeScript**: Follow existing patterns, minimize `any` types
- **React**: Use functional components with hooks
- **CSS**: Use Tailwind CSS classes
- **Formatting**: Run `npm run lint` before submitting
- **Comments**: Add them for complex financial calculations or IBKR integrations

### Testing Guidelines

Since this project doesn't have automated tests:
- **Always test manually** after changes
- **Verify the development server loads**: http://localhost:5000
- **Check core functionality**: scanner tables, market insights, IBKR connection status
- **Test with and without IBKR connection** (demo mode)

## 🏗️ Project Structure

```
/
├── src/                     # React TypeScript source
│   ├── components/          # UI components
│   ├── lib/                # Core logic (IBKR, alerts, AI)
│   ├── types/              # TypeScript definitions
│   └── App.tsx             # Main application
├── scripts/                # Backend services
├── .github/                # Community standards & workflows
└── dist/                   # Built application
```

## 🔌 IBKR Integration Notes

- Router service connects to TWS/Gateway on port 7497
- Connection failures are normal in development
- Demo mode allows frontend development without IBKR
- See `.github/copilot-instructions.md` for detailed architecture

## 🐛 Debugging Tips

- Check browser console for React/JavaScript errors
- Verify ports: Dev (5000), Server (3001), Preview (4173)
- IBKR connection expected to fail without TWS/Gateway
- Build errors usually indicate TypeScript issues

## 📋 Pull Request Process

1. Use the PR template provided
2. Ensure your code builds: `npm run build`
3. Run linting: `npm run lint` (warnings are okay, errors should be fixed)
4. Test manually in browser
5. Update documentation if needed
6. Link related issues in your PR description

## 🎯 Areas Where Help is Needed

- Enhanced stock scanning algorithms
- Additional chart indicators and patterns
- Improved AI analysis features
- Better error handling for IBKR disconnections
- Performance optimizations
- Documentation improvements

## 📞 Getting Help

- Open an issue for questions
- Check existing issues and PRs
- Review the README.md and copilot instructions
- Contact maintainers: Ascend.Gremlin@gmail.com

## 🚫 What NOT to Do

- Don't modify `.cjs` files to ES modules (they need CommonJS)
- Don't remove demo mode functionality
- Don't add test frameworks without discussion
- Don't break the existing IBKR integration patterns

Remember: This is financial software. Accuracy and reliability are paramount.

Thank you for contributing to IB-G.Scanner!