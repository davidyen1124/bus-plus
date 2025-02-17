import { Canvas } from '@react-three/fiber'
import Scene from './scenes/Scene'

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Scene />
    </Canvas>
  )
}
