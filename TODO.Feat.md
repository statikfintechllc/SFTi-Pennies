# 📋 TODO Features & Improvements

This file contains all TODO items found throughout the repository, organized by category.

**Last Updated:** 2025-10-24  
**Total Items:** 43

---

## ✅ Recently Completed

### Trade Enhancement Features (PR: Add clickable trade links)
- ✅ **Clickable trade links in all-trades.html** - Trade rows now link to individual trade detail pages
- ✅ **Fixed image paths** - Images display correctly with proper relative paths (`../assets/`)
- ✅ **Notes extraction** - Trade notes extracted from markdown and displayed in HTML
- ✅ **Summary cards system** - Weekly, monthly, and yearly summaries with modal popups
- ✅ **Week modal JSON display** - Week modal shows trade data from trades-index.json
- ✅ **Navigation updates** - Changed "All Weeks" to "All Summaries" across all pages
- ✅ **Code quality improvements**:
  - Moved `import re` to top of parse_trades.py (PEP 8 compliance)
  - Improved notes validation logic (more robust, less coupled)
  - Enhanced regex pattern for flexible whitespace handling
  - Fixed title capitalization for summary modals

---

## 📚 Documentation (7 items)

### `.github/docs/IMPLEMENTATION.md`

- **Line 307**: The following features have been **scaffolded** with TODOs for full implementation
- **Line 365**: 🚧 Tagging System (TODO)
- **Line 454**: Scaffolded with TODOs 🚧

### `.github/docs/importing.md`

- **Line 237**: TODO: Support for partial position exits

### `.github/templates/README.md`

- **Line 132**: Example: `cp .github/templates/trade.md.template trades/trade-XXX.md`
- **Line 148**: Example: `git add trades/trade-XXX.md`
- **Line 149**: Example: `git commit -m "Add trade XXX"`

---

## 🔧 Scripts (32 items)

### CSV Import/Export

**`.github/scripts/export_csv.py`** (8 items)
- **Line 6**: TODO: Implement full CSV export with configurable fields
- **Line 33**: TODO: Implement full export with all fields
- **Line 40**: TODO: Make this configurable
- **Line 118**: TODO: Apply filters
- **Line 124**: TODO: Implement date filtering
- **Line 125**: Filter from date functionality
- **Line 128**: TODO: Implement date filtering
- **Line 129**: Filter to date functionality

**`.github/scripts/import_csv.py`** (1 item)
- **Line 13**: TODO: Implement full import workflow

### Broker Importers

**`.github/scripts/importers/webull.py`** (6 items)
- **Line 21**: TODO: Implement full Webull CSV parsing logic
- **Line 37**: TODO: Implement detection logic
- **Line 53**: TODO: Refine detection logic
- **Line 172**: TODO: Add Webull-specific validation rules
- **Line 176**: TODO: Add Webull-specific validation
- **Line 195**: TODO: Export for registration

**`.github/scripts/importers/robinhood.py`** (6 items)
- **Line 21**: TODO: Implement full Robinhood CSV parsing logic
- **Line 37**: TODO: Implement detection logic
- **Line 53**: TODO: Refine detection logic
- **Line 167**: TODO: Add Robinhood-specific validation rules
- **Line 171**: TODO: Add Robinhood-specific validation
- **Line 189**: TODO: Export for registration

**`.github/scripts/importers/schwab.py`** (3 items)
- **Line 201**: TODO: Add Schwab-specific validation rules
- **Line 205**: TODO: Add Schwab-specific validation
- **Line 222**: TODO: Export for registration

### Other Scripts

**`.github/scripts/generate_trade_pages.py`** (1 item)
- **Line 8**: TODO: Implement full trade page generation

**`.github/scripts/attach_media.py`** (2 items)
- **Line 12**: TODO: Implement full media reconciliation logic
- **Line 68**: TODO: Add more validation

**`.github/scripts/normalize_schema.py`** (3 items)
- **Line 9**: TODO: Implement full schema migration logic
- **Line 111**: TODO: Add more migration paths as needed
- **Line 136**: TODO: Implement comprehensive validation

**`.github/scripts/parse_trades.py`** (2 items)
- **Line 204**: Comment about new location format support
- **Line 213**: Comment about structure support

---

## ⚙️ Workflows (1 item)

### `.github/workflows/site-submit.yml`

- **Line 55**: TODO: Implement logic to bundle pending trade submissions

---

## 🎯 Implementation Priority

### 🔴 High Priority (Core Functionality)

1. **CSV Import/Export** (`.github/scripts/import_csv.py`, `.github/scripts/export_csv.py`)
   - Essential for data portability
   - Users need to import/export trade data
   - 9 TODO items total

2. **Broker-Specific Importers** (`.github/scripts/importers/`)
   - **Webull Parser**: 6 TODO items
   - **Robinhood Parser**: 6 TODO items  
   - **Schwab Parser**: 3 TODO items
   - Critical for automated trade import

3. **Trade Page Generation** (`.github/scripts/generate_trade_pages.py`)
   - Automate individual trade detail pages
   - Improve user experience

### 🟡 Medium Priority (Enhancements)

1. **Media Reconciliation** (`.github/scripts/attach_media.py`)
   - Better handling of trade screenshots
   - 2 TODO items

2. **Schema Migration** (`.github/scripts/normalize_schema.py`)
   - Support for schema evolution
   - 3 TODO items

3. **Site Submission Workflow** (`.github/workflows/site-submit.yml`)
   - Bundle pending submissions
   - 1 TODO item

### 🟢 Low Priority (Future Features)

1. **OAuth Authentication Mode**
   - Enhanced security option
   - Documented in QUICKSTART.md

2. **Advanced Tagging System**
   - Better trade categorization
   - Documented in IMPLEMENTATION.md

3. **Additional Validation Rules**
   - Broker-specific validations
   - Multiple items across importers

---

## 📊 Statistics

| Category | Count |
|----------|-------|
| Scripts | 32 |
| Documentation | 7 |
| Workflows | 1 |
| Other | 3 |
| **TOTAL** | **43** |

---

## 🚀 Getting Started

### To Implement a TODO Item:

1. **Choose an item** from the priority list above
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/implement-csv-export
   ```
3. **Find the file** and line number listed above
4. **Implement the feature** following the existing code patterns
5. **Test thoroughly** with the repository's test suite
6. **Update this file** to mark the TODO as complete
7. **Submit a pull request** with:
   - Clear description of changes
   - Reference to this TODO file
   - Any new tests added

### Example Workflow:

```bash
# 1. Create branch
git checkout -b feature/webull-importer

# 2. Edit the file
vim .github/scripts/importers/webull.py

# 3. Test your changes
python .github/scripts/importers/webull.py --test

# 4. Update TODO.Feat.md
# Mark item as complete or remove from list

# 5. Commit and push
git add .
git commit -m "Implement Webull CSV parser"
git push origin feature/webull-importer
```

---

## 📝 Notes

### Understanding TODO Markers

- **`TODO:`** - Placeholder for planned future implementation
- **`FIXME:`** - Known issue that needs attention (none currently in codebase)
- **`HACK:`** - Temporary solution needing refactoring (none currently in codebase)
- **`XXX:`** - Warning or important note (none currently in codebase)

### Code Quality

All TODO items represent:
- Planned features that were scaffolded
- Future enhancements identified during development
- Extensions to support additional brokers/formats

None represent bugs or critical issues - the current system is fully functional.

### Contributing Guidelines

When implementing TODO items:
1. Follow existing code style and patterns
2. Add tests for new functionality
3. Update documentation
4. Run CodeQL security checks
5. Ensure backward compatibility

---

## 🔗 Related Documentation

- [Developer Guide](.github/docs/README-DEV.md)
- [Implementation Details](.github/docs/IMPLEMENTATION.md)
- [Import Documentation](.github/docs/importing.md)

---

**Maintained by:** SFTi-Pennies Development Team  
**Repository:** https://github.com/statikfintechllc/SFTi-Pennies  
**Last Sync:** 2025-10-23
