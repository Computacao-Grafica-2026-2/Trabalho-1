// shaders.js - Vertex e Fragment Shaders em WGSL

export const shaderWGSL = /* wgsl */`
  struct Uniforms {
    mvpMatrices : array<mat4x4<f32>, 4>,
  };

  @group(0) @binding(0) var<uniform> uniforms : Uniforms;

  struct VertexInput {
    @location(0) position : vec3f,
    @location(1) color : vec4f,
    @builtin(vertex_index) vertexIndex : u32,
  };

  struct VertexOutput {
    @builtin(position) position : vec4f,
    @location(0) color : vec4f,
  };

  @vertex
  fn vertexMain(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;
    let triangleIndex = input.vertexIndex / 3u;
    let mvp = uniforms.mvpMatrices[triangleIndex];
    
    output.position = mvp * vec4f(input.position, 1.0);
    output.color = input.color;
    return output;
  }

  @fragment
  fn fragmentMain(input : VertexOutput) -> @location(0) vec4f {
    return input.color;
  }
`;