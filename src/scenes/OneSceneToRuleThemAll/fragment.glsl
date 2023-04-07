#include <packing>
varying vec2 vUv;
varying vec4 vTexCoords;
varying vec4 vTextWorldCoords;
uniform sampler2D tDiffuse;
uniform sampler2D depthTexture;
uniform sampler2D foamNoise;
uniform mat4 projectionMatrixInverse;
uniform mat4 viewMatrixInverse;
uniform float cameraNear;
uniform float cameraFar;
uniform float waterY;
uniform vec3 shallowColor;
uniform vec3 deepColor;
uniform float iTime;

// FOAM
// vec4 WATER_COL = vec4(1.0);
vec4 WATER_COL = vec4(0.18, 0.64, 0.85, 1.0);
vec4 WATER2_COL = vec4(0.05, 0.53, 0.78, 1.0);
vec4 FOAM_COL = vec4(1.0);
// vec4 FOAM_COL = vec4(0.8125, 0.9609, 0.9648, 1.0);
float distortion_speed = 2.0;
vec2 tile = vec2(10.0, 15.0);
// float wave_speed ;
const float TWOPI = 6.283185307;
const float SIXPI = 18.84955592;

vec3 worldCoordinatesFromDepth(float depth, vec2 vUv) {
  float z = depth * 2.0 - 1.0;

  vec4 clipSpaceCoordinate = vec4(vUv * 2.0 - 1.0, z, 1.0);
  vec4 viewSpaceCoordinate = projectionMatrixInverse * clipSpaceCoordinate;

  viewSpaceCoordinate /= viewSpaceCoordinate.w;

  vec4 worldSpaceCoordinates = viewMatrixInverse * viewSpaceCoordinate;

  return worldSpaceCoordinates.xyz;
}

float readDepth(sampler2D depthSampler, vec2 coord) {
  float fragCoordZ = texture2D(depthSampler, coord).x;
  float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
  return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

float invLerp(float from, float to, float value) {
  return (value - from) / (to - from);
}

float remap(float origFrom, float origTo, float targetFrom, float targetTo, float value) {
  float rel = invLerp(origFrom, origTo, value);
  return mix(targetFrom, targetTo, rel);
}

float circ(vec2 pos, vec2 c, float s) {

  c = abs(pos - c);

  c = min(c, 1.0 - c);

  return smoothstep(0.0, 0.002, sqrt(s) - sqrt(dot(c, c))) * -1.0;

}

float waterlayer(vec2 uv) {

  uv = mod(uv, 1.0); // Clamp to [0..1]

  float ret = 1.0;

  ret += circ(uv, vec2(0.37378, 0.277169), 0.0268181);

  ret += circ(uv, vec2(0.0317477, 0.540372), 0.0193742);

  ret += circ(uv, vec2(0.430044, 0.882218), 0.0232337);

  ret += circ(uv, vec2(0.641033, 0.695106), 0.0117864);

  ret += circ(uv, vec2(0.0146398, 0.0791346), 0.0299458);

  ret += circ(uv, vec2(0.43871, 0.394445), 0.0289087);

  ret += circ(uv, vec2(0.909446, 0.878141), 0.028466);

  ret += circ(uv, vec2(0.310149, 0.686637), 0.0128496);

  ret += circ(uv, vec2(0.928617, 0.195986), 0.0152041);

  ret += circ(uv, vec2(0.0438506, 0.868153), 0.0268601);

  ret += circ(uv, vec2(0.308619, 0.194937), 0.00806102);

  ret += circ(uv, vec2(0.349922, 0.449714), 0.00928667);

  ret += circ(uv, vec2(0.0449556, 0.953415), 0.023126);

  ret += circ(uv, vec2(0.117761, 0.503309), 0.0151272);

  ret += circ(uv, vec2(0.563517, 0.244991), 0.0292322);

  ret += circ(uv, vec2(0.566936, 0.954457), 0.00981141);

  ret += circ(uv, vec2(0.0489944, 0.200931), 0.0178746);

  ret += circ(uv, vec2(0.569297, 0.624893), 0.0132408);

  ret += circ(uv, vec2(0.298347, 0.710972), 0.0114426);

  ret += circ(uv, vec2(0.878141, 0.771279), 0.00322719);

  ret += circ(uv, vec2(0.150995, 0.376221), 0.00216157);

  ret += circ(uv, vec2(0.119673, 0.541984), 0.0124621);

  ret += circ(uv, vec2(0.629598, 0.295629), 0.0198736);

  ret += circ(uv, vec2(0.334357, 0.266278), 0.0187145);

  ret += circ(uv, vec2(0.918044, 0.968163), 0.0182928);

  ret += circ(uv, vec2(0.965445, 0.505026), 0.006348);

  ret += circ(uv, vec2(0.514847, 0.865444), 0.00623523);

  ret += circ(uv, vec2(0.710575, 0.0415131), 0.00322689);

  ret += circ(uv, vec2(0.71403, 0.576945), 0.0215641);

  ret += circ(uv, vec2(0.748873, 0.413325), 0.0110795);

  ret += circ(uv, vec2(0.0623365, 0.896713), 0.0236203);

  ret += circ(uv, vec2(0.980482, 0.473849), 0.00573439);

  ret += circ(uv, vec2(0.647463, 0.654349), 0.0188713);

  ret += circ(uv, vec2(0.651406, 0.981297), 0.00710875);

  ret += circ(uv, vec2(0.428928, 0.382426), 0.0298806);

  ret += circ(uv, vec2(0.811545, 0.62568), 0.00265539);

  ret += circ(uv, vec2(0.400787, 0.74162), 0.00486609);

  ret += circ(uv, vec2(0.331283, 0.418536), 0.00598028);

  ret += circ(uv, vec2(0.894762, 0.0657997), 0.00760375);

  ret += circ(uv, vec2(0.525104, 0.572233), 0.0141796);

  ret += circ(uv, vec2(0.431526, 0.911372), 0.0213234);

  ret += circ(uv, vec2(0.658212, 0.910553), 0.000741023);

  ret += circ(uv, vec2(0.514523, 0.243263), 0.0270685);

  ret += circ(uv, vec2(0.0249494, 0.252872), 0.00876653);

  ret += circ(uv, vec2(0.502214, 0.47269), 0.0234534);

  ret += circ(uv, vec2(0.693271, 0.431469), 0.0246533);

  ret += circ(uv, vec2(0.415, 0.884418), 0.0271696);

  ret += circ(uv, vec2(0.149073, 0.41204), 0.00497198);

  ret += circ(uv, vec2(0.533816, 0.897634), 0.00650833);

  ret += circ(uv, vec2(0.0409132, 0.83406), 0.0191398);

  ret += circ(uv, vec2(0.638585, 0.646019), 0.0206129);

  ret += circ(uv, vec2(0.660342, 0.966541), 0.0053511);

  ret += circ(uv, vec2(0.513783, 0.142233), 0.00471653);

  ret += circ(uv, vec2(0.124305, 0.644263), 0.00116724);

  ret += circ(uv, vec2(0.99871, 0.583864), 0.0107329);

  ret += circ(uv, vec2(0.894879, 0.233289), 0.00667092);

  ret += circ(uv, vec2(0.246286, 0.682766), 0.00411623);

  ret += circ(uv, vec2(0.0761895, 0.16327), 0.0145935);

  ret += circ(uv, vec2(0.949386, 0.802936), 0.0100873);

  ret += circ(uv, vec2(0.480122, 0.196554), 0.0110185);

  ret += circ(uv, vec2(0.896854, 0.803707), 0.013969);

  ret += circ(uv, vec2(0.292865, 0.762973), 0.00566413);

  ret += circ(uv, vec2(0.0995585, 0.117457), 0.00869407);

  ret += circ(uv, vec2(0.377713, 0.00335442), 0.0063147);

  ret += circ(uv, vec2(0.506365, 0.531118), 0.0144016);

  ret += circ(uv, vec2(0.408806, 0.894771), 0.0243923);

  ret += circ(uv, vec2(0.143579, 0.85138), 0.00418529);

  ret += circ(uv, vec2(0.0902811, 0.181775), 0.0108896);

  ret += circ(uv, vec2(0.780695, 0.394644), 0.00475475);

  ret += circ(uv, vec2(0.298036, 0.625531), 0.00325285);

  ret += circ(uv, vec2(0.218423, 0.714537), 0.00157212);

  ret += circ(uv, vec2(0.658836, 0.159556), 0.00225897);

  ret += circ(uv, vec2(0.987324, 0.146545), 0.0288391);

  ret += circ(uv, vec2(0.222646, 0.251694), 0.00092276);

  ret += circ(uv, vec2(0.159826, 0.528063), 0.00605293);

  return max(ret, 0.0);

}

vec3 water(vec2 uv, vec3 cdir, float iTime) {

  uv *= vec2(0.25);

    // Parallax height distortion with two directional waves at

    // slightly different angles.

  vec2 a = 0.025 * cdir.xz / cdir.y; // Parallax offset

  float h = sin(uv.x + iTime); // Height at UV

  uv += a * h;

  h = sin(0.841471 * uv.x - 0.540302 * uv.y + iTime);

  uv += a * h;

    // Texture distortion

  float d1 = mod(uv.x + uv.y, TWOPI);

  float d2 = mod((uv.x + uv.y + 0.25) * 1.3, SIXPI);

  d1 = iTime * 0.07 + d1;

  d2 = iTime * 0.5 + d2;

  vec2 dist = vec2(sin(d1) * 0.15 + sin(d2) * 0.05, cos(d1) * 0.15 + cos(d2) * 0.05);

  vec3 ret = mix(WATER_COL.rgb, WATER2_COL.rgb, waterlayer(uv + dist.xy));

  ret = mix(ret, FOAM_COL.rgb, waterlayer(vec2(1.0) - uv - dist.yx));

  return ret;

}
float getFoamMask(vec2 _uv) {
  // depth for world position calc
  float depth = texture(depthTexture, _uv).x;
  // maskText.rgb = vec3(1.0 - readDepth(depthTexture, uv));
  // use original uv, not the distorted one
  vec3 worldPosition = worldCoordinatesFromDepth(depth, _uv);

  return worldPosition.y < waterY && worldPosition.y > waterY - 0.015 ? 1. - depth : 0.0;
  
}
vec3 bloomBlur(sampler2D text, vec2 uv) {
  bool horizontal = true;
  float weight[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
  // vec2 tex_offset = 1.0 / vec2(1024.0, 1024.0); // textureSize(uTexture, 0); // gets size of single texel
  vec2 tex_offset = 1.0 / vec2(512.0, 256.0); // textureSize(uTexture, 0); // gets size of single texel

  // TODO: discard texels below water surface
  vec3 result = vec3(getFoamMask(uv)) * 1.0;//weight[0]; // current fragment's contribution

  if(horizontal) {
    for(int i = 1; i < 5; ++i) {
      result += vec3(getFoamMask(uv + vec2(tex_offset.x * float(i), 0.0))) * 1.0;//weight[i];
      result += vec3(getFoamMask(uv - vec2(tex_offset.x * float(i), 0.0))) * 1.0;//weight[i];
      // result += texture2D(text, uv + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
      // result += texture2D(text, uv - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
    }
  } else {
    for(int i = 1; i < 5; ++i) {
      result += texture2D(text, uv + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
      result += texture2D(text, uv - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
    }
  }

  return result;
}
void main() {
  // fix perspective
  vec2 uv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;

  vec2 newUv = uv;
  // DISTORT
  // float amp = 0.0;
  // float hStretch = 100.0;
  // float vShift = 0.50;
  // float speed = 10.0;
  // newUv.x = uv.x + sin(vUv.y * hStretch + iTime * speed) / 100.0 * vShift;
  // // newUv.x = amp + sin(hStretch * (uv.y * 10.0 + iTime))/100.0 + vShift;
  // float newUvY = vUv.y + sin(vUv.x * hStretch + iTime * speed) / 100.0 * vShift;

  // depth for world position calc
  float depth = texture(depthTexture, uv).x;
  // use original uv, not the distorted one
  vec3 worldPosition = worldCoordinatesFromDepth(depth, uv);

  // depth for coloring
  // float accutedDepth = readDepth(depthTexture, uv);

  // NO FOAM MASK: solid paint and apply alpha
  vec4 maskText = vec4(0.0);
  maskText.rgb = vec3(1.0 - readDepth(depthTexture, uv));
  maskText.a = worldPosition.y < waterY && worldPosition.y > waterY - 0.05 ? 1. - maskText.r : 0.0;

  // FOAM MASK
  vec4 maskFoam = vec4(0.0);
  vec3 glow = bloomBlur(depthTexture, uv);
  
  maskFoam.rgb = vec3(1.0);
  maskFoam.a = glow.r;

  gl_FragColor = vec4(deepColor, 1.0);
  // scene depth
  // gl_FragColor = vec4(maskText.rgb, 1.0);
  // vertical depth from water Y pasition
  float vDepth = remap(0.0, 1.0, waterY - worldPosition.y, waterY - worldPosition.y + 5.0, waterY - worldPosition.y);
  // gl_FragColor = vec4(1.0 - vec3(vDepth), 1.0);

  float SCALE = 0.095;

  // SHALLOW WATER
  vec4 sceneText = texture(tDiffuse, newUv);
  vec4 underwaterText = vec4(0.0);
  underwaterText.rgb = sceneText.rgb * (1.0 - maskText.a == 0.2 ? 0.0 : 1.0);
  underwaterText.a = maskText.a;

  // water clearnest
  float clearness = 0.5;
  underwaterText.rgb = mix(shallowColor, deepColor, clearness);

  // DEEP WATER
  float offsetDeep = -0.5 * SCALE;// 0 is plane Y minus the offset of shallow color, lower values are bigger height of underwater texture visible
  float fadeDeep = 0.75 * SCALE;
  float minMixDeep = offsetDeep - fadeDeep;
  float maxMixDeep = offsetDeep + fadeDeep;
  float mixValueDeep = smoothstep(minMixDeep, maxMixDeep, worldPosition.y - waterY - offsetDeep);
  // float mixValueDeep = smoothstep(minMixDeep, maxMixDeep, worldPosition.y - waterY - offsetDeep);

  // gl_FragColor.rgb = mix(deepColor, underwaterText.rgb, mixValueDeep);

  // SURFACE (FOAM INTERSECTION)
  float offset = -0.15 * SCALE;// 0 is plane Y, lower values are bigger height of shallow color
  float fade = 0.75 * SCALE;
  float minMix = offset - fade;
  float maxMix = offset + fade;
  float mixValue = smoothstep(minMix, maxMix, (worldPosition.y - waterY));
  // float mixValue = remap(minMix, maxMix, 0.0, 1.0, smoothstep(minMix, maxMix, (worldPosition.y - waterY)));
  float solidMixValue = smoothstep(minMix, maxMix, (worldPosition.y - waterY));
  vec4 noise = texture(foamNoise, (vec2(vUv.x, vUv.y - iTime * 0.05)) * 3.0);
  vec4 sharpenNoise = vec4((1.0 - noise.r * 3.0));// > 0.0 ? vec4(1.0) : vec4(0.0);
  vec4 borderFoamText = vec4(1.0);
  borderFoamText.a = sharpenNoise.r * maskText.a + maskFoam.a * 50.;

  vec4 currentFoam = vec4(0.0);
  currentFoam.rgb = vec3(water(vUv * tile + iTime * vec2(0, -1), vec3(0, 1, 0), iTime * distortion_speed));
  gl_FragColor.rgb = mix(gl_FragColor.rgb, currentFoam.rgb, currentFoam.rgb == WATER_COL.rgb ? 0.0 : 1.0);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), borderFoamText.a > 0.0 ? 1.0 : 0.0);
  // gl_FragColor.rgb = borderFoamText.rgb;
  
  // gl_FragColor.rgb = vec3(1.0);
  // gl_FragColor.a = borderFoamText.a;

  // gl_FragColor.rgb = vec3(glow.r);
  // gl_FragColor.a = 1.0 -glow.r;
  // gl_FragColor.a = 1.0 - VAR_DISTANCE;
}
