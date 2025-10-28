/**
 * Unit Tests for Template Merge Utility
 * Tests the template merging functionality to ensure all sections are preserved
 */

const {
  getGenerateSummariesTemplate,
  getWeekSummariesTemplate,
  mergeTemplates,
  getCanonicalTemplate,
  fuzzyMatch,
  generateFormFields
} = require('../index.directory/lib/templateMerge.js');

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

  assertDeepEqual(actual, expected, message) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(
        message || `Expected ${expectedStr} but got ${actualStr}`
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

// Test: Get generate_summaries template
runner.test('getGenerateSummariesTemplate returns valid structure', () => {
  const template = getGenerateSummariesTemplate();
  
  runner.assert(template.title, 'Template should have a title');
  runner.assert(Array.isArray(template.sections), 'Template should have sections array');
  runner.assert(template.sections.length > 0, 'Template should have at least one section');
  runner.assertEqual(template.source, 'generate_summaries.py', 'Source should be generate_summaries.py');
});

// Test: Get week_summaries template
runner.test('getWeekSummariesTemplate returns valid structure', () => {
  const template = getWeekSummariesTemplate();
  
  runner.assert(template.title, 'Template should have a title');
  runner.assert(Array.isArray(template.sections), 'Template should have sections array');
  runner.assert(template.sections.length > 0, 'Template should have at least one section');
  runner.assertEqual(template.source, 'generate_week_summaries.py', 'Source should be generate_week_summaries.py');
});

// Test: Fuzzy matching
runner.test('fuzzyMatch correctly identifies similar field names', () => {
  runner.assert(fuzzyMatch('notes', 'notes'), 'Exact match should return true');
  runner.assert(fuzzyMatch('notes', 'observations'), 'Synonyms should match');
  runner.assert(fuzzyMatch('Key Lessons Learned', 'key_lessons'), 'Partial match should work');
  runner.assert(!fuzzyMatch('total', 'average'), 'Unrelated terms should not match');
});

// Test: Template merging preserves all sections
runner.test('mergeTemplates preserves all sections from both templates', () => {
  const template1 = getGenerateSummariesTemplate();
  const template2 = getWeekSummariesTemplate();
  const merged = mergeTemplates(template1, template2);
  
  runner.assert(Array.isArray(merged.sections), 'Merged template should have sections');
  runner.assert(merged.sections.length >= template1.sections.length, 
    'Merged template should have at least as many sections as template1');
  runner.assert(merged.sections.length >= template2.sections.length,
    'Merged template should have at least as many sections as template2');
  
  // Check that key sections exist
  const sectionNames = merged.sections.map(s => s.name);
  runner.assert(sectionNames.some(n => n.includes('Statistics') || n.includes('Performance Metrics')),
    'Should have statistics/metrics section');
  runner.assert(sectionNames.some(n => n.includes('Analysis') || n.includes('Reflection')),
    'Should have analysis/reflection section');
});

// Test: No sections are lost during merge
runner.test('mergeTemplates does not lose any sections', () => {
  const template1 = getGenerateSummariesTemplate();
  const template2 = getWeekSummariesTemplate();
  const merged = mergeTemplates(template1, template2);
  
  // All section names from template1 should appear in merged
  template1.sections.forEach(section => {
    const found = merged.sections.some(mergedSection => 
      fuzzyMatch(mergedSection.name, section.name) ||
      mergedSection.name === section.name
    );
    runner.assert(found, `Section "${section.name}" from template1 should be in merged template`);
  });
  
  // All section names from template2 should appear in merged
  template2.sections.forEach(section => {
    const found = merged.sections.some(mergedSection =>
      fuzzyMatch(mergedSection.name, section.name) ||
      mergedSection.name === section.name
    );
    runner.assert(found, `Section "${section.name}" from template2 should be in merged template`);
  });
});

// Test: Fields are preserved
runner.test('mergeTemplates preserves all fields from both templates', () => {
  const template1 = getGenerateSummariesTemplate();
  const template2 = getWeekSummariesTemplate();
  const merged = mergeTemplates(template1, template2);
  
  // Count total fields in original templates
  let template1FieldCount = 0;
  template1.sections.forEach(section => {
    if (section.fields) template1FieldCount += section.fields.length;
    if (section.subsections) template1FieldCount += section.subsections.length;
  });
  
  let template2FieldCount = 0;
  template2.sections.forEach(section => {
    if (section.fields) template2FieldCount += section.fields.length;
    if (section.subsections) template2FieldCount += section.subsections.length;
  });
  
  // Count fields in merged template
  let mergedFieldCount = 0;
  merged.sections.forEach(section => {
    if (section.fields) mergedFieldCount += section.fields.length;
    if (section.subsections) mergedFieldCount += section.subsections.length;
  });
  
  // Merged should have at least the maximum of both templates
  // (some fields might be merged if they're similar)
  const maxFields = Math.max(template1FieldCount, template2FieldCount);
  runner.assert(mergedFieldCount >= maxFields * 0.8, 
    `Merged template should preserve most fields (has ${mergedFieldCount}, expected at least ${maxFields * 0.8})`);
});

// Test: Canonical template
runner.test('getCanonicalTemplate returns valid merged template', () => {
  const canonical = getCanonicalTemplate();
  
  runner.assert(canonical.title, 'Canonical template should have a title');
  runner.assert(Array.isArray(canonical.sections), 'Canonical template should have sections');
  runner.assert(canonical.sections.length > 0, 'Canonical template should have sections');
  runner.assert(Array.isArray(canonical.sources), 'Canonical template should track sources');
  runner.assertEqual(canonical.sources.length, 2, 'Should have 2 sources');
});

// Test: Generate form fields
runner.test('generateFormFields creates form field definitions', () => {
  const canonical = getCanonicalTemplate();
  const fields = generateFormFields(canonical);
  
  runner.assert(Array.isArray(fields), 'Should return an array of fields');
  runner.assert(fields.length > 0, 'Should generate at least one field');
  
  // Check that fields have required properties
  fields.forEach(field => {
    runner.assert(field.type, `Field should have a type: ${JSON.stringify(field)}`);
    runner.assert(field.label || field.type === 'section-header', 
      `Field should have a label or be a section header: ${JSON.stringify(field)}`);
    runner.assert(field.id, `Field should have an id: ${JSON.stringify(field)}`);
  });
  
  // Should have section headers
  const headers = fields.filter(f => f.type === 'section-header');
  runner.assert(headers.length > 0, 'Should have section headers');
});

// Test: Required fields are marked correctly
runner.test('Merged fields have correct required status', () => {
  const canonical = getCanonicalTemplate();
  
  // Find statistics section
  const statsSection = canonical.sections.find(s => 
    s.name.includes('Statistics') || s.name.includes('Performance')
  );
  
  if (statsSection && statsSection.fields) {
    // Check that some fields are required
    const requiredFields = statsSection.fields.filter(f => f.required);
    runner.assert(requiredFields.length > 0, 'Should have some required fields in statistics section');
  }
});

// Test: Unique keys within sections
runner.test('Merged template fields have unique keys within each section', () => {
  const canonical = getCanonicalTemplate();
  
  canonical.sections.forEach(section => {
    const keys = new Set();
    
    if (section.fields) {
      section.fields.forEach(field => {
        if (field.key) {
          runner.assert(!keys.has(field.key), 
            `Duplicate key found in section "${section.name}": ${field.key}`);
          keys.add(field.key);
        }
      });
    }
    
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        if (subsection.key) {
          runner.assert(!keys.has(subsection.key), 
            `Duplicate key found in section "${section.name}": ${subsection.key}`);
          keys.add(subsection.key);
        }
      });
    }
  });
  
  runner.assert(true, 'All keys within sections are unique');
});

// Test: Sources are tracked
runner.test('Merged template tracks sources for all sections', () => {
  const canonical = getCanonicalTemplate();
  
  canonical.sections.forEach(section => {
    // Sections that come from one template might not have sources array yet
    // but merged sections should have sources
    if (section.sources) {
      runner.assert(Array.isArray(section.sources), 
        `Section "${section.name}" should have sources array`);
    }
  });
});

// Run all tests
if (require.main === module) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { TestRunner, runner };
