/**
 * Template Merge Utility
 * Merges two weekly summary templates into a canonical unified schema
 */

/**
 * Analyzes the generate_summaries.py template structure
 * @returns {Object} Template schema from generate_summaries.py
 */
function getGenerateSummariesTemplate() {
  return {
    title: 'Week {week} Summary',
    sections: [
      {
        name: 'Statistics',
        fields: [
          { name: 'Total Trades', key: 'total_trades', type: 'number', required: true },
          { name: 'Winning Trades', key: 'winning_trades', type: 'number', required: true },
          { name: 'Losing Trades', key: 'losing_trades', type: 'number', required: true },
          { name: 'Win Rate', key: 'win_rate', type: 'percentage', required: true },
          { name: 'Total P&L', key: 'total_pnl', type: 'currency', required: true },
          { name: 'Average P&L per Trade', key: 'avg_pnl', type: 'currency', required: true },
          { name: 'Best Trade', key: 'best_trade', type: 'string', required: true },
          { name: 'Worst Trade', key: 'worst_trade', type: 'string', required: true },
          { name: 'Total Volume Traded', key: 'total_volume', type: 'shares', required: true }
        ]
      },
      {
        name: 'Performance Analysis',
        subsections: [
          { name: 'What Went Well', key: 'what_went_well', type: 'text', required: false },
          { name: 'What Needs Improvement', key: 'what_needs_improvement', type: 'text', required: false },
          { name: 'Key Lessons Learned', key: 'key_lessons', type: 'text', required: false }
        ]
      },
      {
        name: 'Strategy Breakdown',
        key: 'strategy_breakdown',
        type: 'list',
        required: true
      },
      {
        name: 'Next Period Goals',
        key: 'goals',
        type: 'list',
        required: false
      }
    ],
    source: 'generate_summaries.py'
  };
}

/**
 * Analyzes the generate_week_summaries.py template structure
 * @returns {Object} Template schema from generate_week_summaries.py
 */
function getWeekSummariesTemplate() {
  return {
    title: 'Week {week}, {year} - Trading Summary',
    sections: [
      {
        name: 'Overview',
        key: 'overview',
        type: 'text',
        required: false
      },
      {
        name: 'Performance Metrics',
        fields: [
          { name: 'Total Trades', key: 'total_trades', type: 'number', required: true },
          { name: 'Total P&L', key: 'total_pnl', type: 'currency', required: true },
          { name: 'Win Rate', key: 'win_rate', type: 'percentage', required: true },
          { name: 'Wins', key: 'wins', type: 'number', required: true },
          { name: 'Losses', key: 'losses', type: 'number', required: true },
          { name: 'Breakeven', key: 'breakeven', type: 'number', required: true },
          { name: 'Average Win', key: 'avg_win', type: 'currency', required: true },
          { name: 'Average Loss', key: 'avg_loss', type: 'currency', required: true },
          { name: 'Largest Win', key: 'largest_win', type: 'currency', required: true },
          { name: 'Largest Loss', key: 'largest_loss', type: 'currency', required: true },
          { name: 'Profit Factor', key: 'profit_factor', type: 'number', required: true },
          { name: 'Gross Profit', key: 'gross_profit', type: 'currency', required: true },
          { name: 'Gross Loss', key: 'gross_loss', type: 'currency', required: true }
        ]
      },
      {
        name: 'Trade List',
        key: 'trade_list',
        type: 'array',
        required: true
      },
      {
        name: 'Weekly Reflection',
        key: 'weekly_reflection',
        type: 'text',
        required: false
      }
    ],
    source: 'generate_week_summaries.py'
  };
}

/**
 * Fuzzy match two field names to check similarity
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {boolean} True if names are similar
 */
function fuzzyMatch(name1, name2) {
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  // Exact match
  if (n1 === n2) return true;
  
  // Check if one contains the other
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Check common variations
  const synonyms = {
    'notes': ['observations', 'comments', 'remarks'],
    'observations': ['notes', 'comments', 'remarks'],
    'reflection': ['notes', 'thoughts', 'observations'],
    'goals': ['objectives', 'targets'],
    'lessons': ['learnings', 'takeaways']
  };
  
  for (const [key, values] of Object.entries(synonyms)) {
    if (n1.includes(key) && values.some(v => n2.includes(v))) return true;
    if (n2.includes(key) && values.some(v => n1.includes(v))) return true;
  }
  
  return false;
}

/**
 * Merge two field definitions
 * @param {Object} field1 - First field
 * @param {Object} field2 - Second field
 * @returns {Object} Merged field
 */
function mergeFields(field1, field2) {
  // Preserve the primary key from field1
  const merged = {
    name: field1.name,
    key: field1.key, // Use field1's key as primary
    type: field1.type || field2.type,
    required: field1.required && field2.required, // Only required if both require it
    sources: [field1.source || 'template1', field2.source || 'template2']
  };
  
  // Add alternate names/keys only if they're different
  if (field2.name !== field1.name) {
    merged.alternateNames = [field2.name];
  }
  if (field2.key && field2.key !== field1.key) {
    merged.alternateKeys = [field2.key];
  }
  
  return merged;
}

/**
 * Merge two templates into a canonical unified schema
 * @param {Object} template1 - First template
 * @param {Object} template2 - Second template
 * @returns {Object} Merged template schema
 */
function mergeTemplates(template1, template2) {
  const merged = {
    title: 'Week {week}, {year} - Trading Summary',
    sections: [],
    sources: [template1.source, template2.source],
    conflicts: []
  };

  // Create a map of sections by name
  const sectionMap = new Map();
  
  // Process first template sections
  template1.sections.forEach(section => {
    sectionMap.set(section.name, { ...section, source: template1.source });
  });

  // Process second template sections
  template2.sections.forEach(section => {
    const existing = Array.from(sectionMap.keys()).find(key => 
      fuzzyMatch(key, section.name)
    );

    if (existing) {
      // Merge sections with similar names
      const existingSection = sectionMap.get(existing);
      const mergedSection = {
        name: existing,
        alternateName: section.name !== existing ? section.name : undefined,
        sources: [existingSection.source, template2.source]
      };

      // Merge fields if both have them
      if (existingSection.fields && section.fields) {
        mergedSection.fields = mergeSectionFields(existingSection.fields, section.fields);
      } else if (existingSection.fields) {
        mergedSection.fields = existingSection.fields;
      } else if (section.fields) {
        mergedSection.fields = section.fields;
      }

      // Merge subsections if both have them
      if (existingSection.subsections && section.subsections) {
        mergedSection.subsections = mergeSectionFields(existingSection.subsections, section.subsections);
      } else if (existingSection.subsections) {
        mergedSection.subsections = existingSection.subsections;
      } else if (section.subsections) {
        mergedSection.subsections = section.subsections;
      }

      // Keep other properties
      if (section.key || existingSection.key) {
        mergedSection.key = existingSection.key || section.key;
      }
      if (section.type || existingSection.type) {
        mergedSection.type = existingSection.type || section.type;
      }
      if (section.required !== undefined || existingSection.required !== undefined) {
        mergedSection.required = existingSection.required || section.required;
      }

      sectionMap.set(existing, mergedSection);
    } else {
      // Add unique section
      sectionMap.set(section.name, { ...section, source: template2.source, required: false });
    }
  });

  // Convert map to array
  merged.sections = Array.from(sectionMap.values());

  return merged;
}

/**
 * Merge fields from two sections
 * @param {Array} fields1 - First field list
 * @param {Array} fields2 - Second field list
 * @returns {Array} Merged field list
 */
function mergeSectionFields(fields1, fields2) {
  const fieldMap = new Map();
  
  // Add fields from first list
  fields1.forEach(field => {
    fieldMap.set(field.key || field.name, field);
  });

  // Merge or add fields from second list
  fields2.forEach(field => {
    const existing = Array.from(fieldMap.keys()).find(key => {
      const existingField = fieldMap.get(key);
      return fuzzyMatch(existingField.name, field.name) || 
             (existingField.key && field.key && existingField.key === field.key);
    });

    if (existing) {
      const existingField = fieldMap.get(existing);
      const mergedField = mergeFields(existingField, field);
      fieldMap.set(existing, mergedField);
    } else {
      fieldMap.set(field.key || field.name, { ...field, required: false });
    }
  });

  return Array.from(fieldMap.values());
}

/**
 * Get the canonical merged template schema
 * @returns {Object} Merged template schema
 */
function getCanonicalTemplate() {
  const template1 = getGenerateSummariesTemplate();
  const template2 = getWeekSummariesTemplate();
  return mergeTemplates(template1, template2);
}

/**
 * Generate form fields from merged template
 * @param {Object} template - Merged template
 * @returns {Array} Form field definitions
 */
function generateFormFields(template) {
  const fields = [];
  
  template.sections.forEach((section, sectionIndex) => {
    // Add section header
    fields.push({
      type: 'section-header',
      label: section.name,
      id: `section-${sectionIndex}`
    });

    // Add section fields
    if (section.fields) {
      section.fields.forEach((field, fieldIndex) => {
        fields.push({
          type: getInputType(field.type),
          label: field.name,
          id: `${section.name}-${field.key || field.name}`.replace(/\s+/g, '-').toLowerCase(),
          key: field.key,
          required: field.required || false,
          placeholder: getPlaceholder(field)
        });
      });
    }

    // Add subsection fields
    if (section.subsections) {
      section.subsections.forEach((subsection, subIndex) => {
        fields.push({
          type: 'textarea',
          label: subsection.name,
          id: `${section.name}-${subsection.key || subsection.name}`.replace(/\s+/g, '-').toLowerCase(),
          key: subsection.key,
          required: subsection.required || false,
          rows: 4,
          placeholder: `Enter ${subsection.name.toLowerCase()}...`
        });
      });
    }

    // Handle special field types
    if (section.type === 'text') {
      fields.push({
        type: 'textarea',
        label: section.name,
        id: `${section.name}-${section.key}`.replace(/\s+/g, '-').toLowerCase(),
        key: section.key,
        required: section.required || false,
        rows: 4,
        placeholder: `Enter ${section.name.toLowerCase()}...`
      });
    }

    if (section.type === 'list') {
      fields.push({
        type: 'dynamic-list',
        label: section.name,
        id: `${section.name}-${section.key}`.replace(/\s+/g, '-').toLowerCase(),
        key: section.key,
        required: section.required || false
      });
    }
  });

  return fields;
}

/**
 * Get input type for a field type
 * @param {string} fieldType - Field type
 * @returns {string} HTML input type
 */
function getInputType(fieldType) {
  const typeMap = {
    'number': 'number',
    'currency': 'number',
    'percentage': 'number',
    'shares': 'number',
    'text': 'textarea',
    'string': 'text',
    'list': 'dynamic-list',
    'array': 'dynamic-list'
  };
  return typeMap[fieldType] || 'text';
}

/**
 * Get placeholder text for a field
 * @param {Object} field - Field definition
 * @returns {string} Placeholder text
 */
function getPlaceholder(field) {
  if (field.type === 'currency') return '0.00';
  if (field.type === 'percentage') return '0.0';
  if (field.type === 'number' || field.type === 'shares') return '0';
  return `Enter ${field.name.toLowerCase()}...`;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getGenerateSummariesTemplate,
    getWeekSummariesTemplate,
    mergeTemplates,
    getCanonicalTemplate,
    generateFormFields,
    fuzzyMatch
  };
}
