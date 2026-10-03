// main.js - Fluxo principal e render loop

import { mat4Translation, mat4RotationZ, mat4Multiply, mat4Ortho, mat4LookAt } from './math.js';
import { shaderWGSL } from './shaders.js';
import { vertexData } from './geometry.js';

async function init() {
  const canvas = document.getElementById("webgpu-canvas");
  if (!navigator.gpu) {
    alert("WebGPU não é suportado neste navegador!");
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({ device, format });

  // Vertex Buffer
  const vertexBuffer = device.createBuffer({
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertexData);

  // Uniform Buffer
  const uniformBuffer = device.createBuffer({
    size: 4 * 16 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const shaderModule = device.createShaderModule({ code: shaderWGSL });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [{
      binding: 0,
      visibility: GPUShaderStage.VERTEX,
      buffer: { type: "uniform" }
    }]
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{
      binding: 0,
      resource: { buffer: uniformBuffer }
    }]
  });

  const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });
  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [{
        arrayStride: 7 * 4,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 3 * 4, format: "float32x4" }
        ]
      }]
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [{ format }]
    },
    primitive: { topology: "triangle-list" }
  });

  function render(time) {
    const t = time * 0.001;

    // 1. Movimento da Pipa
    const yKite = 0.8 * Math.sin(1.5 * t);
    const rotKite = 0.2 * Math.sin(2.2 * t);
    const mKite = mat4Multiply(mat4Translation(0, yKite, 0), mat4RotationZ(rotKite));

    // 2. Fita 1 da Cauda
    const rotFita1 = 0.35 * Math.sin(3.5 * t);
    let mFita1 = mat4Multiply(mKite, mat4Translation(0, -0.6, 0));
    mFita1 = mat4Multiply(mFita1, mat4RotationZ(rotFita1));

    // 3. Fita 2 da Cauda
    const rotFita2 = 0.45 * Math.sin(4.2 * t + 0.6);
    let mFita2 = mat4Multiply(mFita1, mat4Translation(0, -0.35, 0));
    mFita2 = mat4Multiply(mFita2, mat4RotationZ(rotFita2));

    // 4. Câmera
    const yCam = 0.5 * yKite;
    const viewMatrix = mat4LookAt(yCam);

    // 5. Projeção Ortográfica
    const projMatrix = mat4Ortho(-2.0, 2.0, -2.0, 2.0, -10.0, 10.0);
    const vpMatrix = mat4Multiply(projMatrix, viewMatrix);

    // Atualização do Uniform Buffer
    const mvpData = new Float32Array(64);
    mvpData.set(mat4Multiply(vpMatrix, mKite), 0);
    mvpData.set(mat4Multiply(vpMatrix, mKite), 16);
    mvpData.set(mat4Multiply(vpMatrix, mFita1), 32);
    mvpData.set(mat4Multiply(vpMatrix, mFita2), 48);

    device.queue.writeBuffer(uniformBuffer, 0, mvpData);

    // Render Pass
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.32, g: 0.64, b: 0.91, a: 1.0 },
        loadOp: "clear",
        storeOp: "store"
      }]
    });

    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.draw(12);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

init();