/**
 * VEDA v30.0: WebGPU Acceleration Manifold
 * Offloads heavy HDC Matrix multiplications to the local GPU.
 */

export class VedaGpuCompute {
  private device: GPUDevice | null = null;
  private pipeline: GPUComputePipeline | null = null;

  async initialize() {
    if (!navigator.gpu) {
      console.warn("[VEDA_GPU] WebGPU not supported on this device. Falling back to CPU.");
      return false;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return false;

    this.device = await adapter.requestDevice();
    
    // Shader to calculate Dot Product for 1024-dim vectors in parallel
    const shaderModule = this.device.createShaderModule({
      code: `
        @group(0) @binding(0) var<storage, read> hv1: array<f32>;
        @group(0) @binding(1) var<storage, read> hv2_matrix: array<f32>;
        @group(0) @binding(2) var<storage, read_write> results: array<f32>;

        @compute @workgroup_size(64)
        fn main(@builtin(global_invocation_id) id: vec3<u32>) {
          let row = id.x;
          let dim = 1024u;
          var dot: f32 = 0.0;
          
          for (var i = 0u; i < dim; i = i + 1u) {
            dot = dot + (hv1[i] * hv2_matrix[row * dim + i]);
          }
          
          results[row] = dot / f32(dim);
        }
      `
    });

    this.pipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    console.log("[VEDA_GPU] High-Dimensional Acceleration Manifold Ready.");
    return true;
  }

  async calculateSimilarities(targetHv: Float32Array, poolMatrix: Float32Array): Promise<Float32Array> {
    if (!this.device || !this.pipeline) throw new Error("GPU_NOT_READY");

    const rowCount = poolMatrix.length / 1024;
    
    const hv1Buffer = this.device.createBuffer({
      size: targetHv.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(hv1Buffer, 0, targetHv);

    const matrixBuffer = this.device.createBuffer({
      size: poolMatrix.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(matrixBuffer, 0, poolMatrix);

    const resultBuffer = this.device.createBuffer({
      size: rowCount * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: hv1Buffer } },
        { binding: 1, resource: { buffer: matrixBuffer } },
        { binding: 2, resource: { buffer: resultBuffer } },
      ],
    });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(Math.ceil(rowCount / 64));
    passEncoder.end();

    const gpuReadBuffer = this.device.createBuffer({
      size: rowCount * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    commandEncoder.copyBufferToBuffer(resultBuffer, 0, gpuReadBuffer, 0, rowCount * 4);

    this.device.queue.submit([commandEncoder.finish()]);

    await gpuReadBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = gpuReadBuffer.getMappedRange();
    const results = new Float32Array(arrayBuffer.slice(0));
    gpuReadBuffer.unmap();

    return results;
  }
}
