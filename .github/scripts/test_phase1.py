#!/usr/bin/env python3
"""
Integration Test Suite for Phase 1 Scaffolding

Tests all new components to ensure they work correctly.
"""

import json
import os
import sys
from pathlib import Path


def test_file_exists(filepath, description):
    """Test if a file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} NOT FOUND")
        return False


def test_json_valid(filepath, description):
    """Test if JSON file is valid"""
    try:
        with open(filepath, 'r') as f:
            json.load(f)
        print(f"✅ {description}: Valid JSON")
        return True
    except Exception as e:
        print(f"❌ {description}: Invalid JSON - {e}")
        return False


def test_python_script(filepath, description):
    """Test if Python script can be imported (basic syntax check)"""
    try:
        # Just check if it compiles
        with open(filepath, 'r') as f:
            code = f.read()
            compile(code, filepath, 'exec')
        print(f"✅ {description}: Valid Python syntax")
        return True
    except SyntaxError as e:
        print(f"❌ {description}: Syntax error - {e}")
        return False


def test_html_basic(filepath, description):
    """Basic HTML validation (check for required elements)"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        required = ['<!DOCTYPE html>', '<html', '<head>', '<body>', '</html>']
        missing = [r for r in required if r not in content]
        
        if not missing:
            print(f"✅ {description}: Valid HTML structure")
            return True
        else:
            print(f"❌ {description}: Missing {missing}")
            return False
    except Exception as e:
        print(f"❌ {description}: Error reading - {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 70)
    print("Phase 1 Scaffolding - Integration Tests")
    print("=" * 70)
    print()
    
    repo_root = Path(__file__).parent.parent.parent
    os.chdir(repo_root)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test HTML pages
    print("Testing HTML Pages...")
    print("-" * 70)
    
    html_files = [
        ('index.directory/analytics.html', 'Analytics page'),
        ('index.directory/import.html', 'Import page'),
        ('index.directory/trade.html', 'Trade detail page'),
    ]
    
    for filepath, desc in html_files:
        if test_file_exists(filepath, desc) and test_html_basic(filepath, desc):
            tests_passed += 2
        else:
            tests_failed += 2
    
    print()
    
    # Test JavaScript files
    print("Testing JavaScript Files...")
    print("-" * 70)
    
    js_files = [
        ('index.directory/assets/js/analytics.js', 'Analytics JS'),
        ('index.directory/assets/js/import.js', 'Import JS'),
    ]
    
    for filepath, desc in js_files:
        if test_file_exists(filepath, desc):
            tests_passed += 1
        else:
            tests_failed += 1
    
    print()
    
    # Test Python scripts
    print("Testing Python Scripts...")
    print("-" * 70)
    
    python_files = [
        ('.github/scripts/generate_analytics.py', 'Analytics generator'),
        ('.github/scripts/import_csv.py', 'CSV importer'),
    ]
    
    for filepath, desc in python_files:
        if test_file_exists(filepath, desc) and test_python_script(filepath, desc):
            tests_passed += 2
        else:
            tests_failed += 2
    
    print()
    
    # Test workflows
    print("Testing GitHub Workflows...")
    print("-" * 70)
    
    workflow_files = [
        ('.github/workflows/import_csv.yml', 'Import CSV workflow'),
        ('.github/workflows/nightly_analytics.yml', 'Nightly analytics workflow'),
    ]
    
    for filepath, desc in workflow_files:
        if test_file_exists(filepath, desc):
            tests_passed += 1
        else:
            tests_failed += 1
    
    print()
    
    # Test JSON files
    print("Testing JSON Files...")
    print("-" * 70)
    
    json_files = [
        ('index.directory/assets/analytics/metrics.json', 'Metrics JSON'),
        ('index.directory/assets/analytics/strategy-breakdown.json', 'Strategy breakdown JSON'),
        ('index.directory/assets/analytics/tag-breakdown.json', 'Tag breakdown JSON'),
        ('index.directory/trades-index.json', 'Trades index'),
    ]
    
    for filepath, desc in json_files:
        if test_file_exists(filepath, desc) and test_json_valid(filepath, desc):
            tests_passed += 2
        else:
            tests_failed += 2
    
    print()
    
    # Test documentation
    print("Testing Documentation...")
    print("-" * 70)
    
    doc_files = [
        ('.github/docs/ROADMAP.md', 'Roadmap'),
        ('.github/docs/MEDIA_SPEC.md', 'Media specification'),
        ('.github/docs/TRADES_INDEX_SCHEMA.md', 'Schema documentation'),
        ('.github/docs/PHASE1_SUMMARY.md', 'Phase 1 summary'),
    ]
    
    for filepath, desc in doc_files:
        if test_file_exists(filepath, desc):
            tests_passed += 1
        else:
            tests_failed += 1
    
    print()
    
    # Test directories
    print("Testing Directory Structure...")
    print("-" * 70)
    
    directories = [
        ('index.directory/assets/analytics', 'Analytics directory'),
        ('data/imports', 'Imports directory'),
        ('data/imports/archive', 'Archive directory'),
    ]
    
    for dirpath, desc in directories:
        if os.path.isdir(dirpath):
            print(f"✅ {desc}: {dirpath}")
            tests_passed += 1
        else:
            print(f"❌ {desc}: {dirpath} NOT FOUND")
            tests_failed += 1
    
    print()
    print("=" * 70)
    print(f"Test Results: {tests_passed} passed, {tests_failed} failed")
    print("=" * 70)
    
    if tests_failed == 0:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Please review the output above.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
