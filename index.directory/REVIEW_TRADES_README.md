# Review Trades Workflow Documentation

## Overview

The Review Trades workflow provides a comprehensive interface for reviewing and managing trading summaries with AI-assisted generation capabilities. This feature allows traders to:

1. Review weekly trade data and create weekly summaries
2. Generate AI-assisted monthly summaries
3. Generate AI-assisted yearly summaries
4. Save drafts before publishing
5. Maintain version history of published summaries

## Features

### 1. Navigation

A new "Review Trades" link has been added to the Trading dropdown menu in the global navigation.

Access the review page at: `/index.directory/review.html`

### 2. Weekly Summary Review

The weekly summary tab allows you to:

- Select a week from the dropdown
- View all trade files for that week
- Select/deselect specific trades to include in the summary
- Edit auto-generated statistics
- Add manual analysis (What Went Well, What Needs Improvement, Key Lessons)
- Preview the markdown output in real-time
- Save drafts for later editing
- Publish the final weekly summary

#### Merged Template

The weekly summary form uses a merged template that combines fields from both existing weekly summary generators:
- `generate_summaries.py` template
- `generate_week_summaries.py` template

All fields from both templates are preserved and presented in a unified form.

### 3. Monthly Summary (AI-Assisted)

Generate monthly summaries with AI assistance:

1. Select year and month
2. Review and accept AI consent notice
3. Configure AI options:
   - Include performance analysis
   - Include recommendations
4. Click "Generate Monthly Draft"
5. Review the AI-generated draft
6. Edit if needed
7. Publish when ready

#### AI Options

- **Include Performance Analysis**: Adds AI-generated insights about trading performance
- **Include Recommendations**: Adds AI-generated recommendations for improvement

### 4. Yearly Summary (AI-Assisted)

Similar to monthly summaries but for the entire year:

1. Select year
2. Accept AI consent notice
3. Configure AI options
4. Generate, review, and publish

## Technical Architecture

### Frontend

- **review.html**: Main UI page with three tabs (Weekly, Monthly, Yearly)
- **review-trades.js**: JavaScript handling UI interactions and API calls
- **templateMerge.js**: Template merging logic

### Backend

- **server.js**: Express server providing REST API
- **aiProvider.js**: AI provider interface and implementations

### API Endpoints

#### GET /api/weeks
Lists all available weeks with trade data.

**Response:**
```json
{
  "success": true,
  "weeks": [
    {
      "id": "2025.43",
      "name": "week.2025.43",
      "year": 2025,
      "week": 43,
      "path": "week.2025.43"
    }
  ]
}
```

#### GET /api/trades/:week
Get all trade files for a specific week.

**Response:**
```json
{
  "success": true,
  "week": "2025.43",
  "trades": [
    {
      "fileName": "10:23:2025.1.md",
      "path": "week.2025.43/10:23:2025.1.md",
      "frontmatter": { ... },
      "body": "..."
    }
  ],
  "masterSummary": "..."
}
```

#### POST /api/summaries/draft
Save a draft summary.

**Request:**
```json
{
  "period": "weekly",
  "year": 2025,
  "week": 43,
  "content": "# Week 43 Summary\n..."
}
```

#### POST /api/summaries/publish
Publish a summary (moves draft to published, archives old version).

**Request:**
```json
{
  "fileName": "weekly-2025-W43.md",
  "content": "# Week 43 Summary\n..."
}
```

#### POST /api/summaries/generate
Generate an AI-assisted summary.

**Request:**
```json
{
  "period": "month",
  "year": 2025,
  "month": 10,
  "includeTrades": [],
  "includeWeeklies": [],
  "options": {
    "includeAnalysis": true,
    "includeRecommendations": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "draftContent": "# October 2025 Monthly Summary\n...",
  "fileName": "monthly-2025-10.draft.md",
  "metadata": {
    "provider": "mock",
    "generatedAt": "2025-10-28T...",
    "tradeCount": 5,
    "weekCount": 4,
    "score": 0.85
  }
}
```

## AI Provider Configuration

### Environment Variables

- `ENABLE_AI`: Set to `'true'` to enable AI features (default: `false`)
- `AI_PROVIDER`: Provider to use (`'mock'` or `'openai'`, default: `'mock'`)
- `OPENAI_API_KEY`: Your OpenAI API key (required for OpenAI provider)
- `AI_MODEL`: OpenAI model to use (default: `'gpt-4'`)
- `AI_MAX_TOKENS`: Maximum tokens for generation (default: `2000`)

### Mock Provider

The mock provider is available by default for testing and development. It generates deterministic summaries without requiring external API calls.

Usage:
```javascript
const { MockAIProvider } = require('./lib/aiProvider.js');
const provider = new MockAIProvider({ enabled: true });
```

### OpenAI Provider

To use the OpenAI provider:

1. Set environment variables:
```bash
export ENABLE_AI=true
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...
```

2. The provider will automatically be used when generating summaries

### Custom Providers

You can create custom providers by extending the `AIProvider` base class:

```javascript
class CustomAIProvider extends AIProvider {
  async generateSummary(options) {
    // Your implementation
  }
  
  async isAvailable() {
    // Check if provider is configured
  }
  
  getName() {
    return 'custom';
  }
}
```

## Privacy & Consent

### AI Data Usage

When using AI-assisted summary generation:

1. **Explicit Consent Required**: Users must explicitly consent to AI analysis by checking the consent box before generating summaries
2. **Data Sent to AI**: Only selected trade data and weekly summaries are sent to the AI provider
3. **No Automatic Publishing**: All AI-generated content is saved as a draft requiring manual review and approval
4. **Local Control**: Users can edit AI-generated drafts before publishing

### What Data is Shared

When generating AI summaries, the following data is sent to the AI provider:

- Trade frontmatter (ticker, dates, P&L, strategy tags, etc.)
- Weekly summary texts (if selected)
- No personal identifying information
- No account numbers or broker details

## File Storage

### Draft Files

Drafts are saved with `.draft.md` extension:
- `weekly-2025-W43.draft.md`
- `monthly-2025-10.draft.md`
- `yearly-2025.draft.md`

### Published Files

Published files use canonical naming:
- `weekly-2025-W43.md`
- `monthly-2025-10.md`
- `yearly-2025.md`

### Version History

When publishing over an existing file, the old version is moved to `summaries/history/`:
- `summaries/history/monthly-2025-10.2025-10-28T12-34-56-789Z.md`

## Running the Server

### Development

1. Install dependencies:
```bash
cd index.directory/server
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

### Production

For production deployment, consider:

1. Using a process manager like PM2
2. Setting up proper environment variables
3. Configuring CORS for your domain
4. Using HTTPS
5. Setting up rate limiting

## Testing

### Unit Tests

Run unit tests for template merging:
```bash
node tests/templateMerge.test.js
```

Run unit tests for AI provider:
```bash
node tests/aiProvider.test.js
```

### Integration Tests

To test the full workflow:

1. Start the server: `npm start` in `index.directory/server`
2. Open `index.directory/review.html` in a browser
3. Test each tab:
   - Select a week and generate a weekly summary
   - Generate a monthly summary with AI
   - Generate a yearly summary with AI

## Troubleshooting

### Server Not Starting

- Check that port 3001 is not in use
- Ensure Node.js is installed (v14+ recommended)
- Verify all dependencies are installed

### API Connection Failed

- Ensure the server is running
- Check the API_BASE URL in `review-trades.js`
- Verify CORS settings allow your origin

### AI Generation Not Working

- Check that AI consent checkbox is checked
- Verify `ENABLE_AI` environment variable is set
- For OpenAI provider, ensure API key is valid
- Check server logs for error messages

### Drafts Not Saving

- Verify write permissions on `summaries/` directory
- Check server logs for file system errors
- Ensure disk space is available

## Backwards Compatibility

The Review Trades workflow is fully backwards compatible:

1. **Existing parsers unchanged**: All existing trade parsing scripts continue to work
2. **Existing summaries preserved**: Published summaries are never overwritten without explicit user action
3. **Existing templates respected**: The merged template includes all fields from both existing templates
4. **Optional feature**: The review workflow is optional; existing workflows continue to function

## Future Enhancements

Potential improvements for future releases:

1. **Trade selection for AI**: Allow users to select specific trades to include/exclude from AI analysis
2. **Weekly selection for AI**: Allow users to select which weekly summaries to include in monthly/yearly generation
3. **Custom AI prompts**: Allow users to provide custom instructions to the AI
4. **Multiple drafts**: Support saving multiple draft versions
5. **Draft comparison**: Visual diff between draft versions
6. **Bulk operations**: Generate multiple summaries at once
7. **Export options**: Export summaries in different formats (PDF, CSV, etc.)
8. **Analytics integration**: Link summaries with analytics dashboard

## Support

For issues, questions, or feature requests:

1. Check this documentation first
2. Review the troubleshooting section
3. Check server and browser console logs
4. Open an issue on the GitHub repository

## License

Same license as the main SFTi-Pennies repository (MIT).
