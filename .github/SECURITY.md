# Security Policy

## Supported Versions

We support the current stable version and actively maintained development branches.

| Version | Supported          |
| ------- | ------------------ |
| latest  | ✅                 |
| dev     | ⚠️ Use with caution |
| < 1.0   | ❌                |

## Reporting Vulnerabilities

Security is critical for financial applications. If you discover a security vulnerability in IB-G.Scanner:

### 🚨 For Critical Security Issues
- **DO NOT** create a public issue
- Email directly: **Ascend.Gremlin@gmail.com**
- Use subject line: "[SECURITY] IB-G.Scanner Vulnerability Report"
- Include detailed information about the vulnerability

### 📧 What to Include
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if you have one)
- Your contact information for follow-up

### ⏱️ Response Timeline
- **Initial response**: Within 72 hours
- **Vulnerability assessment**: Within 1 week
- **Fix timeline**: Depends on severity (critical issues prioritized)

### 🛡️ Security Considerations

This application handles sensitive financial data and IBKR connections:

- **IBKR Credentials**: Never commit API keys, account credentials, or connection details
- **Market Data**: Ensure proper handling of real-time financial data
- **Local Storage**: Be careful with sensitive data in browser storage
- **Network Security**: All IBKR communications should use secure protocols

### 🔒 Best Practices for Contributors

- Use environment variables for sensitive configuration
- Validate all user inputs, especially financial parameters
- Implement proper error handling that doesn't leak sensitive information
- Follow secure coding practices for financial applications
- Keep dependencies updated to avoid known vulnerabilities

### 📋 Common Security Areas

- Interactive Brokers API integration
- WebSocket connections and data handling
- User authentication and session management
- Financial data processing and display
- Client-side data storage and caching

### 🏆 Recognition

We appreciate security researchers who help keep IB-G.Scanner secure:
- Acknowledged contributors will be credited (with permission)
- Significant vulnerabilities may be eligible for recognition
- We believe in responsible disclosure and will work with you on timing

### 📞 Contact Information

For security-related questions or concerns:
- **Primary**: Ascend.Gremlin@gmail.com
- **Alternative**: Open a private issue if email is unavailable

Thank you for helping keep IB-G.Scanner and its users secure.