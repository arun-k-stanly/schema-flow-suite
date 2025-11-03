const API_BASE = (() => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  const hostname = (globalThis as any)?.location?.hostname || '127.0.0.1';
  return `http://${hostname}:8001/api`;
})();

type HttpMethod = 'GET' | 'POST' | 'DELETE';

async function request<T>(path: string, method: HttpMethod = 'GET', body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Projects
export async function apiListProjects(): Promise<any[]> {
  return request<any[]>(`/projects`);
}

export async function apiCreateProject(item: { id: string; name: string; description?: string }): Promise<any> {
  return request<any>(`/projects`, 'POST', item);
}

export async function apiDeleteProject(projectId: string): Promise<{ deleted: string }> {
  return request<{ deleted: string }>(`/projects/${projectId}`, 'DELETE');
}

// Validation
export async function apiValidationCheck(item: any): Promise<{ agent: string; valid: boolean; reasons: string[] }> {
  return request(`/validation/check`, 'POST', { item });
}

// Data model
export async function apiDataModelSummarize(schema: any): Promise<{ agent: string; summary: any; suggestion?: string | null }> {
  return request(`/data-model/summarize`, 'POST', { schema });
}

// Pipeline
export async function apiPipelineTransform(payload: { rows: any[]; ops?: any[] }): Promise<{ agent: string; count: number; schema: any; sample: any[] }> {
  return request(`/pipeline/transform`, 'POST', payload);
}

// Agents generic
export async function apiAgentAsk(agent: string, payload: any): Promise<any> {
  return request(`/agents/ask`, 'POST', { agent, payload });
}

export { API_BASE };

// Upload & parse metadata
export async function apiParseMetadata(format: string, file: File): Promise<{ format: string; summary: any }>{
  const url = `${API_BASE}/metadata/parse`;
  const form = new FormData();
  form.append('format', format);
  form.append('file', file);
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Parse failed: ${res.status}`);
  }
  return res.json();
}

// Generate sample data
export async function apiGenerateSample(params: { format: string; count: number; variation?: string; schema?: any }): Promise<any> {
  return request(`/generate/sample`, 'POST', params);
}

// Model generation from saved schema
export async function apiGenerateModel(body?: { prompt?: string; schema?: any; sampleRows?: any[] }): Promise<{ model: any }> {
  return request(`/model/generate`, 'POST', body || {});
}

// Code generation
type InputFormat = 'json' | 'xml' | 'csv' | 'parquet' | 'avro';

export async function apiGenerateCode(
  model: any,
  inputFormat: InputFormat = 'json',
  inputPath?: string,
  inputOptions?: Record<string, any>,
  adlsConfig?: { enabled?: boolean; account_name?: string; account_key?: string; container?: string }
): Promise<{ language: string; framework: string; code: string }>{
  return request(`/code/pyspark`, 'POST', {
    model,
    input_format: inputFormat,
    input_path: inputPath,
    input_options: inputOptions,
    adls_config: adlsConfig,
  });
}

// Deployments
export async function apiCreateDeployment(projectId: string, name: string, code: string): Promise<any> {
  return request(`/deployments`, 'POST', { project_id: projectId, name, code });
}
export async function apiListDeployments(projectId: string): Promise<any[]> {
  const query = encodeURIComponent(projectId);
  return request(`/deployments?project_id=${query}`, 'GET');
}


