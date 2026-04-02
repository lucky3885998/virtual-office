import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import useOfficeStore from '../../stores/officeStore'
import { departments } from '../../data/members'

// 创建径向渐变贴图（白色，color属性会染色）
function createRadialGradientTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)')
  gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.1)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

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

// 会议室3D空间组件
function MeetingRoom3D({ roomId, roomConfig, participants }) {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      // 会议室轻微浮动
      groupRef.current.position.y = Math.sin(t * 0.3) * 0.02
    }
  })
  
  return (
    <group ref={groupRef} position={[6, 0, -5]}>
      {/* 会议室地板 */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color={roomConfig.color} transparent opacity={0.15} />
      </mesh>
      
      {/* 会议室边框 */}
      <mesh position={[0, 0, -1.5]}>
        <boxGeometry args={[4.2, 0.05, 0.05]} />
        <meshStandardMaterial color={roomConfig.color} emissive={roomConfig.color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[0.05, 0.05, 3.2]} />
        <meshStandardMaterial color={roomConfig.color} emissive={roomConfig.color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[0.05, 0.05, 3.2]} />
        <meshStandardMaterial color={roomConfig.color} emissive={roomConfig.color} emissiveIntensity={0.5} />
      </mesh>
      
      {/* 会议室名称 */}
      <Billboard position={[0, 1.5, 0]}>
        <Text fontSize={0.3} color={roomConfig.color} anchorX="center" anchorY="middle" fontWeight={600}>
          {roomConfig.icon} {roomConfig.name}
        </Text>
      </Billboard>
      
      {/* 参与者 */}
      {participants.map((participant, i) => {
        const angle = (i / Math.max(participants.length, 1)) * Math.PI * 2
        const radius = 1.2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={participant.id} position={[x, 0, z]}>
            {/* 参与者代表点 */}
            <mesh>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial 
                color={statusColors[participant.status] || '#3b82f6'} 
                emissive={statusColors[participant.status] || '#3b82f6'} 
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* 名字 */}
            <Billboard position={[0, 0.4, 0]}>
              <Text fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle">
                {participant.name}
              </Text>
            </Billboard>
            {/* 发言气泡 */}
            {i === 0 && (
              <Billboard position={[0, 0.7, 0]}>
                <Text fontSize={0.2} color="#22c55e" anchorX="center" anchorY="middle">
                  💬
                </Text>
              </Billboard>
            )}
          </group>
        )
      })}
      
      {/* 会议室人数 */}
      <Billboard position={[1.5, 1.2, 0]}>
        <Text fontSize={0.15} color="#a1a1aa" anchorX="center" anchorY="middle">
          {participants.length}/{roomConfig.capacity}人
        </Text>
      </Billboard>
    </group>
  )
}

// 部门聚焦视图 - 显示选中部门的成员
function DepartmentFocusView({ deptId, members, layout }) {
  const groupRef = useRef()
  const { selectMember, selectedMember, executingTasks, tasks } = useOfficeStore()
  
  const layoutItem = layout.find(l => l.id === deptId)
  if (!layoutItem) return null
  
  const deptMembers = members.filter(m => m.department === deptId)
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      groupRef.current.position.y = Math.sin(t * 0.3) * 0.05
    }
  })
  
  return (
    <group ref={groupRef}>
      {deptMembers.map((member, i) => {
        const spacing = 2.2
        const offset = (deptMembers.length - 1) * spacing / 2
        const x = layoutItem.x + i * spacing - offset
        const y = layoutItem.y
        
        const memberTaskId = Object.keys(executingTasks).find(tid => {
          const task = tasks?.find(t => t.id === tid)
          return task?.assignee === member.id
        })
        const taskProgress = memberTaskId ? executingTasks[memberTaskId]?.progress : null
        
        return (
          <Person
            key={member.id}
            position={[x, y, 0]}
            name={member.name}
            color={statusColors[member.status] || statusColors.offline}
            emissive={statusEmissive[member.status] || statusEmissive.offline}
            memberId={member.id}
            onClick={() => selectMember(member.id)}
            isSelected={selectedMember?.id === member.id}
            taskProgress={taskProgress}
            memberTitle={member.title}
            memberStatus={member.status}
          />
        )
      })}
    </group>
  )
}

function Person({ position, name, color, emissive, memberId, onClick, isSelected, taskProgress, memberTitle, memberStatus }) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const headRef = useRef()
  const glowRef = useRef()
  const leftShoulderRef = useRef()
  const leftForearmRef = useRef()
  const leftHandRef = useRef()
  const rightShoulderRef = useRef()
  const rightForearmRef = useRef()
  const rightHandRef = useRef()
  const leftLegRef = useRef()
  const leftFootRef = useRef()
  const leftFootPadRef = useRef()
  const rightLegRef = useRef()
  const rightFootRef = useRef()
  const rightFootPadRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const leftPupilRef = useRef()
  const rightPupilRef = useRef()
  const mouthRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { size } = useThree()
  
  const isNarrow = size.width < 600
  const responsiveScale = isNarrow ? 0.75 : 1
  const accessory = getRoleAccessory(memberId)
  const hasActiveTask = taskProgress !== null && taskProgress !== undefined && taskProgress < 100
  
  // 径向渐变贴图
  const gradientTexture = useMemo(() => createRadialGradientTexture(), [])
  
  // 状态图标和颜色
  const statusInfo = {
    working: { icon: '🟢', label: '工作中', textColor: '#22c55e', emoji: '😊' },
    idle: { icon: '🟡', label: '待命', textColor: '#eab308', emoji: '😐' },
    busy: { icon: '🔴', label: '忙碌', textColor: '#ef4444', emoji: '😓' },
    offline: { icon: '⚫', label: '离线', textColor: '#6b7280', emoji: '😶' }
  }
  const currentStatus = statusInfo[memberStatus] || statusInfo.offline
  
  useFrame((state) => {
    if (!groupRef.current) return
    
    const t = state.clock.elapsedTime
    const breathe = Math.sin(t * 1.5 + position[0] * 0.5) * 0.012
    const float = Math.sin(t * 0.8 + position[1] * 0.3) * 0.03
    
    // 缩放效果 - 靠近人物放大至1.30倍
    const targetScale = isSelected || hovered ? 1.30 : 1.0
    const targetEmissive = isSelected ? 0.7 : hovered ? 0.55 : 0.35
    
    const currentScale = groupRef.current.scale.x
    const newScale = currentScale + (targetScale - currentScale) * 0.12
    // 整体等比缩放（X/Y/Z同步）
    groupRef.current.scale.set(newScale * responsiveScale, newScale + breathe, newScale * responsiveScale)
    groupRef.current.position.y = position[1] + float
    
    if (bodyRef.current) {
      bodyRef.current.material.emissiveIntensity += (targetEmissive - bodyRef.current.material.emissiveIntensity) * 0.1
    }
    if (headRef.current) {
      headRef.current.material.emissiveIntensity += (targetEmissive - headRef.current.material.emissiveIntensity) * 0.1
    }
    
    // 脚底渐变光环动画 - Sprite方式
    const glowOpacity = isSelected ? 0.6 + Math.sin(t * 2) * 0.2 : hovered ? 0.35 + Math.sin(t * 3) * 0.1 : 0
    if (glowRef.current && glowRef.current.material) {
      glowRef.current.material.opacity = glowOpacity
      if (isSelected || hovered) {
        glowRef.current.scale.setScalar(1.3 + Math.sin(t * 2) * 0.1)
      } else {
        glowRef.current.scale.setScalar(1.3)
      }
    }
    
    // ==================== 全身动作系统（真实直观版）====================
    const T = t // 时间
    
    // 工作中：专注认真，稳定高效
    // 特征：身体微倾、头部前探、手臂弯曲打字、腿部稳定承重
    if (memberStatus === 'working') {
      // 身体：自然前倾+明显呼吸起伏
      if (bodyRef.current) {
        bodyRef.current.rotation.z = 0.08 + Math.sin(T * 0.6) * 0.04   // 前倾+呼吸起伏更强
        bodyRef.current.position.y = 0.5 + Math.sin(T * 0.5) * 0.02   // 呼吸起伏更强
      }
      
      // 头：前探看屏幕+明显思考偏头
      if (headRef.current) {
        headRef.current.rotation.x = 0.2 + Math.sin(T * 0.4) * 0.08   // 低头看屏幕
        headRef.current.rotation.y = Math.sin(T * 0.35) * 0.2         // 明显偏头思考
        headRef.current.position.y = 1.05 + Math.sin(T * 0.5) * 0.02  // 上下点头
      }
      
      // 眼睛：专注凝视+自然眨眼
      if (leftEyeRef.current) {
        leftEyeRef.current.visible = true
        leftEyeRef.current.scale.set(1, 1 + Math.sin(T * 0.4) * 0.35, 1)    // 眨眼幅度更大
        leftEyeRef.current.position.x = -0.065 + Math.sin(T * 0.5) * 0.025  // 眼珠微动
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.visible = true
        rightEyeRef.current.scale.set(1, 1 + Math.sin(T * 0.4 + 0.25) * 0.35, 1)
        rightEyeRef.current.position.x = 0.065 + Math.sin(T * 0.5 + 0.5) * 0.025
      }
      if (leftPupilRef.current) {
        leftPupilRef.current.visible = true
        leftPupilRef.current.scale.set(1, 1, 1)
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.visible = true
        rightPupilRef.current.scale.set(1, 1, 1)
      }
      
      // 嘴：微闭+明显微张（轻声自语或思考）
      if (mouthRef.current) {
        mouthRef.current.visible = true
        mouthRef.current.scale.set(1, 0.6 + Math.sin(T * 0.4) * 0.5, 1)  // 明显开合
      }
      
      // 左手：弯曲放在键盘上+明显移动
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.z = 0.3 + Math.sin(T * 0.7) * 0.08   // 肩膀明显微调
        leftShoulderRef.current.rotation.x = -0.1 + Math.sin(T * 0.5) * 0.05
      }
      if (leftForearmRef.current) {
        leftForearmRef.current.rotation.x = 0.2 + Math.sin(T * 0.8) * 0.18   // 手腕明显摆动
      }
      if (leftHandRef.current) {
        leftHandRef.current.position.set(-0.28 + Math.sin(T * 0.9) * 0.06, 0.22 + Math.sin(T * 0.7) * 0.08, 0.45)
      }
      
      // 右手：弯曲放在键盘上+与左手错开
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.z = -0.3 + Math.sin(T * 0.7 + 0.5) * 0.08
        rightShoulderRef.current.rotation.x = -0.1 + Math.sin(T * 0.5 + 0.4) * 0.05
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = 0.2 + Math.sin(T * 0.8 + 0.4) * 0.18
      }
      if (rightHandRef.current) {
        rightHandRef.current.position.set(0.28 + Math.sin(T * 0.9 + 0.5) * 0.06, 0.22 + Math.sin(T * 0.7 + 0.4) * 0.08, 0.45)
      }
      
      // 脚：稳定承重+明显重心转移
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(T * 0.4) * 0.05
        leftLegRef.current.position.y = 0.2 + Math.sin(T * 0.5) * 0.02
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = Math.sin(T * 0.4 + 0.7) * 0.05
        rightLegRef.current.position.y = 0.2 + Math.sin(T * 0.5 + 0.7) * 0.02
      }
      // 脚掌：随重心微调
      if (leftFootPadRef.current) {
        leftFootPadRef.current.position.y = 0.04 + Math.sin(T * 0.6) * 0.015
      }
      if (rightFootPadRef.current) {
        rightFootPadRef.current.position.y = 0.04 + Math.sin(T * 0.6 + 0.6) * 0.015
      }
    }
    
    // 忙碌：紧张工作状态，频繁操作键盘
    // 特征：身体前倾紧绷、手臂急促敲击、头部快速微动、脚尖轻敲地面
    if (memberStatus === 'busy') {
      const B = t // busy专用时间变量，更快更急促
      
      // 身体：紧绷前倾+微微晃动（压力感）
      if (bodyRef.current) {
        bodyRef.current.rotation.z = 0.08 + Math.sin(B * 3) * 0.015  // 前倾+小幅晃动
        bodyRef.current.position.y = 0.5 + Math.sin(B * 4) * 0.005   // 身体轻微起伏
      }
      
      // 头：快速小幅度左右微调（不断切换注意）
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(B * 4) * 0.2      // 快速小幅摇头
        headRef.current.rotation.x = 0.15 + Math.sin(B * 3) * 0.04  // 低头盯屏幕
        headRef.current.position.y = 1.05 + Math.sin(B * 5) * 0.008  // 轻微上下点头
      }
      
      // 眼睛：瞪大专注+快速轻微转动
      if (leftEyeRef.current) {
        leftEyeRef.current.visible = true
        leftEyeRef.current.scale.set(1.1, 1.2 + Math.sin(B * 4) * 0.1, 1)
        leftEyeRef.current.position.x = -0.065 + Math.sin(B * 5) * 0.008  // 眼珠微动
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.visible = true
        rightEyeRef.current.scale.set(1.1, 1.2 + Math.sin(B * 4 + 0.2) * 0.1, 1)
        rightEyeRef.current.position.x = 0.065 + Math.sin(B * 5 + 0.3) * 0.008
      }
      if (leftPupilRef.current) {
        leftPupilRef.current.visible = true
        leftPupilRef.current.scale.set(0.9, 0.9, 1)  // 瞳孔略收缩（专注）
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.visible = true
        rightPupilRef.current.scale.set(0.9, 0.9, 1)
      }
      
      // 嘴：紧闭或微微张开（专注屏息）
      if (mouthRef.current) {
        mouthRef.current.visible = true
        mouthRef.current.scale.set(0.9, 0.7 + Math.sin(B * 4) * 0.15, 1)  // 抿嘴+微张
      }
      
      // 左手：敲击键盘动作（急促上下）
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.z = 0.35 + Math.sin(B * 6) * 0.12   // 肩膀微抬
        leftShoulderRef.current.rotation.x = -0.15 + Math.sin(B * 8) * 0.06  // 手臂微抖
      }
      if (leftForearmRef.current) {
        leftForearmRef.current.rotation.x = 0.15 + Math.sin(B * 8) * 0.25  // 前臂急促上下
      }
      if (leftHandRef.current) {
        leftHandRef.current.position.set(-0.28, 0.2 + Math.sin(B * 10) * 0.08, 0.45)  // 手腕敲击
      }
      
      // 右手：敲击键盘动作（与左手错开）
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.z = -0.35 + Math.sin(B * 6 + 0.5) * 0.12
        rightShoulderRef.current.rotation.x = -0.15 + Math.sin(B * 8 + 0.3) * 0.06
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = 0.15 + Math.sin(B * 8 + 0.4) * 0.25
      }
      if (rightHandRef.current) {
        rightHandRef.current.position.set(0.28, 0.2 + Math.sin(B * 10 + 0.5) * 0.08, 0.45)
      }
      
      // 脚：脚尖轻敲地面（焦虑感）
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(B * 5) * 0.06
        leftLegRef.current.position.y = 0.2 + Math.abs(Math.sin(B * 5)) * 0.02
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.sin(B * 5 + Math.PI) * 0.06
        rightLegRef.current.position.y = 0.2 + Math.abs(Math.sin(B * 5 + Math.PI)) * 0.02
      }
      // 脚掌：轻敲节奏
      if (leftFootPadRef.current) {
        leftFootPadRef.current.position.y = 0.04 + Math.abs(Math.sin(B * 5)) * 0.015
      }
      if (rightFootPadRef.current) {
        rightFootPadRef.current.position.y = 0.04 + Math.abs(Math.sin(B * 5 + Math.PI)) * 0.015
      }
    }
    
    // 待命：休息放松，手自然下垂
    if (memberStatus === 'idle') {
      // 身体：直立放松+呼吸起伏
      if (bodyRef.current) {
        bodyRef.current.rotation.z = Math.sin(T * 0.4) * 0.01
        bodyRef.current.position.y = 0.5 + Math.sin(T * 0.5) * 0.005
      }
      // 头：向上看天/远方+缓慢转动
      if (headRef.current) {
        headRef.current.rotation.x = -0.15 + Math.sin(T * 0.3) * 0.02
        headRef.current.rotation.y = Math.sin(T * 0.5) * 0.1
      }
      // 眼：眯眼放松+缓慢眨眼
      if (leftEyeRef.current) {
        leftEyeRef.current.visible = true
        leftEyeRef.current.scale.set(0.9, 0.6 + Math.sin(T * 0.2) * 0.1, 1)
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.visible = true
        rightEyeRef.current.scale.set(0.9, 0.6 + Math.sin(T * 0.2 + 0.3) * 0.1, 1)
      }
      if (leftPupilRef.current) {
        leftPupilRef.current.visible = true
        leftPupilRef.current.scale.set(1, 1, 1)
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.visible = true
        rightPupilRef.current.scale.set(1, 1, 1)
      }
      // 嘴：微微张开（舒适）+缓慢呼吸
      if (mouthRef.current) {
        mouthRef.current.visible = true
        mouthRef.current.scale.set(1, 1.2 + Math.sin(T * 0.4) * 0.1, 1)
      }
      // 左手：自然下垂在身体两侧+缓慢摆动
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.z = 0.15 + Math.sin(T * 0.3) * 0.02
        leftShoulderRef.current.rotation.x = 0.2 + Math.sin(T * 0.25) * 0.01
      }
      if (leftForearmRef.current) {
        leftForearmRef.current.rotation.x = 0.3 + Math.sin(T * 0.35) * 0.02
      }
      if (leftHandRef.current) {
        leftHandRef.current.position.set(-0.25 + Math.sin(T * 0.25) * 0.01, -0.15 + Math.sin(T * 0.3) * 0.008, Math.sin(T * 0.2) * 0.01)
      }
      // 右手：自然下垂在身体两侧+缓慢摆动
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.z = -0.15 - Math.sin(T * 0.3) * 0.02
        rightShoulderRef.current.rotation.x = 0.2 + Math.sin(T * 0.25 + 0.4) * 0.01
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = 0.3 + Math.sin(T * 0.35 + 0.4) * 0.02
      }
      if (rightHandRef.current) {
        rightHandRef.current.position.set(0.25 + Math.sin(T * 0.25) * 0.01, -0.15 + Math.sin(T * 0.3 + 0.4) * 0.008, Math.sin(T * 0.2 + 0.3) * 0.01)
      }
      // 脚：双脚分开，轻松站立+轻微重心转移
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = 0.05 + Math.sin(T * 0.4) * 0.01
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -0.05 - Math.sin(T * 0.4) * 0.01
      }
    }
    
    // 离线：关机/无电，整个人垮掉
    if (memberStatus === 'offline') {
      // 身体：垮掉下垂+缓慢下沉
      if (bodyRef.current) {
        bodyRef.current.rotation.z = -0.15 + Math.sin(T * 0.15) * 0.01
        bodyRef.current.position.y = 0.47 + Math.sin(T * 0.1) * 0.003
      }
      // 头：完全垂下+缓慢摇晃（低头打瞌睡）
      if (headRef.current) {
        headRef.current.rotation.x = 0.5 + Math.sin(T * 0.2) * 0.01
        headRef.current.rotation.z = Math.sin(T * 0.15) * 0.02
      }
      // 眼睛：完全闭上（睡觉）
      if (leftEyeRef.current) {
        leftEyeRef.current.visible = false
        leftEyeRef.current.scale.set(0.001, 0.001, 0.001)
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.visible = false
        rightEyeRef.current.scale.set(0.001, 0.001, 0.001)
      }
      if (leftPupilRef.current) {
        leftPupilRef.current.visible = false
        leftPupilRef.current.scale.set(0.001, 0.001, 0.001)
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.visible = false
        rightPupilRef.current.scale.set(0.001, 0.001, 0.001)
      }
      // 嘴巴：闭嘴（睡觉）
      if (mouthRef.current) {
        mouthRef.current.visible = false
      }
      // 左手：完全无力下垂+缓慢摆动
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.z = 0.4 + Math.sin(T * 0.2) * 0.015
        leftShoulderRef.current.rotation.x = 0.4 + Math.sin(T * 0.15) * 0.01
      }
      if (leftForearmRef.current) {
        leftForearmRef.current.rotation.x = 0.6 + Math.sin(T * 0.25) * 0.02
      }
      if (leftHandRef.current) {
        leftHandRef.current.position.set(-0.3 + Math.sin(T * 0.15) * 0.01, -0.35 + Math.sin(T * 0.2) * 0.008, Math.sin(T * 0.1) * 0.005)
      }
      // 右手：完全无力下垂+缓慢摆动
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.z = -0.4 - Math.sin(T * 0.2) * 0.015
        rightShoulderRef.current.rotation.x = 0.4 + Math.sin(T * 0.15) * 0.01
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = 0.6 + Math.sin(T * 0.25) * 0.02
      }
      if (rightHandRef.current) {
        rightHandRef.current.position.set(0.3 + Math.sin(T * 0.15) * 0.01, -0.35 + Math.sin(T * 0.2) * 0.008, Math.sin(T * 0.1) * 0.005)
      }
      // 脚：无力站立+缓慢重心转移
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = 0.1 + Math.sin(T * 0.2) * 0.015
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -0.1 - Math.sin(T * 0.2) * 0.015
      }
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
  
  const fontSize = isNarrow ? 0.16 : 0.22
  
  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1], position[2] || 0]} 
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 脚底渐变光环 - 椭圆透视效果 */}
      <sprite ref={glowRef} position={[0, 0.02, 0]} rotation={[-0.3, 0, 0]} scale={[50, 12, 1]}>
        <spriteMaterial 
          map={gradientTexture}
          color={color} 
          transparent 
          opacity={0} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      
      {/* 身体 */}
      <mesh ref={bodyRef} position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      
      {/* 左腿 */}
      <mesh ref={leftLegRef} position={[-0.1, 0.2, 0]} rotation={[0.1, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.2, 8, 16]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      {/* 左脚 */}
      <mesh ref={leftFootRef} position={[-0.1, 0.06, 0.05]}>
        <boxGeometry args={[0.06, 0.035, 0.12]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      {/* 左脚掌 */}
      <mesh ref={leftFootPadRef} position={[-0.1, 0.04, 0.1]}>
        <boxGeometry args={[0.04, 0.015, 0.05]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      
      {/* 右腿 */}
      <mesh ref={rightLegRef} position={[0.1, 0.2, 0]} rotation={[-0.1, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.2, 8, 16]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      {/* 右脚 */}
      <mesh ref={rightFootRef} position={[0.1, 0.06, 0.05]}>
        <boxGeometry args={[0.06, 0.035, 0.12]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      {/* 右脚掌 */}
      <mesh ref={rightFootPadRef} position={[0.1, 0.04, 0.1]}>
        <boxGeometry args={[0.04, 0.015, 0.05]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      
      {/* 头部 */}
      <mesh ref={headRef} position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      
      {/* 左眼 - 放大眼球 */}
      <mesh ref={leftEyeRef} position={[-0.065, 1.09, 0.13]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* 左眼瞳孔 */}
      <mesh ref={leftPupilRef} position={[-0.065, 1.09, 0.165]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* 右眼 - 放大眼球 */}
      <mesh ref={rightEyeRef} position={[0.065, 1.09, 0.13]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* 右眼瞳孔 */}
      <mesh ref={rightPupilRef} position={[0.065, 1.09, 0.165]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* 嘴巴 - 形象设计 */}
      <group ref={mouthRef} position={[0, 0.96, 0.145]}>
        {/* 嘴巴背景（黑色） */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.09, 0.045, 0.02]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        {/* 上排牙齿 */}
        <mesh position={[0, 0.012, 0.01]}>
          <boxGeometry args={[0.07, 0.018, 0.015]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* 下排牙齿 */}
        <mesh position={[0, -0.012, 0.01]}>
          <boxGeometry args={[0.07, 0.018, 0.015]} />
          <meshBasicMaterial color="#f5f5f5" />
        </mesh>
        {/* 上嘴唇（红色圆弧） */}
        <mesh position={[0, 0.025, -0.005]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.045, 0.018, 12, 24, Math.PI]} />
          <meshBasicMaterial color="#e85d75" />
        </mesh>
        {/* 下嘴唇（红色圆弧） */}
        <mesh position={[0, -0.025, -0.005]} rotation={[-0.2, 0, 0]}>
          <torusGeometry args={[0.045, 0.018, 12, 24, Math.PI]} />
          <meshBasicMaterial color="#e85d75" />
        </mesh>
      </group>
      
      {/* 左臂组 - 从身体两侧出发 */}
      <group ref={leftShoulderRef} position={[-0.18, 0.72, 0]}>
        {/* 上臂 - 肩膀到手肘 */}
        <mesh position={[0, -0.14, 0]}>
          <capsuleGeometry args={[0.038, 0.18, 8, 16]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} />
        </mesh>
        {/* 前臂组 - 手肘 */}
        <group ref={leftForearmRef} position={[0, -0.28, 0.02]} rotation={[0.4, 0, 0]}>
          {/* 前臂 - 手肘到手腕 */}
          <mesh position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.03, 0.14, 8, 16]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} />
          </mesh>
          {/* 左手 */}
          <mesh ref={leftHandRef} position={[0, -0.25, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} />
          </mesh>
        </group>
      </group>
      
      {/* 右臂组 - 从身体两侧出发 */}
      <group ref={rightShoulderRef} position={[0.18, 0.72, 0]}>
        {/* 上臂 - 肩膀到手肘 */}
        <mesh position={[0, -0.14, 0]}>
          <capsuleGeometry args={[0.038, 0.18, 8, 16]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} />
        </mesh>
        {/* 前臂组 - 手肘 */}
        <group ref={rightForearmRef} position={[0, -0.28, 0.02]} rotation={[0.4, 0, 0]}>
          {/* 前臂 - 手肘到手腕 */}
          <mesh position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.03, 0.14, 8, 16]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} />
          </mesh>
          {/* 右手 */}
          <mesh ref={rightHandRef} position={[0, -0.25, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} />
          </mesh>
        </group>
      </group>
      
      {/* 放大触控区域 - 透明大球 */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      
      {/* 职业配件 */}
      <mesh ref={headRef} position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.25} metalness={0.25} />
      </mesh>
      
      {/* 职业配件 */}
      {accessory && <RoleAccessory type={accessory.type} color={accessory.color} scale={1} />}
      
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
      
      {/* 名字 - 悬停/选中时隐藏，避免与气泡重叠 */}
      {!(hovered || isSelected) && (
        <Billboard position={[0, hasActiveTask ? 2.0 : 1.85, 0]} follow={true}>
          <Text fontSize={fontSize} color="#fafafa" anchorX="center" anchorY="middle" outlineWidth={0.025} outlineColor="#000000">
            {name}
          </Text>
        </Billboard>
      )}
      
      {/* 悬停气泡提示 */}
      {(hovered || isSelected) && (
        <group position={[0, 2, 0]}>
          <Text fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle">
            {name}
          </Text>
          <Text fontSize={0.12} color="#a1a1aa" anchorX="center" anchorY="middle" position={[0, -0.2, 0]}>
            {memberTitle || '成员'}
          </Text>
          <Text fontSize={0.13} color={currentStatus.textColor} anchorX="center" anchorY="middle" position={[0, -0.4, 0]}>
            {currentStatus.icon} {currentStatus.label}
          </Text>
        </group>
      )}
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

function Scene({ isMobile = false }) {
  const { members, selectMember, selectedMember, executingTasks, tasks, viewMode, filterDepartment, meetingRooms, currentMeetingRoom } = useOfficeStore()
  
  const orgLayout = useMemo(() => getLayout(), [])
  
  const layoutMap = useMemo(() => {
    const map = {}
    orgLayout.forEach(item => { map[item.id] = item })
    return map
  }, [orgLayout])
  
  // 部门视图模式判断
  const isDepartmentView = viewMode === 'dept'
  const showAllDepts = !isDepartmentView || !filterDepartment
  
  // 会议室配置
  const MEETING_ROOMS = {
    'room-1': { id: 'room-1', name: '战略会议室', icon: '🏛️', color: '#f59e0b', capacity: 5 },
    'room-2': { id: 'room-2', name: '协作空间', icon: '💬', color: '#3b82f6', capacity: 8 },
    'room-3': { id: 'room-3', name: '创意工坊', icon: '💡', color: '#10b981', capacity: 6 }
  }
  
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
      {showAllDepts && <Title3D />}
      
      {orgLayout.map((item) => (
        <LevelBar key={item.id} y={item.y} color={levelColors[item.level]} />
      ))}
      
      {showAllDepts && connections.map(conn => {
        const from = layoutMap[conn.from]
        const to = layoutMap[conn.to]
        if (!from || !to) return null
        return <ConnectionLine key={conn.from + '-' + conn.to} from={from} to={to} />
      })}
      
      {/* 3D 会议室显示 - 全部视图时显示 */}
      {showAllDepts && Object.entries(meetingRooms).map(([roomId, participants]) => {
        if (!participants || participants.length === 0) return null
        const roomConfig = MEETING_ROOMS[roomId]
        if (!roomConfig) return null
        return (
          <MeetingRoom3D 
            key={roomId} 
            roomId={roomId} 
            roomConfig={roomConfig} 
            participants={participants}
          />
        )
      })}
      
      {/* 部门视图模式 - 显示选中部门的成员 */}
      {isDepartmentView && filterDepartment && (
        <DepartmentFocusView 
          deptId={filterDepartment} 
          members={members} 
          layout={orgLayout}
        />
      )}
      
      {/* 全部视图模式 */}
      {showAllDepts && orgLayout.map((item) => {
        const dept = departments[item.id]
        const deptMembers = members.filter(m => m.department === item.id)
        
        return (
          <group key={item.id}>
            <DeptLabel 
              x={item.x} 
              y={item.y - 0.2} 
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
                memberTitle={deptMembers[0].title}
                memberStatus={deptMembers[0].status}
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
                    memberTitle={member.title}
                    memberStatus={member.status}
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
