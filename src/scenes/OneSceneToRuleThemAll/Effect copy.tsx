// @ts-nocheck
import React, { useRef, useEffect } from 'react'
import { useThree, useFrame, extend } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import * as THREE from 'three'
import Capsule from '../../elements/models/Capsule'
import { Vector3 } from 'three'

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
  const refMaterial = useRef<any>()
  const { gl, size, scene, camera } = useThree()

  const [target] = React.useMemo(() => {
    const target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
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

  // useFrame(state => {
  // capsuleRef.current && (capsuleRef.current.visible = false)
  // state.gl.setRenderTarget(target)
  // state.gl.render(scene, camera)

  // capsuleRef.current && (capsuleRef.current.visible = true)
  // state.gl.setRenderTarget(null)
  // state.gl.render(scene, camera)
  // if (ref.current) {
  //   ref.current.uniforms['depthTexture'].value = target.depthTexture
  //   ref.current.uniforms['projectionMatrixInverse'].value = camera.projectionMatrixInverse
  //   ref.current.uniforms['viewMatrixInverse'].value = camera.matrixWorld
  //   // ref.current.uniforms['time'].value = 1.5
  //   ref.current.uniforms['time'].value = state.clock.getElapsedTime()
  //   ref.current.uniforms['tDiffuse'].value = target.texture
  //   // console.log(state.clock.getElapsedTime());

  // }
  // composer.current.render()

  // }, 1)

  useFrame(state => {
    // console.log(refMaterial.current.uniforms['waterY'].value);
    
    // refMaterial.current.__r3f.parent.position.y = 0.2 + Math.abs(Math.sin(state.clock.getElapsedTime()))

    // capsuleRef.current && (capsuleRef.current.visible = true)
    state.gl.setRenderTarget(target)
    state.gl.render(scene, camera)

    // capsuleRef.current && (capsuleRef.current.visible = false)

    if (refMaterial.current) {
      refMaterial.current.uniforms['depthTexture'].value = target.depthTexture
      refMaterial.current.uniforms['tDiffuse'].value = target.texture
      refMaterial.current.uniforms['projectionMatrixInverse'].value = camera.projectionMatrixInverse
      refMaterial.current.uniforms['viewMatrixInverse'].value = camera.matrixWorld
      refMaterial.current.uniforms['cameraNear'].value = camera.near
      refMaterial.current.uniforms['cameraFar'].value = camera.position.distanceTo(
        refMaterial.current.__r3f.parent.position,
      )
      refMaterial.current.uniforms['waterY'].value = refMaterial.current.__r3f.parent.position.y
      refMaterial.current.uniforms['shallowColor'].value.set(0.498,0.678,0.792)
      refMaterial.current.uniforms['deepColor'].value.set(0.047,0.42,0.722)

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
      <Capsule ref={capsuleRef} />
      <Capsule position={[-0.7, 0, -1]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.5, 0]}>
        <planeGeometry args={[2, 3, 10, 10]} />
        <shaderMaterial
          ref={refMaterial}
          transparent={false}
          uniforms={{
            tDiffuse: { value: null },
            depthTexture: { value: null },
            projectionMatrixInverse: { value: camera.projectionMatrixInverse },
            viewMatrixInverse: { value: camera.matrixWorld },
            cameraNear: { value: null },
            cameraFar: { value: null },
            waterY: { value: 0 },
            shallowColor: { value: new Vector3(0.498,0.678,0.792) },
            deepColor: { value: new Vector3(0.047,0.42,0.722) },
          }}
          vertexShader={`
            varying vec2 vUv;
            varying vec4 vTexCoords;
            void main () {
                vUv = uv;
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectionPosition = projectionMatrix * viewPosition;

                gl_Position = projectionPosition;
                
                vTexCoords = projectionPosition;//projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
            }        
          `}
          fragmentShader={`
            #include <packing>
            varying vec2 vUv;
            varying vec4 vTexCoords;
            uniform sampler2D tDiffuse;
            uniform sampler2D depthTexture;
            uniform mat4 projectionMatrixInverse;
            uniform mat4 viewMatrixInverse;
            uniform float cameraNear;
			      uniform float cameraFar;
			      uniform float waterY;
			      uniform vec3 shallowColor;
			      uniform vec3 deepColor;

            vec3 worldCoordinatesFromDepth(float depth, vec2 vUv) {
              float z = depth * 2.0 - 1.0;
          
              vec4 clipSpaceCoordinate = vec4(vUv * 2.0 - 1.0, z, 1.0);
              vec4 viewSpaceCoordinate = projectionMatrixInverse * clipSpaceCoordinate;
          
              viewSpaceCoordinate /= viewSpaceCoordinate.w;
          
              vec4 worldSpaceCoordinates = viewMatrixInverse * viewSpaceCoordinate;
          
              return worldSpaceCoordinates.xyz;
            }

            float readDepth( sampler2D depthSampler, vec2 coord ) {
              float fragCoordZ = texture2D( depthSampler, coord ).x;
              float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
              return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
            }

            float invLerp(float from, float to, float value){
              return (value - from) / (to - from);
            }

            float remap(float origFrom, float origTo, float targetFrom, float targetTo, float value){
              float rel = invLerp(origFrom, origTo, value);
              return mix(targetFrom, targetTo, rel);
            }

            void main() {
              // fix perspective
              vec2 uv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;

              // depth for world position calc
              float depth = texture( depthTexture, uv ).x;
              vec3 worldPosition = worldCoordinatesFromDepth(depth, uv);

              // depth for coloring
              float accutedDepth = readDepth( depthTexture, uv );

              // solid paint and apply alpha
              vec4 maskText = vec4(0.0);
              maskText.rgb = vec3(accutedDepth);
              maskText.a = maskText.r;

              float offset = -0.1;// 0 is plane Y, lower values are bigger height of shallow color
              float fade = 0.05;
              float minMix = offset - fade;
              float maxMix = offset + fade;
              float mixValue = smoothstep(minMix, maxMix, worldPosition.y - waterY);

              vec4 shallowText = vec4(1.0);
              shallowText.rgb = shallowColor * (1.0 - maskText.a == 0.0 ? 0.0 : 1.0);
              shallowText.a = shallowText.r;

              vec4 sceneText = texture( tDiffuse, uv );
              vec4 underwaterText = vec4(0.0);
              underwaterText.rgb = sceneText.rgb * (1.0 - maskText.a == 0.2 ? 0.0 : 1.0);
              underwaterText.a = underwaterText.r;
              
              // water clearnest
              float clearness = 0.5;
              underwaterText.rgb = mix(underwaterText.rgb, deepColor, clearness);

              gl_FragColor = mix(underwaterText, shallowText, mixValue);

              float offsetDeep = -0.5;// 0 is plane Y minus the offset of shallow color, lower values are bigger height of underwater texture visible
              float fadeDeep = 0.2;
              float minMixDeep = offsetDeep - fadeDeep;
              float maxMixDeep = offsetDeep + fadeDeep;
              float mixValueDeep = smoothstep(minMixDeep, maxMixDeep, worldPosition.y - waterY - offset);

              vec4 deepText = vec4(0.0);
              deepText.rgb = deepColor;// * (1.0 - maskText.a == 0.0 ? 0.0 : 1.0);
              deepText.a = deepText.r;


              gl_FragColor = mix(deepText, gl_FragColor, mixValueDeep);
              // gl_FragColor = underwaterText;
              
            }
          `}
        />
      </mesh>
    </>
  )
}

export default Effects
