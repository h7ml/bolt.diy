import type { WebContainer } from '@webcontainer/api';
import { atom } from 'nanostores';

export interface PreviewInfo {
  port: number; // 端口
  ready: boolean; // 是否准备好
  baseUrl: string; // 基础 URL
}

export class PreviewsStore {
  #availablePreviews = new Map<number, PreviewInfo>(); // 可用预览的映射
  #webcontainer: Promise<WebContainer>; // WebContainer 的 Promise

  previews = atom<PreviewInfo[]>([]); // 预览信息的原子状态

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise; // 初始化 webcontainer

    this.#init(); // 初始化方法
  }

  async #init() {
    const webcontainer = await this.#webcontainer; // 等待 WebContainer 的加载

    webcontainer.on('port', (port, type, url) => {
      // 监听端口事件
      let previewInfo = this.#availablePreviews.get(port); // 获取端口的预览信息

      if (type === 'close' && previewInfo) {
        // 如果端口关闭且有预览信息
        this.#availablePreviews.delete(port); // 删除可用预览
        this.previews.set(this.previews.get().filter((preview) => preview.port !== port)); // 更新预览状态

        return;
      }

      const previews = this.previews.get(); // 获取当前预览列表

      if (!previewInfo) {
        // 如果没有预览信息
        previewInfo = { port, ready: type === 'open', baseUrl: url }; // 创建新的预览信息
        this.#availablePreviews.set(port, previewInfo); // 设置可用预览
        previews.push(previewInfo); // 添加到预览列表
      }

      previewInfo.ready = type === 'open'; // 更新准备状态
      previewInfo.baseUrl = url; // 更新基础 URL

      this.previews.set([...previews]); // 更新预览状态
    });
  }
}
