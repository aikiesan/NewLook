# 🗺️ CP2B Maps V3 - Week 2 Implementation Guide
## Advanced Dashboard Features: Layers, Filters & Analysis

---

## ✅ What You Have Now (Week 1 Complete!)

### **Public Access**
- ✅ Landing page with hero section (`/`)
- ✅ **NEW!** Public interactive map (`/map`) - Accessible to all visitors
- ✅ Login/Register pages

### **Protected Features**
- ✅ Dashboard (`/dashboard`) - For authenticated users
- ✅ 645 municipalities visualization
- ✅ Real-time statistics
- ✅ 8 working API endpoints

### **New Components Created**
- ✅ **LayerControl.tsx** - Toggle 10+ map layers
- ✅ **FilterPanel.tsx** - Multi-criteria filtering system

---

## 🎯 Week 2 Goals: Transform Dashboard into Analysis Hub

Following DBFZ/Detecta model:
- **Public Map** → Everyone can see biogas potential
- **Dashboard** → Authenticated users get advanced analysis tools

---

## 🏗️ Implementation Roadmap

### **Phase 1: Layer Management (2-3 days)**

#### **1.1 Integrate LayerControl into Dashboard**

Update `/frontend/src/app/dashboard/page.tsx`:

```typescript
import LayerControl from '@/components/dashboard/LayerControl'
import FilterPanel from '@/components/dashboard/FilterPanel'

export default function DashboardPage() {
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['municipalities', 'biogas-potential'])

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setVisibleLayers(prev =>
      visible
        ? [...prev, layerId]
        : prev.filter(id => id !== layerId)
    )
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Left Sidebar - Tools */}
      <aside className="col-span-1 space-y-4">
        <LayerControl onLayerToggle={handleLayerToggle} />
        <FilterPanel onFilterChange={handleFilterChange} />
      </aside>

      {/* Main Map Area */}
      <div className="col-span-3">
        <AdvancedMapComponent visibleLayers={visibleLayers} />
      </div>
    </div>
  )
}
```

#### **1.2 Update MapComponent to Support Layers**

Create conditional GeoJSON layers:

```typescript
// In MapComponent.tsx
{visibleLayers.includes('biogas-plants') && (
  <GeoJSON
    data={biogasPlantsData}
    pointToLayer={(feature, latlng) => {
      return L.marker(latlng, {
        icon: biogasPlantIcon
      })
    }}
  />
)}

{visibleLayers.includes('railways') && (
  <GeoJSON
    data={railwaysData}
    style={{ color: '#000', weight: 2 }}
  />
)}
```

#### **1.3 Add Backend Endpoints for New Layers**

Create infrastructure endpoints:

```python
# backend/app/api/v1/endpoints/infrastructure.py

@router.get("/railways/geojson")
async def get_railways():
    """Get railway network GeoJSON"""
    # Query railways table
    return geojson

@router.get("/pipelines/geojson")
async def get_pipelines():
    """Get pipeline network GeoJSON"""
    return geojson

@router.get("/substations/geojson")
async def get_substations():
    """Get electrical substations GeoJSON"""
    return geojson
```

---

### **Phase 2: Advanced Filtering (2-3 days)**

#### **2.1 Connect FilterPanel to Map**

```typescript
const [activeFilters, setActiveFilters] = useState<FilterCriteria>({...})

const handleFilterChange = (filters: FilterCriteria) => {
  setActiveFilters(filters)

  // Apply filters to municipalities
  const filtered = municipalities.filter(muni => {
    // Biogas range
    if (filters.minBiogas && muni.biogas < filters.minBiogas) return false
    if (filters.maxBiogas && muni.biogas > filters.maxBiogas) return false

    // Residue types
    if (filters.residueTypes.length > 0) {
      const hasType = filters.residueTypes.some(type =>
        muni[`${type}_biogas`] > 0
      )
      if (!hasType) return false
    }

    // Search query
    if (filters.searchQuery) {
      const matches = muni.name.toLowerCase().includes(
        filters.searchQuery.toLowerCase()
      )
      if (!matches) return false
    }

    return true
  })

  updateMapData(filtered)
}
```

#### **2.2 Backend Filter Support**

Update municipalities endpoint to accept filters:

```python
@router.get("/municipalities/geojson")
async def get_municipalities_geojson(
    min_biogas: Optional[float] = None,
    max_biogas: Optional[float] = None,
    residue_types: Optional[str] = None,  # comma-separated
    regions: Optional[str] = None,
    search: Optional[str] = None
):
    query = "SELECT ... FROM municipalities WHERE 1=1"

    if min_biogas:
        query += " AND total_biogas_m3_year >= %s"
    if residue_types:
        # Complex filtering by residue type

    # Execute and return filtered GeoJSON
```

---

### **Phase 3: Shapefile Upload (2-3 days)**

#### **3.1 Install Required Package**

```bash
npm install shpjs
```

#### **3.2 Create Shapefile Upload Component**

```typescript
// frontend/src/components/dashboard/ShapefileUpload.tsx
import shp from 'shpjs'

export default function ShapefileUpload() {
  const [customLayers, setCustomLayers] = useState<any[]>([])

  const handleFileUpload = async (file: File) => {
    try {
      // Read shapefile (zip file with .shp, .shx, .dbf, .prj)
      const arrayBuffer = await file.arrayBuffer()
      const geojson = await shp(arrayBuffer)

      // Add to map as custom layer
      const layerId = `custom-${Date.now()}`
      setCustomLayers(prev => [...prev, {
        id: layerId,
        name: file.name,
        data: geojson,
        visible: true
      }])
    } catch (error) {
      console.error('Error parsing shapefile:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="font-bold mb-3">Upload Shapefile</h3>
      <input
        type="file"
        accept=".zip,.shp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
        className="w-full"
      />

      {/* List uploaded layers */}
      <div className="mt-4 space-y-2">
        {customLayers.map(layer => (
          <div key={layer.id} className="flex items-center justify-between">
            <span>{layer.name}</span>
            <button onClick={() => removeLayer(layer.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### **Phase 4: Proximity Analysis with Drawing Tools (3-4 days)**

#### **4.1 Add Leaflet Draw**

```bash
npm install leaflet-draw @types/leaflet-draw
```

#### **4.2 Implement Drawing Tools**

```typescript
import { FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'

<FeatureGroup>
  <EditControl
    position="topright"
    onCreated={(e) => {
      const { layer } = e

      if (e.layerType === 'circle') {
        const center = layer.getLatLng()
        const radius = layer.getRadius() / 1000 // Convert to km

        // Call proximity analysis API
        analyzeProximity(center.lat, center.lng, radius)
      }
    }}
    draw={{
      circle: true,
      polygon: true,
      rectangle: true,
      marker: false,
      polyline: false,
      circlemarker: false
    }}
  />
</FeatureGroup>
```

---

### **Phase 5: MCDA Module (3-5 days)**

#### **5.1 Create MCDA Analysis Page**

```typescript
// frontend/src/app/dashboard/mcda/page.tsx
export default function MCDAPage() {
  const [criteria, setCriteria] = useState({
    biogasPotential: { weight: 30, enabled: true },
    population: { weight: 20, enabled: true },
    infrastructureProximity: { weight: 25, enabled: true },
    landAvailability: { weight: 15, enabled: true },
    environmentalImpact: { weight: 10, enabled: true }
  })

  const runMCDAAnalysis = async () => {
    const results = await fetch('/api/v1/analysis/mcda', {
      method: 'POST',
      body: JSON.stringify({ criteria })
    })

    // Visualize results on map
    displayMCDAResults(results)
  }

  return (
    <div>
      <h1>Análise MCDA - Localização Ótima</h1>

      {/* Criteria weight sliders */}
      {Object.entries(criteria).map(([key, value]) => (
        <div key={key}>
          <label>{key}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={value.weight}
            onChange={(e) => updateWeight(key, e.target.value)}
          />
        </div>
      ))}

      <button onClick={runMCDAAnalysis}>
        Executar Análise
      </button>
    </div>
  )
}
```

#### **5.2 Backend MCDA Endpoint**

```python
@router.post("/analysis/mcda")
async def run_mcda_analysis(criteria: MCDACriteria):
    """
    Multi-Criteria Decision Analysis for optimal biogas plant location
    """
    # Normalize scores (0-1)
    # Apply weights
    # Calculate composite scores
    # Rank municipalities

    return {
        "top_locations": [...],
        "scores": {...},
        "recommendations": [...]
    }
```

---

## 📊 Example: Filter by Municipality & Residue

**User Flow:**
1. User opens `/dashboard`
2. In FilterPanel, user:
   - Types "Campinas" in search
   - Checks "🌾 Agrícola"
   - Sets min biogas: 1,000,000 m³/year
3. Map updates to show only municipalities matching criteria
4. User toggles "Usinas de Biogás" layer to see existing plants
5. User draws a 50km radius circle to analyze proximity
6. Results show: "12 municipalities within radius, total potential: 15M m³/year"

---

## 🎨 UI/UX Patterns (DBFZ/Detecta Style)

### **Color Scheme**
```css
--cp2b-primary: #1E5128 (dark green)
--cp2b-secondary: #2C6B3A
--cp2b-accent: #A3D977 (light green)

Layer colors:
- Infrastructure: Orange (#FF6B35)
- Administrative: Blue (#4A90E2)
- Analysis: Purple (#9B59B6)
- Environmental: Green (#27AE60)
```

### **Component Style Guide**
- Cards: `rounded-lg shadow-lg bg-white`
- Inputs: `rounded-lg border-gray-300 focus:ring-2 focus:ring-[#1E5128]`
- Buttons: `bg-[#1E5128] hover:bg-[#2C6B3A] text-white`
- Icons: Lucide React icons

---

## 🚀 Quick Start Commands

```bash
# Start development
cd frontend
npm run dev  # localhost:3000

# Test new pages
http://localhost:3000/map          # Public map
http://localhost:3000/dashboard     # Protected dashboard

# Add new component
# Create in: frontend/src/components/dashboard/YourComponent.tsx
# Import in: dashboard/page.tsx
```

---

## 📈 Success Metrics

### **Week 2 Completion Checklist**
- [ ] Public map accessible to all visitors
- [ ] Layer control toggles 10+ layers
- [ ] Advanced filtering by 5+ criteria
- [ ] Shapefile upload working
- [ ] Drawing tools for proximity analysis
- [ ] MCDA module MVP implemented
- [ ] 3+ infrastructure layers added (railways, pipelines, substations)

---

## 🎯 Next Steps After Week 2

### **Week 3 (Nov 30-Dec 6): Advanced Features**
- [ ] Bagacinho AI assistant (RAG system)
- [ ] MapBiomas integration
- [ ] Scientific references panel
- [ ] Performance optimization

### **Week 4 (Dec 7-14): Polish & Production**
- [ ] WCAG 2.1 AA compliance
- [ ] Mobile responsive improvements
- [ ] Production deployment
- [ ] User documentation

---

## 💡 Pro Tips

1. **Start Small**: Implement one layer at a time, test, then add more
2. **Use TypeScript**: All components have proper type definitions
3. **Test Locally First**: Always test in development before deploying
4. **Follow DBFZ/Detecta**: Reference their UX for inspiration
5. **Keep It Modular**: Each component should be independently testable

---

## 🆘 Common Issues & Solutions

**Issue**: Shapefile not loading
**Solution**: Ensure .zip contains .shp, .shx, .dbf files

**Issue**: Map performance slow with many layers
**Solution**: Use clustering for point data, simplify polygon geometry

**Issue**: Filters not applying
**Solution**: Check filter criteria TypeScript types match backend

---

**🎉 You're Ready to Build!** Start with Phase 1 (Layer Management) and work your way through each phase.

Good luck with Week 2! 🚀
