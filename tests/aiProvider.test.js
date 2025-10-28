/**
 * Unit Tests for AI Provider
 * Tests the AI provider interface and mock implementation
 */

const {
  AIProvider,
  MockAIProvider,
  AIProviderFactory
} = require('../index.directory/lib/aiProvider.js');

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
      );
    }
  }

  async run() {
    console.log(`Running ${this.tests.length} tests...\n`);

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Total: ${this.tests.length}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`${'='.repeat(50)}\n`);

    return this.failed === 0;
  }
}

const runner = new TestRunner();

// Test: MockAIProvider can be instantiated
runner.test('MockAIProvider can be instantiated', () => {
  const provider = new MockAIProvider({ enabled: true });
  runner.assert(provider instanceof AIProvider, 'Should be instance of AIProvider');
  runner.assert(provider instanceof MockAIProvider, 'Should be instance of MockAIProvider');
  runner.assertEqual(provider.getName(), 'mock', 'Provider name should be "mock"');
});

// Test: MockAIProvider is always available
runner.test('MockAIProvider is always available', async () => {
  const provider = new MockAIProvider();
  const isAvailable = await provider.isAvailable();
  runner.assert(isAvailable, 'Mock provider should always be available');
});

// Test: Generate monthly summary
runner.test('MockAIProvider generates monthly summary', async () => {
  const provider = new MockAIProvider({ enabled: true, delay: 10 });
  
  const tradeFiles = [
    { ticker: 'AAPL', pnl_usd: 100, entry_date: '2025-10-15' },
    { ticker: 'GOOGL', pnl_usd: -50, entry_date: '2025-10-20' },
    { ticker: 'MSFT', pnl_usd: 200, entry_date: '2025-10-25' }
  ];
  
  const weeklySummaries = [
    'Week 42 summary...',
    'Week 43 summary...'
  ];
  
  const result = await provider.generateSummary({
    period: 'month',
    year: 2025,
    month: 10,
    tradeFiles,
    weeklySummaries,
    generationOptions: {
      includeAnalysis: true,
      includeRecommendations: true
    }
  });
  
  runner.assert(result.success, 'Should return success');
  runner.assert(result.draftContent, 'Should have draft content');
  runner.assert(result.metadata, 'Should have metadata');
  runner.assert(result.metadata.provider === 'mock', 'Metadata should have provider name');
  runner.assert(result.metadata.tradeCount === 3, 'Should track trade count');
  runner.assert(result.metadata.weekCount === 2, 'Should track week count');
  
  // Check that content includes key elements
  runner.assert(result.draftContent.includes('October 2025'), 'Should include month and year');
  runner.assert(result.draftContent.includes('Total Trades'), 'Should include statistics');
  runner.assert(result.draftContent.includes('Performance Analysis'), 'Should include analysis');
  runner.assert(result.draftContent.includes('Recommendations'), 'Should include recommendations');
});

// Test: Generate yearly summary
runner.test('MockAIProvider generates yearly summary', async () => {
  const provider = new MockAIProvider({ enabled: true, delay: 10 });
  
  const tradeFiles = [
    { ticker: 'AAPL', pnl_usd: 500, entry_date: '2025-05-15' },
    { ticker: 'GOOGL', pnl_usd: -200, entry_date: '2025-07-20' }
  ];
  
  const result = await provider.generateSummary({
    period: 'year',
    year: 2025,
    tradeFiles,
    weeklySummaries: [],
    generationOptions: {}
  });
  
  runner.assert(result.success, 'Should return success');
  runner.assert(result.draftContent, 'Should have draft content');
  runner.assert(result.draftContent.includes('2025'), 'Should include year');
  runner.assert(result.draftContent.includes('Yearly Summary'), 'Should be yearly summary');
});

// Test: Statistics calculation
runner.test('MockAIProvider calculates statistics correctly', () => {
  const provider = new MockAIProvider();
  
  const tradeFiles = [
    { pnl_usd: 100 },
    { pnl_usd: -50 },
    { pnl_usd: 200 },
    { pnl_usd: -30 },
    { pnl_usd: 150 }
  ];
  
  const stats = provider.calculateStats(tradeFiles, []);
  
  runner.assertEqual(stats.totalTrades, 5, 'Should count all trades');
  runner.assertEqual(stats.winners, 3, 'Should count winners');
  runner.assertEqual(stats.losers, 2, 'Should count losers');
  runner.assertEqual(parseFloat(stats.totalPnl), 370, 'Should calculate total P&L');
  runner.assertEqual(parseFloat(stats.avgPnl), 74, 'Should calculate average P&L');
  runner.assertEqual(parseFloat(stats.winRate), 60.0, 'Should calculate win rate');
});

// Test: Options affect output
runner.test('Generation options affect output', async () => {
  const provider = new MockAIProvider({ enabled: true, delay: 10 });
  
  const tradeFiles = [{ ticker: 'AAPL', pnl_usd: 100 }];
  
  // Generate with analysis and recommendations
  const resultWith = await provider.generateSummary({
    period: 'month',
    year: 2025,
    month: 10,
    tradeFiles,
    weeklySummaries: [],
    generationOptions: {
      includeAnalysis: true,
      includeRecommendations: true
    }
  });
  
  // Generate without analysis and recommendations
  const resultWithout = await provider.generateSummary({
    period: 'month',
    year: 2025,
    month: 10,
    tradeFiles,
    weeklySummaries: [],
    generationOptions: {
      includeAnalysis: false,
      includeRecommendations: false
    }
  });
  
  runner.assert(resultWith.draftContent.includes('Performance Analysis'), 
    'Should include analysis when requested');
  runner.assert(!resultWithout.draftContent.includes('Performance Analysis'),
    'Should not include analysis when not requested');
  runner.assert(resultWith.draftContent.includes('Recommendations'),
    'Should include recommendations when requested');
  runner.assert(!resultWithout.draftContent.includes('Recommendations'),
    'Should not include recommendations when not requested');
});

// Test: Factory creates correct provider
runner.test('AIProviderFactory creates mock provider', () => {
  const provider = AIProviderFactory.create('mock', { enabled: true });
  runner.assert(provider instanceof MockAIProvider, 'Should create MockAIProvider');
  runner.assertEqual(provider.getName(), 'mock', 'Provider should be mock');
});

// Test: Factory defaults to mock for unknown provider
runner.test('AIProviderFactory defaults to mock for unknown provider', () => {
  const provider = AIProviderFactory.create('unknown', { enabled: true });
  runner.assert(provider instanceof MockAIProvider, 'Should default to MockAIProvider');
});

// Test: Empty trade list handling
runner.test('MockAIProvider handles empty trade list', async () => {
  const provider = new MockAIProvider({ enabled: true, delay: 10 });
  
  const result = await provider.generateSummary({
    period: 'month',
    year: 2025,
    month: 10,
    tradeFiles: [],
    weeklySummaries: [],
    generationOptions: {}
  });
  
  runner.assert(result.success, 'Should handle empty trade list');
  runner.assert(result.draftContent, 'Should still generate content');
  runner.assert(result.draftContent.includes('0'), 'Should show zero trades');
});

// Test: Metadata includes timestamp
runner.test('Generated summary includes metadata with timestamp', async () => {
  const provider = new MockAIProvider({ enabled: true, delay: 10 });
  
  const result = await provider.generateSummary({
    period: 'month',
    year: 2025,
    month: 10,
    tradeFiles: [],
    weeklySummaries: [],
    generationOptions: {}
  });
  
  runner.assert(result.metadata.generatedAt, 'Should have generatedAt timestamp');
  runner.assert(new Date(result.metadata.generatedAt).getTime() > 0, 
    'Timestamp should be valid');
});

// Test: Confidence score is included
runner.test('Generated summary includes confidence score', async () => {
  const provider = new MockAIProvider({ enabled: true, delay: 10 });
  
  const result = await provider.generateSummary({
    period: 'month',
    year: 2025,
    month: 10,
    tradeFiles: [{ pnl_usd: 100 }],
    weeklySummaries: [],
    generationOptions: {}
  });
  
  runner.assert(result.metadata.score !== undefined, 'Should have confidence score');
  runner.assert(result.metadata.score >= 0 && result.metadata.score <= 1, 
    'Score should be between 0 and 1');
  runner.assert(result.draftContent.includes('Confidence Score'), 
    'Content should mention confidence score');
});

// Test: AI disclaimer is included
runner.test('Generated content includes AI disclaimer', async () => {
  const provider = new MockAIProvider({ enabled: true, delay: 10 });
  
  const result = await provider.generateSummary({
    period: 'month',
    year: 2025,
    month: 10,
    tradeFiles: [{ pnl_usd: 100 }],
    weeklySummaries: [],
    generationOptions: {}
  });
  
  runner.assert(result.draftContent.includes('AI-generated'), 
    'Should include AI-generated disclaimer');
  runner.assert(result.draftContent.includes('review and edit'), 
    'Should mention need for review');
});

// Run all tests
if (require.main === module) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runner };
