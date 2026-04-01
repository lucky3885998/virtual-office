import React, { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import useOfficeStore from '../../stores/officeStore'
import { departments } from '../../data/members'

// 粒子系统
// 透视引导线
function DepthLines() {
  const linesRef = useRef()
  const count = 16
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      pos[i * 3] = Math.cos(angle) * 0.3
      pos[i * 3 + 1] = Math.sin(angle) * 0.3
      pos[i * 3 + 2] = 0
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = state.clock.elapsedTime * 0.02
    }
  })
  
  return (
    <group position={[0, 2, -8]}>
      {[15, 20, 25].map((depth, di) => (
        <group key={di} rotation={[0, 0, (di * Math.PI) / 6]}>
          {[...Array(count)].map((_, i) => {
            const angle = (i / count) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.2 * (1 + depth * 0.05),
                  Math.sin(angle) * 0.2 * (1 + depth * 0.05),
                  -depth
                ]}
              >
                <sphereGeometry args={[0.015 - di * 0.004, 8, 8]} />
                <meshBasicMaterial 
                  color="#5b8dd9" 
                  transparent 
                  opacity={0.2 - di * 0.05} 
                />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}


function StarDust() {
  const dustRef = useRef()
  const stars1Ref = useRef()
  const stars2Ref = useRef()
  const nebula1Ref = useRef()
  const nebula2Ref = useRef()
  const count = 120
  const stars1Count = 300
  const stars2Count = 400
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5
    }
    return pos
  }, [])
  
  const stars1Positions = useMemo(() => {
    const pos = new Float32Array(stars1Count * 3)
    for (let i = 0; i < stars1Count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50 + 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 25
    }
    return pos
  }, [])
  
  const stars2Positions = useMemo(() => {
    const pos = new Float32Array(stars2Count * 3)
    for (let i = 0; i < stars2Count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 50 + Math.random() * 50
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7 + 2
      pos[i * 3 + 2] = r * Math.cos(phi) - 40
    }
    return pos
  }, [])
  
  useFrame((state) => {
    const t = state.clock.elapsedTime
    
    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(t * 0.5 + i * 0.2) * 0.005
        pos[i * 3] += Math.cos(t * 0.4 + i * 0.3) * 0.004
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    if (nebula1Ref.current) {
      nebula1Ref.current.rotation.z = t * 0.015
      nebula1Ref.current.material.opacity = 0.05 + Math.sin(t * 0.3) * 0.02
    }
    if (nebula2Ref.current) {
      nebula2Ref.current.rotation.z = -t * 0.01
      nebula2Ref.current.material.opacity = 0.035 + Math.sin(t * 0.2 + 1) * 0.015
    }
  })
  
  return (
    <>
      {/* 星云层1 - 蓝色 */}
      <mesh ref={nebula1Ref} position={[-20, 8, -50]} rotation={[0.2, 0.3, 0]}>
        <planeGeometry args={[80, 50]} />
        <meshBasicMaterial 
          color="#1e3a5f" 
          transparent 
          opacity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 星云层2 - 深紫 */}
      <mesh ref={nebula2Ref} position={[25, -8, -60]} rotation={[-0.3, -0.2, 0]}>
        <planeGeometry args={[70, 45]} />
        <meshBasicMaterial 
          color="#2d1f4e" 
          transparent 
          opacity={0.035}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 远景星星 - 散布全背景 */}
      <points ref={stars2Ref}>
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[stars2Positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#c9d6e8"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* 中景星星 */}
      <points ref={stars1Ref}>
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[stars1Positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#e8eef5"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* 近景漂浮星尘 */}
      <points ref={dustRef}>
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          transparent
          opacity={1}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}

// 顶部射光
function TopBeam() {
  const glow1Ref = useRef()
  const glow2Ref = useRef()
  
  useFrame((state) => {
    const t = state.clock.elapsedTime
    
    if (glow1Ref.current) {
      glow1Ref.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.15)
    }
    if (glow2Ref.current) {
      glow2Ref.current.scale.setScalar(1 + Math.sin(t * 0.4 + 1) * 0.2)
      glow2Ref.current.material.opacity = 0.15 + Math.sin(t * 0.4 + 1) * 0.05
    }
  })
  
  return (
    <group position={[0, 8, -2]}>
      {/* 光源核心 */}
      <mesh ref={glow1Ref} position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* 光晕 */}
      <mesh ref={glow2Ref} position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#5b8dd9" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

// 中心渐变光效
function CenterGlow() {
  const ring2Ref = useRef()
  const ring3Ref = useRef()
  
  useFrame((state) => {
    const t = state.clock.elapsedTime
    
    if (ring2Ref.current) {
      ring2Ref.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.12)
      ring2Ref.current.material.opacity = 0.15 + Math.sin(t * 0.5) * 0.06
    }
    if (ring3Ref.current) {
      ring3Ref.current.scale.setScalar(1.4 + Math.sin(t * 0.6 + 1) * 0.18)
      ring3Ref.current.material.opacity = 0.08 + Math.sin(t * 0.6 + 1) * 0.04
    }
  })
  
  return (
    <group position={[0, 2, -5]}>
      {/* 中层光环 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.015, 8, 64]} />
        <meshBasicMaterial color="#8bafdb" transparent opacity={0.12} />
      </mesh>
      
      {/* 外层光环 */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.01, 8, 64]} />
        <meshBasicMaterial color="#5b8dd9" transparent opacity={0.06} />
      </mesh>
    </group>
  )
}

// 悬浮数据立方体
function DataCubes() {
  const cube1Ref = useRef()
  const cube2Ref = useRef()
  
  useFrame((state) => {
    const t = state.clock.elapsedTime
    
    if (cube1Ref.current) {
      cube1Ref.current.rotation.x = t * 0.2
      cube1Ref.current.rotation.y = t * 0.3
      cube1Ref.current.position.y = 3 + Math.sin(t * 0.5) * 0.5
    }
    if (cube2Ref.current) {
      cube2Ref.current.rotation.x = -t * 0.15
      cube2Ref.current.rotation.z = t * 0.25
      cube2Ref.current.position.y = -1 + Math.sin(t * 0.4 + 1) * 0.4
    }
  })
  
  return (
    <>
      {/* 主数据立方体 */}
      <group ref={cube1Ref} position={[-8, 3, -8]}>
        <mesh>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial 
            color="#3b82f6"
            emissive="#1e40af"
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
            wireframe={false}
          />
        </mesh>
        <mesh>
          <boxGeometry args={[0.85, 0.85, 0.85]} />
          <meshBasicMaterial 
            color="#3b82f6"
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      </group>
      
      {/* 副数据立方体 */}
      <group ref={cube2Ref} position={[10, -1, -10]}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial 
            color="#8b5cf6"
            emissive="#6d28d9"
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshBasicMaterial 
            color="#8b5cf6"
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      </group>
    </>
  )
}

// 简洁粒子
function AmbientParticles() {
  const particlesRef = useRef()
  const count = 20
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3 - 3
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array
      const time = state.clock.elapsedTime
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(time * 0.2 + i * 0.5) * 0.002
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <float32BufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#3b82f6"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const statusColors = {
  working: '#22c55e',
  idle: '#eab308',
  busy: '#ef4444',
  offline: '#71717a'
}

const statusEmissive = {
  working: '#16a34a',
  idle: '#ca8a04',
  busy: '#dc2626',
  offline: '#52525b'
}

// 职业配件配置
const roleAccessories = {
  CEO: { type: 'crown', color: '#FFD700' },
  COO: { type: 'star', color: '#3B82F6' },
  'MKT-01': { type: 'pen', color: '#FF6B6B' },      // 文案
  'MKT-03': { type: 'brush', color: '#FF6B6B' },    // 设计
  'SAL-02-01': { type: 'chat', color: '#10B981' },   // 获客
  'SAL-03-02': { type: 'headset', color: '#10B981' }, // 客服
  'DEL-04-01': { type: 'doc', color: '#8B5CF6' },    // 方案
  'DEL-05-02': { type: 'clipboard', color: '#8B5CF6' }, // 管项
  'IT-01-01': { type: 'code', color: '#06B6D4' },   // 架构
  'IT-01-02': { type: 'shield', color: '#06B6D4' }, // 安全
  'IT-01-03': { type: 'search', color: '#06B6D4' }, // 情报
  'FIN-05': { type: 'chart', color: '#F59E0B' },    // 财账
  'OPR-06-01': { type: 'briefcase', color: '#EC4899' }, // 行政
}

function getRoleAccessory(memberId) {
  return roleAccessories[memberId] || null
}

// 绘制职业配件
function RoleAccessory({ type, color, scale }) {
  const ref = useRef()
  const glowRef = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      ref.current.position.y = 1.35 + Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15
    }
  })
  
  const s = scale || 1
  
  switch (type) {
    case 'crown':
      return (
        <group ref={ref} position={[0, 1.35, 0]}>
          <mesh scale={[0.15 * s, 0.12 * s, 0.15 * s]}>
            <boxGeometry />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[(i - 1.5) * 0.06 * s, 0.08 * s, 0]}>
              <boxGeometry args={[0.03 * s, 0.08 * s, 0.03 * s]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
      )
    case 'star':
      return (
        <group ref={ref} position={[0, 1.38, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.08 * s, 0.02 * s, 8, 5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh ref={glowRef}>
            <sphereGeometry args={[0.12 * s, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.15} />
          </mesh>
        </group>
      )
    case 'pen':
      return (
        <group ref={ref} position={[0.15, 1.2, 0.05]} rotation={[0, 0.3, 0.5]}>
          <mesh scale={[0.02 * s, 0.2 * s, 0.02 * s]}>
            <cylinderGeometry args={[1, 1, 1, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      )
    case 'brush':
      return (
        <group ref={ref} position={[-0.15, 1.2, 0.05]} rotation={[0, -0.3, -0.5]}>
          <mesh scale={[0.04 * s, 0.18 * s, 0.04 * s]}>
            <cylinderGeometry args={[1, 0.5, 1, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
        </group>
      )
    case 'chat':
      return (
        <mesh ref={ref} position={[0.18, 1.25, 0.1]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.06 * s, 16, 16, 0, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      )
    case 'headset':
      return (
        <group ref={ref} position={[0, 1.25, 0.1]}>
          <mesh>
            <torusGeometry args={[0.1 * s, 0.015 * s, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#333" roughness={0.8} />
          </mesh>
          <mesh position={[0.1 * s, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015 * s, 0.015 * s, 0.05 * s, 8]} />
            <meshStandardMaterial color="#333" roughness={0.8} />
          </mesh>
        </group>
      )
    case 'doc':
      return (
        <mesh ref={ref} position={[-0.18, 1.2, 0.08]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[0.08 * s, 0.1 * s, 0.01 * s]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      )
    case 'clipboard':
      return (
        <group ref={ref} position={[0.18, 1.15, 0.08]} rotation={[0, 0.3, 0]}>
          <mesh>
            <boxGeometry args={[0.1 * s, 0.13 * s, 0.015 * s]} />
            <meshStandardMaterial color="#666" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.07 * s, 0.01 * s]}>
            <boxGeometry args={[0.06 * s, 0.01 * s, 0.01 * s]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )
    case 'code':
      return (
        <mesh ref={ref} position={[0.15, 1.35, 0.08]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.06 * s, 0.012 * s, 6, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      )
    case 'shield':
      return (
        <mesh ref={ref} position={[-0.15, 1.3, 0.08]} rotation={[0.2, 0.5, 0]}>
          <octahedronGeometry args={[0.07 * s]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
        </mesh>
      )
    case 'search':
      return (
        <group ref={ref} position={[0, 1.4, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.06 * s, 0.012 * s, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.055 * s, -0.055 * s, 0]} rotation={[0, 0, 0.785]}>
            <boxGeometry args={[0.04 * s, 0.012 * s, 0.012 * s]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )
    case 'chart':
      return (
        <group ref={ref} position={[-0.12, 1.25, 0.1]}>
          <mesh>
            <boxGeometry args={[0.1 * s, 0.08 * s, 0.01 * s]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.03 + i * 0.03 * s, -0.02 + i * 0.02 * s, 0.01 * s]}>
              <boxGeometry args={[0.015 * s, 0.04 * s + i * 0.015 * s, 0.005 * s]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      )
    case 'briefcase':
      return (
        <mesh ref={ref} position={[0.12, 1.1, 0.08]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.1 * s, 0.07 * s, 0.04 * s]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      )
    default:
      return null
  }
}

function getLayout() {
  if (typeof window === 'undefined') {
    return [
      { id: 'CEO', x: 0, y: 7, level: 0 },
      { id: 'COO', x: 0, y: 4.5, level: 1 },
      { id: 'MKT', x: -5, y: 2, level: 2 },
      { id: 'SAL', x: 5, y: 2, level: 2 },
      { id: 'DEL', x: -5, y: -0.5, level: 3 },
      { id: 'IT', x: 5, y: -0.5, level: 3 },
      { id: 'FIN', x: -5, y: -3, level: 4 },
      { id: 'OPR', x: 5, y: -3, level: 4 },
    ]
  }
  
  const w = window.innerWidth
  const isNarrow = w < 600
  const isMedium = w < 900
  const scale = isNarrow ? 0.6 : isMedium ? 0.8 : 1
  
  return [
    { id: 'CEO', x: 0, y: 7 * scale, level: 0 },
    { id: 'COO', x: 0, y: 4.5 * scale, level: 1 },
    { id: 'MKT', x: -5 * scale, y: 2 * scale, level: 2 },
    { id: 'SAL', x: 5 * scale, y: 2 * scale, level: 2 },
    { id: 'DEL', x: -5 * scale, y: -0.5 * scale, level: 3 },
    { id: 'IT', x: 5 * scale, y: -0.5 * scale, level: 3 },
    { id: 'FIN', x: -5 * scale, y: -3 * scale, level: 4 },
    { id: 'OPR', x: 5 * scale, y: -3 * scale, level: 4 },
  ]
}

const levelColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4']

const connections = [
  { from: 'CEO', to: 'COO' },
  { from: 'COO', to: 'MKT' },
  { from: 'COO', to: 'SAL' },
  { from: 'MKT', to: 'DEL' },
  { from: 'SAL', to: 'IT' },
  { from: 'DEL', to: 'FIN' },
  { from: 'IT', to: 'OPR' },
]

function Person({ position, name, color, emissive, memberId, onClick, isSelected, taskProgress }) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const headRef = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { size } = useThree()
  
  const isNarrow = size.width < 600
  const accessory = getRoleAccessory(memberId)
  const hasActiveTask = taskProgress !== null && taskProgress !== undefined && taskProgress < 100
  
  useFrame((state) => {
    if (!groupRef.current) return
    
    const t = state.clock.elapsedTime
    const breathe = Math.sin(t * 1.5 + position[0] * 0.5) * 0.012
    const float = Math.sin(t * 0.8 + position[1] * 0.3) * 0.03
    const targetScale = isSelected ? 1.2 : hovered ? 1.12 : 1.0
    const targetEmissive = isSelected ? 0.7 : hovered ? 0.55 : 0.35
    
    const currentScale = groupRef.current.scale.x
    const newScale = currentScale + (targetScale - currentScale) * 0.12
    groupRef.current.scale.set(newScale, 1 + breathe, newScale)
    groupRef.current.position.y = position[1] + float
    
    if (bodyRef.current) {
      bodyRef.current.material.emissiveIntensity += (targetEmissive - bodyRef.current.material.emissiveIntensity) * 0.1
    }
    if (headRef.current) {
      headRef.current.material.emissiveIntensity += (targetEmissive - headRef.current.material.emissiveIntensity) * 0.1
    }
    
    if (glowRef.current) {
      glowRef.current.material.opacity = isSelected ? 0.15 + Math.sin(t * 3) * 0.05 : hovered ? 0.08 : 0
    }
  })
  
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }
  
  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'grab'
  }
  
  const scale = isNarrow ? 0.75 : 1
  const fontSize = isNarrow ? 0.16 : 0.22
  
  return (
    <group 
      ref={groupRef} 
      position={[position[0] * scale, position[1], position[2] || 0]} 
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      scale={[scale, scale, scale]}
    >
      {/* 光环 */}
      <mesh ref={glowRef} position={[0, 0.6, -0.1]}>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0} side={THREE.BackSide} />
      </mesh>
      
      {/* 身体 */}
      <mesh ref={bodyRef} position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      
      {/* 头部 */}
      <mesh ref={headRef} position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      
      {/* 职业配件 */}
      {accessory && <RoleAccessory type={accessory.type} color={accessory.color} scale={scale} />}
      
      {/* 任务进度指示器 */}
      {hasActiveTask && (
        <group position={[0, 1.55, 0]}>
          {/* 进度条背景 */}
          <mesh>
            <planeGeometry args={[0.5, 0.06]} />
            <meshBasicMaterial color="#27272a" transparent opacity={0.9} />
          </mesh>
          {/* 进度条前景 */}
          <mesh position={[-(0.25 - (taskProgress / 100) * 0.25), 0, 0.001]}>
            <planeGeometry args={[(taskProgress / 100) * 0.48, 0.04]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.95} />
          </mesh>
          {/* 进度文字 */}
          <Billboard position={[0, 0.1, 0.01]}>
            <Text fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle">
              ⚙️ {Math.round(taskProgress)}%
            </Text>
          </Billboard>
        </group>
      )}
      
      {/* 名字 */}
      <Billboard position={[0, hasActiveTask ? 2.0 : 1.85, 0]} follow={true}>
        <Text fontSize={fontSize} color="#fafafa" anchorX="center" anchorY="middle" outlineWidth={0.025} outlineColor="#000000">
          {name}
        </Text>
      </Billboard>
    </group>
  )
}

function ConnectionLine({ from, to }) {
  const lineRef = useRef()
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.15
    }
  })
  
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2))
  const angle = Math.atan2(to.x - from.x, to.y - from.y)
  
  return (
    <mesh ref={lineRef} position={[midX, midY, 0]} rotation={[0, 0, -angle]}>
      <boxGeometry args={[0.02, length || 0.5, 0.02]} />
      <meshStandardMaterial color="#3f3f46" transparent opacity={0.5} roughness={0.8} />
    </mesh>
  )
}

function DeptLabel({ x, y, icon, name, color }) {
  const { size } = useThree()
  const isNarrow = size.width < 600
  const scale = isNarrow ? 0.75 : 1
  const fontSize = isNarrow ? 0.26 : 0.34
  
  return (
    <Billboard position={[x * scale, y * scale, 0]}>
      <Text fontSize={fontSize} color={color} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
        {icon} {name}
      </Text>
    </Billboard>
  )
}

function LevelBar({ y, color }) {
  const barRef = useRef()
  const { size } = useThree()
  const isNarrow = size.width < 600
  const scale = isNarrow ? 0.6 : 1
  
  useFrame((state) => {
    if (barRef.current) {
      barRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.3 + y) * 0.05
    }
  })
  
  return (
    <mesh ref={barRef} position={[0, y * scale - 0.4, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[22 * scale, 0.012]} />
      <meshStandardMaterial color={color} transparent opacity={0.1} roughness={1} />
    </mesh>
  )
}

function Title3D() {
  const titleRef = useRef()
  const { size } = useThree()
  const isNarrow = size.width < 600
  const isMedium = size.width < 900
  
  useFrame((state) => {
    if (titleRef.current) {
      const t = state.clock.elapsedTime
      titleRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.03)
    }
  })
  
  const fontSize = isNarrow ? 0.5 : isMedium ? 0.7 : 0.9
  
  return (
    <Billboard position={[0, -5, 0]}>
      <group ref={titleRef}>
        <Text 
          fontSize={fontSize} 
          color="#ffffff" 
          anchorX="center" 
          anchorY="middle" 
          letterSpacing={0.05}
          fontWeight={600}
          transparent
          opacity={0.6}
        >
          纳灵AI智能团队
        </Text>
      </group>
    </Billboard>
  )
}

function Scene() {
  const { members, selectMember, selectedMember, executingTasks, tasks } = useOfficeStore()
  
  const orgLayout = useMemo(() => getLayout(), [])
  
  const layoutMap = useMemo(() => {
    const map = {}
    orgLayout.forEach(item => { map[item.id] = item })
    return map
  }, [orgLayout])
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[15, 25, 15]} intensity={1.0} />
      <directionalLight position={[-10, 10, -5]} intensity={0.3} />
      <pointLight position={[0, 8, 5]} intensity={0.5} color="#5b8dd9" />
      
      <StarDust />
      <DepthLines />
      <TopBeam />
      <CenterGlow />
      <DataCubes />
      <AmbientParticles />
      <Title3D />
      
      {orgLayout.map((item) => (
        <LevelBar key={item.id} y={item.y} color={levelColors[item.level]} />
      ))}
      
      {connections.map(conn => {
        const from = layoutMap[conn.from]
        const to = layoutMap[conn.to]
        if (!from || !to) return null
        return <ConnectionLine key={conn.from + '-' + conn.to} from={from} to={to} />
      })}
      
      {orgLayout.map((item) => {
        const dept = departments[item.id]
        const deptMembers = members.filter(m => m.department === item.id)
        
        return (
          <group key={item.id}>
            <DeptLabel 
              x={item.x} 
              y={item.y} 
              icon={dept?.icon} 
              name={dept?.name} 
              color={levelColors[item.level]}
            />
            
            {deptMembers.length === 1 ? (
              <Person
                position={[item.x, item.y, 0]}
                name={deptMembers[0].name}
                color={statusColors[deptMembers[0].status] || statusColors.offline}
                emissive={statusEmissive[deptMembers[0].status] || statusEmissive.offline}
                memberId={deptMembers[0].id}
                onClick={() => selectMember(deptMembers[0].id)}
                isSelected={selectedMember?.id === deptMembers[0].id}
                taskProgress={executingTasks[Object.keys(executingTasks).find(tid => {
                  const task = members.flatMap(d => d).find ? null : null
                  return false
                })]?.progress}
              />
            ) : (
              deptMembers.map((member, i) => {
                const spacing = 1.8
                const offset = (deptMembers.length - 1) * spacing / 2
                // 查找该成员正在执行的任务
                const memberTaskId = Object.keys(executingTasks).find(tid => {
                  const task = tasks?.find(t => t.id === tid)
                  return task?.assignee === member.id
                })
                const taskProgress = memberTaskId ? executingTasks[memberTaskId]?.progress : null
                return (
                  <Person
                    key={member.id}
                    position={[item.x + i * spacing - offset, item.y, 0]}
                    name={member.name}
                    color={statusColors[member.status] || statusColors.offline}
                    emissive={statusEmissive[member.status] || statusEmissive.offline}
                    memberId={member.id}
                    onClick={() => selectMember(member.id)}
                    isSelected={selectedMember?.id === member.id}
                    taskProgress={taskProgress}
                  />
                )
              })
            )}
          </group>
        )
      })}
    </>
  )
}

export default Scene
