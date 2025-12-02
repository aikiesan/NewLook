# Add Brazil-wide Economic Simulation Infrastructure

This PR expands economic simulation from São Paulo (53 regions) to all Brazil (133 intermediary regions).

## What's Included

### Infrastructure (Ready to Use)
- Shapefile optimization (133 regions, 27 states, 98.8% geometry reduction)
- Distance matrix pre-computation (17,689 pairs)
- Database schema (4 tables, 3 functions, 3 views)
- Processing scripts (optimize_br_regions.py, compute_brazil_distance_matrix.py)
- Comprehensive documentation (3 guides)

### Files Added (10 files, 2,776 lines)
- Documentation: 3 markdown files
- Scripts: 2 Python scripts
- Database: 1 SQL migration
- Data: 3 small data files
- Helper: 1 inspection script

### Performance
- GeoJSON: 1.19 MB (98.8% reduction)
- Processing time: < 10 seconds
- Distance computation: 0.74 seconds
- Coverage: All 27 Brazilian states

## Testing
- [x] Scripts run successfully
- [x] All geometries valid
- [x] Distance matrix correct
- [x] Documentation complete

## Next Steps (Not in PR)
1. Import database schema
2. Collect IBGE economic data
3. Update backend services
4. Add frontend toggle

## Breaking Changes
None - purely additive

Reference: https://github.com/aikiesan/Prototipo_Choque_Marcelo
