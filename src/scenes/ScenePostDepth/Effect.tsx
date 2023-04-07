import { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame, extend } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import * as THREE from 'three'
import Capsule from '../../elements/models/Capsule'

extend({ EffectComposer, ShaderPass, RenderPass })

const shaderPass = {
  uniforms: {
    time: { value: 0 },
    tDiffuse: { value: null },
    depthTexture: { value: null },
    projectionMatrixInverse: { value: null },
    viewMatrixInverse: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main () {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }        
  `,
  fragmentShader: `
    uniform float time;
    uniform sampler2D tDiffuse;
    uniform sampler2D depthTexture;
    varying vec2 vUv;

    uniform mat4 projectionMatrixInverse;
    uniform mat4 viewMatrixInverse;


    vec3 worldCoordinatesFromDepth(float depth) {
      float z = depth * 2.0 - 1.0;
  
      vec4 clipSpaceCoordinate = vec4(vUv * 2.0 - 1.0, z, 1.0);
      vec4 viewSpaceCoordinate = projectionMatrixInverse * clipSpaceCoordinate;
  
      viewSpaceCoordinate /= viewSpaceCoordinate.w;
  
      vec4 worldSpaceCoordinates = viewMatrixInverse * viewSpaceCoordinate;
  
      return worldSpaceCoordinates.xyz;
    }

    float sphereSDF(vec3 p, float radius) {
      return length(p) - radius;
    }
    
    void main() {
      float depth = texture( depthTexture, vUv ).x;
      vec3 worldPosition = worldCoordinatesFromDepth(depth);
      float radius = mod(0.1 * time * 10.0, 3.0);

      float sphere = sphereSDF(worldPosition, radius);
      vec3 sceneColor = texture(tDiffuse, vUv).xyz;
      if ( sphere < 0.0) {
        gl_FragColor = vec4(0.0,1.0,0.0,1.0);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, sceneColor.rgb, clamp(abs(sphere * 5.5), 0., 1.));
      } else {
        gl_FragColor = vec4(sceneColor, 1.0);
      }
    }
  `,
}

const Effects = () => {
  const composer = useRef<any>()
  const ref = useRef<any>()
  const renderRef = useRef<any>()
  const capsuleRef = useRef<any>()
  const { gl, size, scene, camera } = useThree()

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
    composer.current?.setSize(size.width, size.height)
    console.log(composer.current)
    composer.current.addPass(renderRef.current)
    composer.current.addPass(ref.current)
  }, [size])

  useFrame(state => {
    // capsuleRef.current && (capsuleRef.current.visible = false)
    state.gl.setRenderTarget(target)
    state.gl.render(scene, camera)
    
    // capsuleRef.current && (capsuleRef.current.visible = true)
    state.gl.setRenderTarget(null)
    state.gl.render(scene, camera)
    if (ref.current) {
      ref.current.uniforms['depthTexture'].value = target.depthTexture
      ref.current.uniforms['projectionMatrixInverse'].value = camera.projectionMatrixInverse
      ref.current.uniforms['viewMatrixInverse'].value = camera.matrixWorld
      // ref.current.uniforms['time'].value = 1.5
      ref.current.uniforms['time'].value = state.clock.getElapsedTime()
      ref.current.uniforms['tDiffuse'].value = target.texture
      // console.log(state.clock.getElapsedTime());
      
    }
    composer.current.render()

  }, 1)

  return (<>
    <effectComposer ref={composer} args={[gl]}>
      <renderPass ref={renderRef} scene={scene} camera={camera} />
      <shaderPass ref={ref} args={[shaderPass]} needsSwap={true} renderToScreen={false} />
    </effectComposer>
    <Capsule ref={capsuleRef} />
  </>
  )
}

export default Effects
