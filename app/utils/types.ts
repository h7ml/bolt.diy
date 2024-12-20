interface OllamaModelDetails {
  parent_model: string; // 父模型
  format: string; // 格式
  family: string; // 系列
  families: string[]; // 系列数组
  parameter_size: string; // 参数大小
  quantization_level: string; // 量化级别
}

export interface OllamaModel {
  name: string; // 名称
  model: string; // 模型
  modified_at: string; // 修改时间
  size: number; // 大小
  digest: string; // 摘要
  details: OllamaModelDetails; // 模型细节
}

export interface OllamaApiResponse {
  models: OllamaModel[]; // 模型数组
}

export interface ModelInfo {
  name: string; // 名称
  label: string; // 标签
  provider: string; // 提供者
  maxTokenAllowed: number; // 允许的最大令牌
}
