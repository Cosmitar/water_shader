import { GroupProps } from '@react-three/fiber'
import { forwardRef, createRef, MutableRefObject } from 'react'
import { Group } from 'three'

const Capsule = forwardRef((props: GroupProps, ref) => {
  const localRef = ref ?? createRef()
  return (
    <group {...props} name="pivot" ref={localRef as MutableRefObject<Group>}>
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshNormalMaterial wireframe={false} />
      </mesh>
    </group>
  )
})

export default Capsule
