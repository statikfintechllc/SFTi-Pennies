# Pull Request Template

## Overview
Please provide a brief summary of the changes in this pull request.

- [ ] Bugfix  
- [ ] Feature  
- [ ] Code Refactor  
- [ ] Documentation Update  
- [ ] IBKR Integration Enhancement
- [ ] UI/UX Improvement
- [ ] Performance Optimization
- [ ] Other (describe below)

## Description
Explain the motivation and context behind this change. Include relevant issues, design decisions, or links to documentation.

## Related Issues
Closes #[issue-number]  
Depends on #[dependency-issue-number]

## Changes Made
- [ ] Frontend changes (React/TypeScript)
- [ ] Backend changes (Node.js services)
- [ ] IBKR integration updates
- [ ] Styling updates (Tailwind CSS)
- [ ] Configuration changes
- [ ] Documentation updates

## Testing Checklist
- [ ] Code builds successfully (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Development server starts (`npm run dev`)
- [ ] Application loads at http://localhost:5000
- [ ] Core functionality tested manually
- [ ] IBKR connection handling tested (if applicable)
- [ ] Demo mode functionality verified

## Screenshots / Evidence
> If your changes affect the UI, please provide screenshots or videos demonstrating the changes.

## IBKR Integration Impact
- [ ] No IBKR changes
- [ ] Enhanced IBKR connectivity
- [ ] New IBKR API features
- [ ] IBKR error handling improvements

## Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes (describe below)

If breaking changes, describe:
- What breaks
- Migration steps
- Backwards compatibility considerations

## Additional Notes
Any additional information for reviewers:
- Performance considerations
- Security implications
- Dependencies added/removed
- Configuration changes required

---

**Reviewer Checklist:**
- [ ] Code follows project standards
- [ ] Changes are well-documented
- [ ] No sensitive data exposed
- [ ] IBKR integration secure and reliable
- [ ] UI changes are responsive and accessible