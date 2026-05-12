import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { CATEGORY_COLORS, CATEGORIES } from "../hooks/useCountryState";
import worldData from "../data/world-110m.json";

const Map = ({ countries, selectedCountry, onCountryClick }) => {
  return (
    <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden shadow-inner relative">
      <ComposableMap
        projectionConfig={{
          scale: 1200,
          center: [-8, 39.5]
        }}
        className="w-full h-full"
      >
        <ZoomableGroup>
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
                        strokeWidth: 0.5,
                        transition: "all 250ms"
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
