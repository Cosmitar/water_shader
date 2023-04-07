varying vec2 vUv;
varying vec4 vTexCoords;
uniform float iTime;

vec3 GerstnerWave(vec3 position, float steepness, float wavelength, float speed, float direction, vec3 tangent, vec3 binormal) {
  direction = direction * 2.0 - 1.0;
  vec2 d = normalize(vec2(cos(3.14 * direction), sin(3.14 * direction)));
  float k = 2.0 * 3.14 / wavelength;
  float f = k * (dot(d, position.xz) - speed * iTime);
  float a = steepness / k;

  tangent += vec3(-d.x * d.x * (steepness * sin(f)), d.x * (steepness * cos(f)), -d.x * d.y * (steepness * sin(f)));

  binormal += vec3(-d.x * d.y * (steepness * sin(f)), d.y * (steepness * cos(f)), -d.y * d.y * (steepness * sin(f)));

  return vec3(d.x * (a * cos(f)), a * sin(f), d.y * (a * cos(f)));
}

// void GerstnerWaves_float(float3 position, float steepness, float wavelength, float speed, float4 directions, out float3 Offset, out float3 normal) {
//   Offset = 0;
//   float3 tangent = float3(1, 0, 0);
//   float3 binormal = float3(0, 0, 1);

//   Offset += GerstnerWave(position, steepness, wavelength, speed, directions.x, tangent, binormal);
//   Offset += GerstnerWave(position, steepness, wavelength, speed, directions.y, tangent, binormal);
//   Offset += GerstnerWave(position, steepness, wavelength, speed, directions.z, tangent, binormal);
//   Offset += GerstnerWave(position, steepness, wavelength, speed, directions.w, tangent, binormal);

//   normal = normalize(cross(binormal, tangent));
//     //TBN = transpose(float3x3(tangent, binormal, normal));
// }
void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  vec3 offset = GerstnerWave(position, 1.0, 1.5, 0.5, 0.5, vec3(0.15, 0.0, 0.0), vec3(0.0, 0.10, 0.0))*0.2;
  gl_Position = projectionPosition;// + vec4(offset, 0.0);

  vTexCoords = projectionPosition;//projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}