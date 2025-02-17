import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PLAYER_HEIGHT = 2

// Increase default speed from 5 to 10
export function usePlayerControls(speed = 10) {
  const { camera } = useThree()
  const keys = useRef({})

  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.code] = true
    }
    const handleKeyUp = (e) => {
      keys.current[e.code] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    // Get the forward direction from the camera (ignore vertical)
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()

    // Calculate right vector
    const right = new THREE.Vector3()
    right.crossVectors(camera.up, direction).normalize()

    // Movement amounts based on key presses
    let moveZ = 0,
      moveX = 0
    if (keys.current['KeyW']) moveZ += speed * delta
    if (keys.current['KeyS']) moveZ -= speed * delta
    if (keys.current['KeyA']) moveX += speed * delta
    if (keys.current['KeyD']) moveX -= speed * delta

    const move = new THREE.Vector3()
    move.add(direction.multiplyScalar(moveZ))
    move.add(right.multiplyScalar(moveX))

    camera.position.add(move)
    camera.position.y = PLAYER_HEIGHT
  })
}
