import React, { createContext, useEffect, useState, useReducer } from 'react';
import T from 'prop-types';
import * as topojson from 'topojson-client';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';

import { featureCollection } from '@turf/helpers';
import useQsState from '../utils/qs-state-hook';
import { randomRange } from '../utils/utils';

import config from '../config';

import areasJson from '../../data/areas.json';

import { fetchZonesReducer, fetchZones } from './fetch-zones';

import {
  showGlobalLoading,
  hideGlobalLoading
} from '../components/common/global-loading';
import {
  INPUT_CONSTANTS,
  presets as defaultPresets
} from '../components/explore/panel-data';

import { initialApiRequestState } from './contexeed';
import { fetchJSON } from './reduxeed';
const { GRID_OPTIONS, SLIDER } = INPUT_CONSTANTS;

const ExploreContext = createContext({});

const presets = { ...defaultPresets };
export function ExploreProvider (props) {
  const [filtersLists, setFiltersLists] = useState(null);

  const [selectedArea, setSelectedArea] = useState(null);

  const [selectedAreaId, setSelectedAreaId] = useQsState({
    key: 'areaId',
    default: undefined
  });

  const [showSelectAreaModal, setShowSelectAreaModal] = useState(
    !selectedAreaId
  );

  const [areas, setAreas] = useState([]);

  const [map, setMap] = useState(null);

  useEffect(() => {
    setSelectedArea(areas.find((a) => a.id === selectedAreaId));
  }, [selectedAreaId]);

  const [selectedResource, setSelectedResource] = useQsState({
    key: 'resourceId',
    default: undefined
  });

  const [showSelectResourceModal, setShowSelectResourceModal] = useState(
    !selectedResource
  );

  useEffect(() => {
    setShowSelectAreaModal(!selectedAreaId);
    setShowSelectResourceModal(!selectedResource);
  }, [selectedAreaId, selectedResource]);

  const [gridMode, setGridMode] = useState(false);
  const [gridSize, setGridSize] = useState(GRID_OPTIONS[0]);

  const [tourStep, setTourStep] = useState(0);

  const initAreasAndFilters = async () => {
    showGlobalLoading();

    // Fetch filters from API
    const { body: filters } = await fetchJSON(
      `${config.apiEndpoint}/filter/schema`
    );

    // Prepare filters from the API to be consumed by the frontend
    const apiFilters = {
      distance_filters: Object.keys(filters)
        .map((filterId) => ({ ...filters[filterId], id: filterId }))
        .filter(
          ({ id, pattern }) =>
            (pattern === 'range_filter' && // enable range filters only
            ![
              'f_capacity_value',
              'f_lcoe_gen',
              'f_lcoe_transmission',
              'f_lcoe_road'
            ].includes(id)) // disable some filters not supported by the API
        )
        .map((filter) => {
          const isRange = filter.pattern === 'range_filter';
          let value = 0;

          if (isRange) {
            value = filter.range
              ? {
                min: filter.range[0],
                max: filter.range[1]
              }
              : {
                min: 0,
                max: 1000000
              };
          }

          return {
            ...filter,
            id: filter.id,
            name: filter.title,
            info: filter.description,
            active: false,
            isRange,
            input: {
              type: SLIDER,
              range: [0, 1000000],
              value
            }
          };
        })
    };

    // Apply a mock "Optimization" scenario to filter presets, just random numbers
    presets.filters = {
      Optimization: Object.entries(apiFilters).reduce(
        (accum, [name, group]) => {
          return {
            ...accum,
            [name]: group.map((filter) => ({
              ...filter,
              active: Math.random() > 0.5,
              input: {
                ...filter.input,
                value: {
                  max: filter.range
                    ? randomRange(filter.range[0], filter.range[1])
                    : randomRange(0, 100),
                  min: filter.range ? filter.range[0] : 0
                }
              }
            }))
          };
        },
        {}
      )
    };

    // Add to filters context
    setFiltersLists(apiFilters);

    // Parse region and country files into area list
    const eez = await fetch('public/zones/eez_v11.topojson').then((e) =>
      e.json()
    );
    const { features: eezFeatures } = topojson.feature(
      eez,
      eez.objects.eez_v11
    );
    const eezCountries = eezFeatures.reduce((accum, z) => {
      const id = z.properties.ISO_TER1;
      accum.set(id, [...(accum.has(id) ? accum.get(id) : []), z]);
      return accum;
    }, new Map());

    setAreas(
      areasJson.map((a) => {
        if (a.type === 'country') {
          a.id = a.gid;
          a.eez = eezCountries.get(a.id);
        }
        a.bounds = a.bounds
          ? a.bounds.split(',').map((x) => parseFloat(x))
          : null;
        return a;
      })
    );
    hideGlobalLoading();
  };

  useEffect(() => {
    setSelectedArea(areas.find((a) => a.id === selectedAreaId));
  }, [selectedAreaId]);

  useEffect(() => {
    let nextArea = areas.find((a) => `${a.id}` === `${selectedAreaId}`);

    if (selectedResource === 'Off-Shore Wind' && nextArea) {
      const initBounds = bboxPolygon(nextArea.bounds);
      const eezs = nextArea.eez ? nextArea.eez : [];
      const fc = featureCollection([initBounds, ...eezs]);
      const newBounds = bbox(fc);
      nextArea = {
        ...nextArea,
        bounds: newBounds
      };
      setGridMode(true);
    }

    setSelectedArea(nextArea);
  }, [areas, selectedAreaId, selectedResource]);

  // Executed on page mount
  useEffect(() => {
    const visited = localStorage.getItem('site-tour');
    if (visited !== null) {
      setTourStep(Number(visited));
    }

    initAreasAndFilters();
  }, []);

  useEffect(() => {
    localStorage.setItem('site-tour', tourStep);
  }, [tourStep]);

  useEffect(() => {
    dispatchCurrentZones({ type: 'INVALIDATE_FETCH_ZONES' });
  }, [selectedAreaId]);

  const [inputTouched, setInputTouched] = useState(true);
  const [zonesGenerated, setZonesGenerated] = useState(false);

  const [currentZones, dispatchCurrentZones] = useReducer(
    fetchZonesReducer,
    initialApiRequestState
  );

  const generateZones = async (filterString, weights, lcoe) => {
    showGlobalLoading();
    fetchZones(
      gridMode && gridSize,
      selectedArea,
      filterString,
      weights,
      lcoe,
      dispatchCurrentZones
    );
  };

  useEffect(() => {
    if (currentZones.fetched) {
      hideGlobalLoading();
      !zonesGenerated && setZonesGenerated(true);
      setInputTouched(false);
    }
  }, [currentZones]);

  const [filteredLayerUrl, setFilteredLayerUrl] = useState(null);

  function updateFilteredLayer (filterValues, weights, lcoe) {
    // Prepare a query string to the API based from filter values
    const filterString = filterValues
      .map((filter) => {
        const { id, pattern, active } = filter;

        // Bypass inactive filters
        if (!active) return null;

        // Add accepted filter types to the query
        if (pattern === 'range_filter') {
          const {
            value: { min, max }
          } = filter.input;
          return `${id}=${min},${max}`;
        }

        // discard non-accepted filter types
        return null;
      })
      .filter((x) => x)
      .join('&');

    // Apply filter querystring to the map
    setFilteredLayerUrl(
      `${config.apiEndpoint}/filter/{z}/{x}/{y}.png?${filterString}&color=54,166,244,80`
    );

    // Fetch zones
    generateZones(filterString, weights, lcoe);
  }

  return (
    <>
      <ExploreContext.Provider
        value={{
          map,
          setMap,
          areas,
          filtersLists,
          presets,
          selectedArea,
          setSelectedAreaId,
          selectedResource,
          setSelectedResource,
          showSelectAreaModal,
          setShowSelectAreaModal,
          showSelectResourceModal,
          setShowSelectResourceModal,
          gridMode,
          setGridMode,
          gridSize,
          setGridSize,
          currentZones,
          generateZones,
          inputTouched,
          setInputTouched,
          zonesGenerated,
          setZonesGenerated,
          filteredLayerUrl,
          updateFilteredLayer,
          tourStep,
          setTourStep
        }}
      >
        {props.children}
      </ExploreContext.Provider>
    </>
  );
}

ExploreProvider.propTypes = {
  children: T.node
};

export default ExploreContext;