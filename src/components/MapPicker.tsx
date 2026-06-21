
import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary, MapMouseEvent } from '@vis.gl/react-google-maps';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface MapPickerProps {
  initialValue?: string;
  onSelect: (address: string, location?: { lat: number; lng: number }) => void;
  onClose: () => void;
}

const PlaceAutocomplete = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['formatted_address', 'geometry', 'name'],
    };

    const autocomplete = new places.Autocomplete(inputRef.current, options);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      onPlaceSelect(place);
    });
  }, [places]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Pesquisar endereço ou local..."
        className="w-full bg-white border border-zinc-200 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-xl"
      />
      <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400">search</span>
    </div>
  );
};

const MapContent = ({ selectedLocation, onMapClick }: { 
  selectedLocation: { lat: number; lng: number } | null;
  onMapClick: (e: MapMouseEvent) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (map && selectedLocation) {
      map.panTo(selectedLocation);
      map.setZoom(17);
    }
  }, [map, selectedLocation]);

  return (
    <Map
      zoom={12}
      center={selectedLocation || { lat: -23.5505, lng: -46.6333 }}
      onClick={onMapClick}
      mapId="DEMO_MAP_ID"
      style={{ width: '100%', height: '100%' }}
      disableDefaultUI={true}
      zoomControl={true}
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
    >
      {selectedLocation && (
        <AdvancedMarker position={selectedLocation}>
          <Pin background={'#000'} glyphColor={'#FFF'} borderColor={'#000'} />
        </AdvancedMarker>
      )}
    </Map>
  );
};

export const MapPicker: React.FC<MapPickerProps> = ({ initialValue, onSelect, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState(initialValue || '');
  const geocoding = useMapsLibrary('geocoding');

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const loc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setSelectedLocation(loc);
      setAddress(place.formatted_address || place.name || '');
    }
  };

  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail.latLng && geocoding) {
      const { lat, lng } = e.detail.latLng;
      setSelectedLocation({ lat, lng });

      const geocoder = new geocoding.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }
  };

  if (!API_KEY) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-zinc-100 max-w-md text-center space-y-6">
          <span className="material-symbols-outlined text-5xl text-zinc-200">map</span>
          <h2 className="text-2xl font-light tracking-tight">Chave de API Necessária</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Para utilizar a busca de endereços, é necessário configurar a chave do Google Maps nas configurações (Secrets).
          </p>
          <button onClick={onClose} className="w-full py-4 bg-zinc-900 text-white rounded-full font-bold text-[10px] uppercase tracking-widest">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-8">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-4xl bg-white rounded-none md:rounded-[40px] shadow-2xl border border-zinc-100 flex flex-col overflow-hidden">
        <div className="absolute top-6 left-6 right-6 z-10 flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
          </div>
          <button 
            onClick={onClose}
            className="md:w-16 w-full h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all border border-zinc-100"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
        </div>

        <div className="flex-1 relative bg-zinc-50">
          <MapContent 
            selectedLocation={selectedLocation} 
            onMapClick={handleMapClick} 
          />
        </div>

        <div className="p-6 md:p-10 bg-white border-t border-zinc-100 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-2">Endereço Selecionado</p>
            <p className="text-sm font-medium text-zinc-600 truncate">{address || 'Clique no mapa ou pesquise...'}</p>
          </div>
          <button 
            disabled={!address}
            onClick={() => { onSelect(address, selectedLocation || undefined); onClose(); }}
            className={`w-full md:w-auto px-12 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.5em] transition-all shadow-xl ${
              address ? 'bg-zinc-900 text-white hover:y-[-4px]' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
            }`}
          >
            Confirmar Endereço
          </button>
        </div>
      </div>
    </div>
  );
};

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      {children}
    </APIProvider>
  );
};
