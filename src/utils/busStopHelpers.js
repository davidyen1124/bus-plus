import { convertLatLngToXZ } from './geoConversion'

/**
 * Groups and flattens bus stops by their stopName.
 *
 * This function takes an array of raw bus stop objects (which may contain nested arrays via `busStops`)
 * and groups them by their `stopName`. It also flattens the nested arrays so that each group has a single,
 * consolidated array of bus stop objects. A representative position is calculated for the group using the
 * first encountered stop's location.
 *
 * @param {Array} stops - Array of bus stop objects from the API.
 * @returns {Array} clusters - Array of bus stop clusters, each containing:
 *   - stopName: {string} The common name of the bus stop.
 *   - stops: {Array} Flattened array of individual bus stop objects.
 *   - position: {Object} The 3D scene position, with `x` and `z` coordinates.
 */
export function groupAndFlattenBusStops(stops) {
  const groups = stops.reduce((acc, stop) => {
    if (!stop.stopName) return acc

    if (!acc[stop.stopName]) {
      acc[stop.stopName] = {
        stops: [],
        representative: stop
      }
    }

    if (
      stop.busStops &&
      Array.isArray(stop.busStops) &&
      stop.busStops.length > 0
    ) {
      acc[stop.stopName].stops.push(...stop.busStops)
    } else {
      acc[stop.stopName].stops.push(stop)
    }

    return acc
  }, {})

  const clusters = Object.keys(groups).map((stopName) => {
    const group = groups[stopName]
    const rep = group.representative
    const { x, z } = convertLatLngToXZ(
      rep.location.coordinates[1],
      rep.location.coordinates[0]
    )
    return { stopName, stops: group.stops, position: { x, z } }
  })
  return clusters
}

/**
 * Merges newly fetched bus stop clusters with the existing clusters.
 *
 * As the user moves around and new data is fetched, there may be overlapping clusters.
 * This function merges new clusters into the existing ones by matching on `stopName`.
 * If a matching cluster exists, the stops are concatenated; if not, the new cluster is added.
 *
 * @param {Array} oldClusters - Array of existing bus stop clusters.
 * @param {Array} newClusters - Array of newly fetched bus stop clusters.
 * @returns {Array} - The merged array of bus stop clusters.
 */
export function mergeBusStopClusters(oldClusters, newClusters) {
  const clusterMap = {}

  // Create a map from the existing clusters keyed by stopName for quick lookup
  for (const cluster of oldClusters) {
    clusterMap[cluster.stopName] = cluster
  }

  // Merge the new clusters into the map
  for (const cluster of newClusters) {
    if (!clusterMap[cluster.stopName]) {
      clusterMap[cluster.stopName] = { ...cluster }
    } else {
      // If the cluster already exists, merge the stops arrays
      clusterMap[cluster.stopName].stops = [
        ...clusterMap[cluster.stopName].stops,
        ...cluster.stops
      ]
      // Optionally, you could update the position if needed
    }
  }

  // Convert the map back into an array for state updates and rendering
  return Object.values(clusterMap)
}
