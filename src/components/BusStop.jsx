import { useRef } from 'react'
import { Text, Billboard } from '@react-three/drei'
import PropTypes from 'prop-types'

function BusStop({ position, cluster }) {
  const signRef = useRef()

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Bus Stop Pole (with neon emissive material) */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial
          color='#333'
          emissive='#00ffff'
          emissiveIntensity={1}
        />
      </mesh>

      {/* Bus Stop Sign (with neon emissive material and billboard) */}
      <Billboard ref={signRef} position={[0, 2.5, 0]}>
        <group>
          <mesh>
            <boxGeometry args={[2, 1, 0.2]} />
            <meshStandardMaterial
              color='#111'
              emissive='#ff00ff'
              emissiveIntensity={1.5}
            />
          </mesh>
          <Text
            position={[0, 0, 0.11]}
            fontSize={0.15}
            color='white'
            anchorX='center'
            anchorY='middle'
            maxWidth={1.5}
            textAlign='center'
          >
            {cluster.stopName}
          </Text>
        </group>
      </Billboard>
    </group>
  )
}

BusStop.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    z: PropTypes.number.isRequired
  }).isRequired,
  cluster: PropTypes.shape({
    stopName: PropTypes.string.isRequired,
    position: PropTypes.shape({
      x: PropTypes.number.isRequired,
      z: PropTypes.number.isRequired
    }).isRequired,
    stops: PropTypes.array.isRequired
  }).isRequired
}

export default BusStop
