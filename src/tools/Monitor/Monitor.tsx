import { useThree } from "@react-three/fiber"
import { Perf } from "r3f-perf"

const Monitor = () => {
  const { width } = useThree(s => s.size)
  return (
    /* This is it -> */
    <Perf
      minimal={width < 712}
      matrixUpdate
      deepAnalyze
      overClock
      // customData={{
      //   value: 60,
      //   name: 'physic',
      //   info: 'fps'
      // }}
    />
  )
}

export default Monitor
