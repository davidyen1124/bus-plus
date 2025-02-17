import { DEFAULT_MAP_CENTER, CONVERSION_SCALE } from '../constants/map'

const metersPerDegLat = 111320
const getMetersPerDegLng = (centerLat) =>
  111320 * Math.cos(centerLat * (Math.PI / 180))

export function convertLatLngToXZ(lat, lng, center = DEFAULT_MAP_CENTER) {
  const metersPerDegLng = getMetersPerDegLng(center.lat)
  const x = (lng - center.lng) * metersPerDegLng * CONVERSION_SCALE
  const z = (lat - center.lat) * metersPerDegLat * CONVERSION_SCALE
  return { x, z }
}

export function convertXZToLatLng(x, z, center = DEFAULT_MAP_CENTER) {
  const metersPerDegLng = getMetersPerDegLng(center.lat)
  const lat = z / (metersPerDegLat * CONVERSION_SCALE) + center.lat
  const lng = x / (metersPerDegLng * CONVERSION_SCALE) + center.lng
  return { lat, lng }
}
