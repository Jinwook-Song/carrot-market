import { useEffect, useState } from 'react';

type ICoordsState = {
  latitude: number | null;
  longitude: number | null;
};

export default function useCoords() {
  const [coords, setCoords] = useState<ICoordsState>({
    latitude: null,
    longitude: null,
  });

  function onSuccess({ coords: { latitude, longitude } }: GeolocationPosition) {
    setCoords({ latitude, longitude });
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(onSuccess);
  }, []);
  return coords;
}
