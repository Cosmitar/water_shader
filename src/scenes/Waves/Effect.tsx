import { useFrame } from '@react-three/fiber'
import { MutableRefObject, useMemo, useRef } from 'react'
import { ShaderMaterial } from 'three'

const Effects = () => {
  const materialRef = useRef<ShaderMaterial>() as MutableRefObject<ShaderMaterial>
  const uniforms = useMemo(
    () => ({
      // tDepth: { value: renderTarget.depthTexture },
      // cameraNear: { value: camera.near },
      // cameraFar: { value: camera.far },
      // viewMatrixInverse: { value: camera.matrixWorld },
      // projectionMatrixInverse: { value: camera.projectionMatrixInverse }
      uTime: { value: 0 },
    }),
    []
  )
  useFrame(({ clock }) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <planeGeometry args={[6, 6, 10, 10]} />
      {/* <meshBasicMaterial color={'peru'} /> */}
      <shaderMaterial
        ref={materialRef}
        // depthTest={false}
        depthWrite
        transparent={false}
        uniforms={uniforms}
        fragmentShader={`
        precision mediump float;
        uniform float uTime;
        varying vec2 vUv;
        
        #define ARRAY_SIZE 4

          vec2[2] bubbleSortByDistance(vec2[ARRAY_SIZE] arr, vec2 point) {
            for (int i = 0; i < ARRAY_SIZE - 1; i++) {
              for (int j = 0; j < ARRAY_SIZE - i - 1; j++) {
                if (distance(point, arr[j]) > distance(point, arr[j + 1])) {
                  vec2 temp = arr[j];
                  arr[j] = arr[j + 1];
                  arr[j + 1] = temp;
                }
              }
            }
            vec2[2] res;
            res[0] = arr[0];
            res[1] = arr[1];
            return res;
          }

          vec2 calculateClosestPointOnLine(vec2 P1, vec2 P2, vec2 P3) {
            vec2 v = P2 - P1;
            vec2 w = P3 - P1;
            
            float t = dot(w, v) / dot(v, v);
            t = clamp(t, 0.0, 1.0); // Ensure the closest point is within the line segment
            
            vec2 closest_point = P1 + t * v;
            
            return closest_point;
          }

          void main() {
            vec2[ARRAY_SIZE] points;

            points[0] = vec2(0.5, 0.25);
            points[1] = vec2(0.55, 0.25);
            points[2] = vec2(0.55, 0.30);
            points[3] = vec2(0.60, 0.35);
            
            vec2 vert[2] = bubbleSortByDistance(points, vUv);

            vec2 O0 = vert[0];
            vec2 O1 = vert[1];

            
            vec2 closestPoint = calculateClosestPointOnLine(O0, O1, vUv);

            float v1 = distance(vUv, closestPoint) / 0.05;
            float v2 = 1.0 - v1;
            float v3 = sin(v2 + uTime * 5.0);
            gl_FragColor = vec4(v3, v3, v3, 1.0);
          }
        `}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec4 modelPosition = modelMatrix * vec4(position, 1);
            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectionPosition = projectionMatrix * viewPosition;
          
            gl_Position = projectionPosition;
          }
        `}
      />
    </mesh>
  )
}

export default Effects
