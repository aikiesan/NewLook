#!/bin/bash
set -e

echo "📥 Downloading shapefiles from project_map repo..."
mkdir -p data/shapefiles data/rasters

# Download from GitHub
wget -q https://github.com/aikiesan/project_map/archive/refs/heads/main.zip -O /tmp/project_map.zip

# Extract
unzip -q /tmp/project_map.zip -d /tmp/

# Copy shapefiles
cp -r /tmp/project_map-main/data/shapefile/* data/shapefiles/
cp -r /tmp/project_map-main/data/rasters/* data/rasters/

# Cleanup
rm -rf /tmp/project_map.zip /tmp/project_map-main

echo "✅ Shapefiles downloaded successfully"
echo "📊 Total shapefile files: $(ls -1 data/shapefiles/*.shp 2>/dev/null | wc -l)"
echo "📊 Total raster files: $(ls -1 data/rasters/*.tif 2>/dev/null | wc -l)"
