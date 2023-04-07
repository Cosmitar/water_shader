import { useRef, useEffect, memo, useMemo } from 'react'
import { useThree, useFrame, extend } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import * as THREE from 'three'
// @ts-ignore
import Capsule from '../../elements/models/Capsule'
import { Vector3 } from 'three'
// @ts-ignore
import vertexShader from './vertex.glsl'
// @ts-ignore
import fragmentShader from './fragment.glsl'
import { RiverModel } from '../../elements/models/RiverModel'
// @ts-ignore
import noise from '../../../public/assets/intersection-foam-texture.png'

const loader = new THREE.TextureLoader()
const noiseTexture = loader.load(noise)
noiseTexture.wrapS = THREE.RepeatWrapping
noiseTexture.wrapT = THREE.RepeatWrapping

extend({ EffectComposer, ShaderPass, RenderPass })

const Effects = () => {
  // const composer = useRef<any>()
  // const ref = useRef<any>()
  // const renderRef = useRef<any>()
  // const capsuleRef = useRef<any>()
  const refMaterial = useRef<any>()
  const { size, scene, camera } = useThree()

  const [target] = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      depthBuffer: true,
      depthTexture: new THREE.DepthTexture(1000, 1000),
    })
    return [target]
  }, [])

  useEffect(() => {
    // composer.current?.setSize(size.width, size.height)
    // composer.current.addPass(renderRef.current)
    // composer.current.addPass(ref.current)
  }, [size])

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      tDiffuse: { value: null },
      depthTexture: { value: null },
      projectionMatrixInverse: { value: camera.projectionMatrixInverse },
      viewMatrixInverse: { value: camera.matrixWorld },
      cameraNear: { value: null },
      cameraFar: { value: null },
      waterY: { value: 0 },
      shallowColor: { value: new Vector3(0.498, 0.678, 0.792) },
      deepColor: { value: new Vector3(0.047, 0.42, 0.722) },
      foamNoise: { value: noiseTexture },
    }),
    []
  )

  useFrame(state => {
    // console.log(refMaterial.current.uniforms['waterY'].value);

    // refMaterial.current.__r3f.parent.position.y = 0.2 + Math.abs(Math.sin(state.clock.getElapsedTime()))

    // capsuleRef.current && (capsuleRef.current.visible = true)
    state.gl.setRenderTarget(target)
    state.gl.render(scene, camera)

    // capsuleRef.current && (capsuleRef.current.visible = false)

    if (refMaterial.current) {
      refMaterial.current.uniforms['iTime'].value = state.clock.getElapsedTime()
      refMaterial.current.uniforms['depthTexture'].value = target.depthTexture
      refMaterial.current.uniforms['tDiffuse'].value = target.texture
      refMaterial.current.uniforms['projectionMatrixInverse'].value = camera.projectionMatrixInverse
      refMaterial.current.uniforms['viewMatrixInverse'].value = camera.matrixWorld
      refMaterial.current.uniforms['cameraNear'].value = camera.near
      refMaterial.current.uniforms['cameraFar'].value = 100//camera.position.distanceTo(refMaterial.current.__r3f.parent.position)
      refMaterial.current.uniforms['waterY'].value = refMaterial.current.__r3f.parent.position.y
      refMaterial.current.uniforms['shallowColor'].value.set(0.498, 0.678, 0.792)
      refMaterial.current.uniforms['deepColor'].value.set(0.047, 0.42, 0.722)
    }

    state.gl.setRenderTarget(null)
    state.gl.render(scene, camera)
  })

  return (
    <>
      {/* <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" ref={renderRef} scene={scene} camera={camera} />
      <shaderPass attachArray="passes" ref={ref} args={[shaderPass]} needsSwap={true} renderToScreen={false} />
    </effectComposer> */}
      <RiverModel
        waterMaterial={
          <shaderMaterial
            ref={refMaterial}
            transparent={false}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
          />
        }
      />
    </>
  )
}

export default Effects
