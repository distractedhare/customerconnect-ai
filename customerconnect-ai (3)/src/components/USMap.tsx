import React, { memo, useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { merge } from "topojson-client";
import * as topojson from "topojson-client";
import { geoPath, geoAlbersUsa } from "d3-geo";
import { isAbortError, withTimeoutSignal } from "../services/networkUtils";

// Bundled locally for offline support — no CDN dependency
const geoUrl = "/states-10m.json";
const MAP_COLORS = {
  base: 'var(--color-map-base)',
  regionSelected: 'var(--color-map-region-selected)',
  stateAvailable: 'var(--color-map-state-available)',
  stateSelected: 'var(--color-map-state-selected)',
  stroke: 'var(--color-map-stroke)',
  tooltipSurface: 'var(--color-tooltip-surface)',
  tooltipForeground: 'var(--color-tooltip-foreground)',
};

const regions = {
  "New England": ["Connecticut", "Maine", "Massachusetts", "New Hampshire", "Rhode Island", "Vermont"],
  "Mid-Atlantic": ["New Jersey", "New York", "Pennsylvania"],
  "South Atlantic": ["Delaware", "Maryland", "Virginia", "District of Columbia", "West Virginia"],
  "Southeast": ["North Carolina", "South Carolina", "Georgia", "Florida"],
  "Deep South": ["Alabama", "Mississippi", "Louisiana"],
  "Mid-South": ["Tennessee", "Kentucky", "Arkansas"],
  "Great Lakes": ["Michigan", "Ohio", "Indiana", "Illinois", "Wisconsin"],
  "Upper Midwest": ["Minnesota", "Iowa", "Missouri"],
  "Great Plains": ["North Dakota", "South Dakota", "Nebraska", "Kansas"],
  "Texas & Oklahoma": ["Texas", "Oklahoma"],
  "Desert Southwest": ["Arizona", "New Mexico", "Nevada"],
  "Rocky Mountains": ["Colorado", "Utah", "Wyoming", "Montana", "Idaho"],
  "Pacific Northwest": ["Washington", "Oregon"],
  "California": ["California"],
  "Alaska": ["Alaska"],
  "Hawaii": ["Hawaii"]
};

interface USMapProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  selectedState?: string;
  onSelectState?: (state: string) => void;
}

interface GeoFeatureProperties {
  name: string;
  isRegion?: boolean;
  isState?: boolean;
  regionName?: string;
}

interface GeoFeature {
  type: string;
  properties: GeoFeatureProperties;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry: any;
  rsmKey?: string;
}

const USMap = ({ selectedRegion, onSelectRegion, selectedState, onSelectState }: USMapProps) => {
  const [regionFeatures, setRegionFeatures] = useState<GeoFeature[]>([]);
  const [stateFeatures, setStateFeatures] = useState<GeoFeature[]>([]);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [loadFailed, setLoadFailed] = useState(false);
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

  useEffect(() => {
    const controller = new AbortController();
    const { signal, cleanup } = withTimeoutSignal({ signal: controller.signal, timeoutMs: 8000 });

    fetch(geoUrl, { signal, cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Map request failed with ${res.status}`);
        }
        return res.json();
      })
      .then(topology => {
        setLoadFailed(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const states = topology.objects.states.geometries as any[];

        // Build state features — topojson.feature returns a FeatureCollection
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sFeatures = (topojson.feature(topology, topology.objects.states) as any).features as GeoFeature[];
        setStateFeatures(sFeatures);

        const rFeatures = Object.entries(regions).map(([regionName, stateNames]) => {
          const regionGeometries = states.filter((d: any) => stateNames.includes(d.properties.name));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const merged = merge(topology as any, regionGeometries as any);
          return {
            type: "Feature",
            properties: { name: regionName, isRegion: true },
            geometry: merged,
            rsmKey: regionName
          };
        });
        
        setRegionFeatures(rFeatures);
      })
      .catch((error) => {
        if (!isAbortError(error)) {
          setLoadFailed(true);
        }
      });

    return () => {
      controller.abort();
      cleanup();
    };
  }, []);

  // Compute what to display based on selectedRegion
  const displayFeatures: GeoFeature[] = [];
  if (regionFeatures.length > 0 && stateFeatures.length > 0) {
    for (const rFeature of regionFeatures) {
      const regionName = rFeature.properties.name;
      if (regionName === selectedRegion) {
        // Add individual states for this region
        const stateNames = regions[regionName as keyof typeof regions];
        const statesInRegion = stateFeatures.filter((f) => stateNames.includes(f.properties.name));
        displayFeatures.push(...statesInRegion.map(f => ({
          ...f, 
          properties: { ...f.properties, isState: true, regionName }
        })));
      } else {
        // Add the merged region
        displayFeatures.push(rFeature);
      }
    }
  }

  // Handle zooming to selected region
  useEffect(() => {
    if (selectedRegion && selectedRegion !== 'Not Specified' && regionFeatures.length > 0) {
      const feature = regionFeatures.find(f => f.properties.name === selectedRegion);
      if (feature) {
        const projection = geoAlbersUsa().scale(1070).translate([400, 300]);
        const path = geoPath().projection(projection);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bounds = path.bounds(feature as any);
        
        if (bounds && bounds[0] && bounds[1] && isFinite(bounds[0][0])) {
          const dx = bounds[1][0] - bounds[0][0];
          const dy = bounds[1][1] - bounds[0][1];
          const x = (bounds[0][0] + bounds[1][0]) / 2;
          const y = (bounds[0][1] + bounds[1][1]) / 2;
          
          // Calculate scale to fit within 800x600 with some padding
          const scale = Math.max(1, Math.min(4, 0.8 / Math.max(dx / 800, dy / 600)));
          const translateX = 400 - scale * x;
          const translateY = 300 - scale * y;
          
          setTransform({ k: scale, x: translateX, y: translateY });
        }
      }
    } else {
      setTransform({ k: 1, x: 0, y: 0 });
    }
  }, [selectedRegion, regionFeatures]);

  return (
    <div className="w-full h-48 bg-surface rounded-xl overflow-hidden border-2 border-t-light-gray relative">
      <ComposableMap projection="geoAlbersUsa" className="w-full h-full">
        <g
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
            transition: "transform 600ms ease-in-out",
            transformOrigin: "0 0"
          }}
        >
          <Geographies geography={displayFeatures.length > 0 ? displayFeatures : geoUrl}>
          {({ geographies }) =>
            geographies.map((geo, index) => {
              const isCustomLoaded = displayFeatures.length > 0;
              
              // Fallback if not loaded yet
              if (!isCustomLoaded) {
                return (
                  <Geography
                    key={`fallback-${geo.rsmKey || index}`}
                    geography={geo}
                    style={{
                      default: {
                        fill: MAP_COLORS.base,
                        stroke: MAP_COLORS.stroke,
                        strokeWidth: 0.5 / transform.k,
                        outline: "none"
                      }
                    }}
                  />
                );
              }

              const isRegion = geo.properties.isRegion;
              const isState = geo.properties.isState;
              const name = geo.properties.name;
              
              const isSelectedRegion = isRegion && selectedRegion === name;
              const isSelectedState = isState && selectedState === name;

              return (
                <Geography
                  key={`geo-${isRegion ? 'region' : 'state'}-${name || index}`}
                  geography={geo}
                  onClick={() => {
                    if (isRegion) {
                      onSelectRegion(name);
                    } else if (isState) {
                      if (onSelectState) onSelectState(name);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!isTouchDevice) {
                      setTooltipContent(name);
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isTouchDevice) {
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  style={{
                    default: {
                      fill: isSelectedState
                        ? MAP_COLORS.stateSelected
                        : (isState ? MAP_COLORS.stateAvailable : (isSelectedRegion ? MAP_COLORS.regionSelected : MAP_COLORS.base)),
                      stroke: MAP_COLORS.stroke,
                      strokeWidth: isState ? 0.5 / transform.k : 1.5 / transform.k,
                      outline: "none",
                      transition: "all 250ms"
                    },
                    hover: {
                      fill: isState ? MAP_COLORS.regionSelected : MAP_COLORS.stateAvailable,
                      stroke: MAP_COLORS.stroke,
                      strokeWidth: isState ? 0.5 / transform.k : 1.5 / transform.k,
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 250ms"
                    },
                    pressed: {
                      fill: MAP_COLORS.regionSelected,
                      stroke: MAP_COLORS.stroke,
                      strokeWidth: isState ? 0.5 / transform.k : 1.5 / transform.k,
                      outline: "none"
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
        </g>
      </ComposableMap>
      {selectedRegion !== 'Not Specified' && (
        <div className="absolute bottom-2 left-2 bg-surface-elevated/90 px-2 py-1 rounded border border-t-light-gray text-[10px] font-black uppercase text-t-magenta shadow-sm">
          {selectedRegion} {selectedState ? `> ${selectedState}` : ''}
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-surface-elevated/90 border border-t-light-gray p-2 rounded text-[8px] font-bold uppercase tracking-wider text-t-dark-gray shadow-sm flex flex-col gap-1.5 pointer-events-none">
        {selectedRegion === 'Not Specified' ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm border border-t-light-gray" style={{ backgroundColor: MAP_COLORS.base }}></div>
              <span>Region</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MAP_COLORS.regionSelected }}></div>
              <span>Selected Region</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MAP_COLORS.regionSelected }}></div>
              <span>Selected Region</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MAP_COLORS.stateAvailable }}></div>
              <span>Selectable State</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MAP_COLORS.stateSelected }}></div>
              <span>Selected State</span>
            </div>
          </>
        )}
      </div>
      {loadFailed && (
        <div className="absolute inset-3 rounded-lg border border-error-border bg-error-surface/90 px-3 py-2 text-[10px] font-bold text-error-foreground shadow-sm">
          The region map couldn&apos;t load. Region selection still works from the buttons above.
        </div>
      )}
      {tooltipContent && !isTouchDevice && (
        <div
          className="fixed z-50 text-[10px] font-bold px-2 py-1 rounded pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px] shadow-lg"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            backgroundColor: MAP_COLORS.tooltipSurface,
            color: MAP_COLORS.tooltipForeground,
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default memo(USMap);
