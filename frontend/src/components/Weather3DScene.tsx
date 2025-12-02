import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Cloud, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { Box } from '@mui/material'

interface Weather3DSceneProps {
  weatherCondition: string
  cloudiness: number
  isDay: boolean
  temperature: number
}

// Rain particle system
function RainParticles({ count = 1000 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = Math.random() * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      velocities[i] = 0.1 + Math.random() * 0.2
    }

    return { positions, velocities }
  }, [count])

  useFrame(() => {
    if (!points.current) return

    const positions = points.current.geometry.attributes.position
      .array as Float32Array

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= particles.velocities[i]

      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 20
        positions[i * 3] = (Math.random() - 0.5) * 20
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      }
    }

    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#4fc3f7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Snow particle system
function SnowParticles({ count = 500 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = Math.random() * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      velocities[i] = 0.02 + Math.random() * 0.05
    }

    return { positions, velocities }
  }, [count])

  useFrame((state) => {
    if (!points.current) return

    const positions = points.current.geometry.attributes.position
      .array as Float32Array
    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= particles.velocities[i]
      positions[i * 3] += Math.sin(time + i) * 0.01
      positions[i * 3 + 2] += Math.cos(time + i) * 0.01

      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 20
        positions[i * 3] = (Math.random() - 0.5) * 20
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      }
    }

    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// Animated clouds
function AnimatedClouds({ cloudiness }: { cloudiness: number }) {
  const cloudCount = Math.ceil((cloudiness / 100) * 5)
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <group ref={group}>
      {Array.from({ length: cloudCount }).map((_, i) => (
        <Cloud
          key={i}
          opacity={0.4 + (cloudiness / 100) * 0.3}
          speed={0.2}
          segments={20}
          position={[
            Math.cos((i / cloudCount) * Math.PI * 2) * 8,
            3 + Math.random() * 2,
            Math.sin((i / cloudCount) * Math.PI * 2) * 8,
          ]}
        />
      ))}
    </group>
  )
}

// Animated sun/moon
function CelestialBody({ isDay, temperature }: { isDay: boolean; temperature: number }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.elapsedTime
      mesh.current.position.y = 8 + Math.sin(time * 0.3) * 0.3
      mesh.current.rotation.y = time * 0.5
    }
  })

  // Color based on temperature
  const getSunColor = () => {
    if (temperature > 85) return '#ff5722' // Hot - red-orange
    if (temperature > 70) return '#ffa726' // Warm - orange
    if (temperature > 50) return '#ffeb3b' // Mild - yellow
    return '#fff59d' // Cool - pale yellow
  }

  return (
    <mesh ref={mesh} position={[5, 8, -5]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={isDay ? getSunColor() : '#b0bec5'}
        emissive={isDay ? getSunColor() : '#607d8b'}
        emissiveIntensity={isDay ? 0.8 : 0.3}
      />
      {isDay && (
        <pointLight
          color={getSunColor()}
          intensity={1.5}
          distance={30}
          decay={2}
        />
      )}
    </mesh>
  )
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#4caf50" opacity={0.3} transparent />
    </mesh>
  )
}

// Main scene component
function Scene({
  weatherCondition,
  cloudiness,
  isDay,
  temperature,
}: Weather3DSceneProps) {
  const showRain =
    weatherCondition.toLowerCase().includes('rain') ||
    weatherCondition.toLowerCase().includes('drizzle') ||
    weatherCondition.toLowerCase().includes('thunderstorm')

  const showSnow = weatherCondition.toLowerCase().includes('snow')

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={isDay ? [5, 8, -5] : [-5, -8, 5]}
        inclination={isDay ? 0.6 : 0.1}
        azimuth={0.25}
      />

      <ambientLight intensity={isDay ? 0.6 : 0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={isDay ? 1 : 0.2}
        castShadow
      />

      <CelestialBody isDay={isDay} temperature={temperature} />
      <AnimatedClouds cloudiness={cloudiness} />

      {showRain && <RainParticles count={1500} />}
      {showSnow && <SnowParticles count={800} />}

      <Ground />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

// Main exported component
const Weather3DScene = (props: Weather3DSceneProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '400px',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3,
      }}
    >
      <Canvas
        camera={{ position: [0, 5, 12], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Scene {...props} />
      </Canvas>
    </Box>
  )
}

export default Weather3DScene
