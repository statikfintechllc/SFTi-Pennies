# Issue Templates

**📁 Location:** `/.github/ISSUE_TEMPLATE`

## Overview

This directory contains issue templates for the SFTi-Pennies trading journal repository. These templates help contributors and users submit well-structured bug reports, feature requests, and integration proposals.

## Available Templates

### 1. Bug Report (`bug-report.md`)
Use this template when you encounter problems, errors, or unexpected behavior in the trading journal system.

**When to use:**
- Website not loading or displaying incorrectly
- Form submission failures
- GitHub Actions workflow errors
- Data processing issues
- Chart generation problems
- Authentication failures
- Mobile responsiveness issues

**What to include:**
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or error messages
- Browser/device information
- Relevant logs from GitHub Actions

### 2. Feature Request (`feature-request.md`)
Use this template to propose new features, enhancements, or improvements to the trading journal.

**When to use:**
- Suggesting new functionality
- Proposing UI/UX improvements
- Requesting new chart types or analytics
- Suggesting automation enhancements
- Proposing documentation improvements

**What to include:**
- Clear description of the proposed feature
- Use case and motivation
- Expected behavior
- Potential implementation approach
- Alternative solutions considered
- Additional context or mockups

### 3. IBKR Integration (`ibkr-integration.md`)
Use this template specifically for Interactive Brokers (IBKR) integration-related issues, features, or discussions.

**When to use:**
- Proposing IBKR API integration
- Discussing automated trade import
- Suggesting broker data synchronization
- Planning IBKR-specific features

**What to include:**
- Integration scope and objectives
- IBKR API endpoints involved
- Authentication requirements
- Data mapping considerations
- Security implications
- Implementation timeline

## How to Use

### Creating a New Issue

1. **Navigate to Issues Tab**
   - Go to the repository's Issues tab
   - Click "New Issue"

2. **Choose a Template**
   - GitHub will present available templates
   - Select the most appropriate one
   - Click "Get Started"

3. **Fill Out the Template**
   - Complete all required sections (marked with *)
   - Provide as much detail as possible
   - Add labels, assignees if you have permissions

4. **Submit**
   - Review your issue
   - Click "Submit new issue"

### Best Practices

#### For Bug Reports
✅ **DO:**
- Provide step-by-step reproduction instructions
- Include screenshots or error messages
- Specify browser and device information
- Check if the issue already exists
- Test on latest version before reporting

❌ **DON'T:**
- Report multiple unrelated bugs in one issue
- Skip reproduction steps
- Provide vague descriptions
- Include sensitive information (PATs, credentials)

#### For Feature Requests
✅ **DO:**
- Explain the use case and benefits
- Consider implementation complexity
- Suggest alternative solutions
- Link to related issues or discussions
- Be open to feedback and alternatives

❌ **DON'T:**
- Request breaking changes without justification
- Propose features that conflict with project goals
- Expect immediate implementation
- Duplicate existing feature requests

#### For IBKR Integration
✅ **DO:**
- Research IBKR API documentation first
- Consider security implications
- Propose phased implementation
- Discuss authentication strategy
- Consider rate limits and costs

❌ **DON'T:**
- Share IBKR credentials or API keys
- Propose unauthorized API usage
- Ignore IBKR's terms of service
- Expect real-time data without cost considerations

## Template Maintenance

### Updating Templates

When modifying templates:
1. Ensure all required fields are clearly marked
2. Provide helpful examples and guidance
3. Keep templates concise but comprehensive
4. Test templates before committing changes
5. Document template changes in commit messages

### Adding New Templates

To add a new issue template:
1. Create a new `.md` file in this directory
2. Follow GitHub's issue template syntax
3. Include clear instructions and sections
4. Update this README with the new template
5. Test the template in GitHub's issue creation flow

## Template Structure

Each template should include:

```yaml
---
name: Template Name
about: Brief description
title: '[PREFIX] '
labels: label1, label2
assignees: ''
---

## Description
Clear instructions...

## Required Information
- Field 1
- Field 2

## Additional Context
Optional information...
```

## Issue Labels

Common labels used with these templates:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `integration` - Third-party integrations
- `question` - Further information requested
- `help wanted` - Extra attention needed
- `good first issue` - Good for newcomers

## Support

### Getting Help

If you're unsure which template to use:
1. Check existing issues for similar problems
2. Review [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines
3. Ask in Discussions (if enabled)
4. Start with the most relevant template and modify as needed

### Issue Triage

Maintainers will:
1. Review new issues within 48-72 hours
2. Add appropriate labels
3. Request additional information if needed
4. Assign to milestones or projects
5. Close duplicates or invalid issues

## Related Documentation

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Code of Conduct](../CODE_OF_CONDUCT.md)
- [Pull Request Template](../PULL_REQUEST_TEMPLATE.md)
- [Security Policy](../SECURITY.md)

## Examples

### Good Bug Report
```
Title: [BUG] Form submission fails on mobile Safari
Description: Clear, detailed explanation...
Steps to reproduce: 1, 2, 3...
Expected: Form submits successfully
Actual: Error message appears
Screenshots: [attached]
Device: iPhone 14, iOS 17, Safari 17
```

### Good Feature Request
```
Title: [FEATURE] Add profit factor chart
Description: Comprehensive explanation...
Use case: Track quality of wins vs losses...
Benefits: Better risk management insights...
Implementation: Could use Chart.js...
Alternatives: Consider Sharpe ratio instead...
```

---

**Last Updated:** October 2025  
**Template Count:** 3  
**Purpose:** Standardized issue reporting
