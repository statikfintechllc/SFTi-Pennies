#!/usr/bin/env python3
"""
Attach Media Script
Validates and reconciles media file references in trade metadata

This script:
1. Scans index.directory/assets/trade-images/ for images
2. Validates that trade metadata references are correct
3. Updates trade markdown frontmatter with image paths
4. Reports orphaned images (not linked to any trade)

TODO: Implement full media reconciliation logic
"""

import os
import json
import glob
from pathlib import Path


def scan_trade_images():
    """
    Scan for trade images in assets/trade-images/
    
    Returns:
        dict: {trade_id: [image_paths]}
    """
    images_dir = Path('index.directory/assets/trade-images')
    
    if not images_dir.exists():
        print(f"Images directory not found: {images_dir}")
        return {}
    
    trade_images = {}
    
    # Scan subdirectories (organized by trade_id)
    for trade_dir in images_dir.iterdir():
        if not trade_dir.is_dir():
            continue
        
        trade_id = trade_dir.name
        images = []
        
        # Find all image files
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp']:
            images.extend(glob.glob(str(trade_dir / ext)))
        
        if images:
            trade_images[trade_id] = sorted(images)
    
    return trade_images


def validate_image_references(trade, image_path):
    """
    Validate that an image file exists and is accessible
    
    Args:
        trade (dict): Trade dictionary
        image_path (str): Path to image
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not os.path.exists(image_path):
        return False
    
    # TODO: Add more validation
    # - Check file size
    # - Verify image format
    # - Check permissions
    
    return True


def update_trade_metadata(trade_file_path, image_paths):
    """
    Update trade markdown frontmatter with image references
    
    Args:
        trade_file_path (str): Path to trade markdown file
        image_paths (list): List of image paths
        
    TODO: Implement frontmatter update
    """
    # TODO: Read markdown file
    # TODO: Parse YAML frontmatter
    # TODO: Update images field
    # TODO: Write back to file
    
    print(f"TODO: Update {trade_file_path} with {len(image_paths)} image(s)")


def find_orphaned_images(trade_images, trades):
    """
    Find images that are not linked to any trade
    
    Args:
        trade_images (dict): {trade_id: [image_paths]}
        trades (list): List of trade dictionaries
        
    Returns:
        list: List of orphaned image paths
    """
    # Get all trade IDs from trades
    trade_ids = {f"trade-{t.get('trade_number', 0):03d}" for t in trades}
    
    orphaned = []
    for trade_id, images in trade_images.items():
        if trade_id not in trade_ids:
            orphaned.extend(images)
    
    return orphaned


def main():
    """Main execution function"""
    print("=" * 60)
    print("SFTi-Pennies Media Attachment Validator")
    print("=" * 60)
    
    # Scan for images
    print("\n[Step 1/3] Scanning for trade images...")
    trade_images = scan_trade_images()
    
    if not trade_images:
        print("No trade images found in index.directory/assets/trade-images/")
        print("Images should be organized in subdirectories like:")
        print("  index.directory/assets/trade-images/trade-001/screenshot1.png")
        print("  index.directory/assets/trade-images/trade-001/screenshot2.png")
        return
    
    total_images = sum(len(imgs) for imgs in trade_images.values())
    print(f"Found {total_images} image(s) across {len(trade_images)} trade(s)")
    
    for trade_id, images in trade_images.items():
        print(f"  {trade_id}: {len(images)} image(s)")
    
    # Load trades
    print("\n[Step 2/3] Loading trades index...")
    try:
        with open('index.directory/trades-index.json', 'r', encoding='utf-8') as f:
            index_data = json.load(f)
        trades = index_data.get('trades', [])
        print(f"Loaded {len(trades)} trade(s)")
    except FileNotFoundError:
        print("Error: trades-index.json not found")
        return
    
    # Find orphaned images
    print("\n[Step 3/3] Checking for orphaned images...")
    orphaned = find_orphaned_images(trade_images, trades)
    
    if orphaned:
        print(f"⚠️  Found {len(orphaned)} orphaned image(s):")
        for img in orphaned:
            print(f"  - {img}")
    else:
        print("✓ No orphaned images found")
    
    # TODO: Update trade metadata
    print("\nTODO: Implement trade metadata update")
    print("This would update markdown frontmatter with image references")
    
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"  Total images: {total_images}")
    print(f"  Linked trades: {len(trade_images)}")
    print(f"  Orphaned images: {len(orphaned)}")
    print("=" * 60)


if __name__ == '__main__':
    main()
