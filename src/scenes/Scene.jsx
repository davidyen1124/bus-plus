import { useRef, useState } from 'react'
import { PointerLockControls, Sky } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import BusStop from '../components/BusStop'
import {
  groupAndFlattenBusStops,
  mergeBusStopClusters
} from '../utils/busStopHelpers'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { convertXZToLatLng } from '../utils/geoConversion'
import { FETCH_THRESHOLD_DISTANCE } from '../constants/map'

export default function Scene() {
  usePlayerControls()
  const { camera } = useThree()
  const groundRef = useRef()
  const lastFetchPos = useRef(null)
  const [busStopClusters, setBusStopClusters] = useState([])

  // Fetch nearby bus stops using current camera position by sampling a 3x3 grid around it
  const fetchBusStops = async (currentX, currentZ) => {
    const offsets = [-FETCH_THRESHOLD_DISTANCE, 0, FETCH_THRESHOLD_DISTANCE]
    const fetchPromises = []

    for (const dx of offsets) {
      for (const dz of offsets) {
        const sampleX = currentX + dx
        const sampleZ = currentZ + dz
        const { lat, lng } = convertXZToLatLng(sampleX, sampleZ)
        const url = `https://apis.bus-plus.tw/v2/bus/stops/nearby?latitude=${lat}&longitude=${lng}`
        fetchPromises.push(
          fetch(url)
            .then((res) => res.json())
            .catch((err) => {
              console.error('Error fetching bus stops:', err)
              return []
            })
        )
      }
    }

    const results = await Promise.all(fetchPromises)
    const allFetchedStops = results.flat()

    const clusters = groupAndFlattenBusStops(allFetchedStops)
    setBusStopClusters((prevClusters) =>
      mergeBusStopClusters(prevClusters, clusters)
    )
  }

  // Reposition the ground to follow the camera each frame. This creates the illusion of
  // an infinite plane so we never see the edges, and also helps avoid precision issues
  // if the camera travels far from the origin.
  useFrame(() => {
    if (groundRef.current) {
      groundRef.current.position.x = camera.position.x
      groundRef.current.position.z = camera.position.z
    }

    const currentX = camera.position.x
    const currentZ = camera.position.z

    if (!lastFetchPos.current) {
      lastFetchPos.current = { x: currentX, z: currentZ }
      fetchBusStops(currentX, currentZ)
    } else {
      const dx = currentX - lastFetchPos.current.x
      const dz = currentZ - lastFetchPos.current.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      if (distance > FETCH_THRESHOLD_DISTANCE) {
        lastFetchPos.current = { x: currentX, z: currentZ }
        fetchBusStops(currentX, currentZ)
      }
    }
  })

  return (
    <>
      <fog attach='fog' args={['#a0a0a0', 10, 100]} />
      <ambientLight intensity={0.3} color='#222222' />
      <directionalLight position={[10, 20, 10]} intensity={1.0} />
      <Sky sunPosition={[10, 20, 10]} />

      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color='#111111' />
      </mesh>
      <gridHelper
        args={[1000, 100, '#00ffff', '#ff00ff']}
        position={[0, 0.05, 0]}
      />

      {busStopClusters.map((cluster) => (
        <BusStop
          key={cluster.stopName}
          position={cluster.position}
          cluster={cluster}
        />
      ))}

      <PointerLockControls />
    </>
  )
}
