import React, { useState, useEffect, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { Plus, Minus, Maximize } from "lucide-react";
import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import { CATEGORY_COLORS, CATEGORIES } from "../hooks/useCountryState";
import worldData from "../data/world-50m.json";

const Map = ({ countries, selectedCountry, onCountryClick }) => {
  const [position, setPosition] = useState({ coordinates: [-8, 39.5], zoom: 8 });

  // Pre-parse the features for fast lookup
  const worldFeatures = useMemo(() => {
    return feature(worldData, worldData.objects.countries).features;
  }, []);

  // Auto-center when selectedCountry changes (especially from search)
  useEffect(() => {
    if (selectedCountry) {
      const targetFeature = worldFeatures.find(f => {
        const id = f.id || f.properties.ISO_A3 || f.properties.name;
        return id === selectedCountry.id;
      });

      if (targetFeature) {
        const centroid = geoCentroid(targetFeature);
        
        // Determine zoom level based on country size or specific small islands
        // Very small islands need extreme zoom to be visible
        const smallIslands = ['MDV', 'MLT', 'CPV', 'MUS', 'SYC', 'SGP', 'BRB', 'GRD', 'VCT', 'LCA', 'ATG', 'KNA', 'DMA'];
        const isSmallIsland = smallIslands.includes(selectedCountry.id) || 
                             (targetFeature.properties.ISO_A3 && smallIslands.includes(targetFeature.properties.ISO_A3));
        
        setPosition({
          coordinates: centroid,
          zoom: isSmallIsland ? 40 : 8
        });
      }
    }
  }, [selectedCountry, worldFeatures]);

  function handleZoomIn() {
    if (position.zoom >= 100) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }

  function handleReset() {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  }

  function handleMoveEnd(position) {
    setPosition(position);
  }

  return (
    <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden shadow-inner relative">
      <ComposableMap
        projectionConfig={{
          scale: 140,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={worldData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryId = geo.id || geo.properties.ISO_A3 || geo.properties.name;
                const category = countries[countryId] || CATEGORIES.NONE;
                const isSelected = selectedCountry && (selectedCountry.id === countryId);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onCountryClick({
                      id: countryId,
                      name: geo.properties.name
                    })}
                    style={{
                      default: {
                        fill: isSelected ? "#334155" : CATEGORY_COLORS[category],
                        outline: "none",
                        stroke: "#ffffff",
                        strokeWidth: 0.5 / position.zoom,
                        transition: "fill 250ms"
                      },
                      hover: {
                        fill: "#94a3b8",
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "#64748b",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 text-slate-600 transition-colors border border-slate-100"
          title="Zoom In"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 text-slate-600 transition-colors border border-slate-100"
          title="Zoom Out"
        >
          <Minus className="h-5 w-5" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 text-slate-600 transition-colors border border-slate-100"
          title="Reset View"
        >
          <Maximize className="h-5 w-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm text-xs border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span>Want to Visit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          <span>Unvisited</span>
        </div>
      </div>
    </div>
  );
};

export default Map;
