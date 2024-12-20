import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface ScreenshotSelectorProps {
  isSelectionMode: boolean;
  setIsSelectionMode: (mode: boolean) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export const ScreenshotSelector = memo(
  ({ isSelectionMode, setIsSelectionMode, containerRef }: ScreenshotSelectorProps) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
      // 组件卸载时停止所有轨道的清理函数
      return () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
          videoRef.current.remove();
          videoRef.current = null;
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };
    }, []);

    const initializeStream = async () => {
      if (!mediaStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            audio: false,
            video: {
              displaySurface: 'window',
              preferCurrentTab: true,
              surfaceSwitching: 'include',
              systemAudio: 'exclude',
            },
          } as MediaStreamConstraints);

          // 添加停止共享时的处理程序
          stream.addEventListener('inactive', () => {
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.srcObject = null;
              videoRef.current.remove();
              videoRef.current = null;
            }

            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((track) => track.stop());
              mediaStreamRef.current = null;
            }

            setIsSelectionMode(false);
            setSelectionStart(null);
            setSelectionEnd(null);
            setIsCapturing(false);
          });

          mediaStreamRef.current = stream;

          // 初始化视频元素（如果需要的话）
          if (!videoRef.current) {
            const video = document.createElement('video');
            video.style.opacity = '0';
            video.style.position = 'fixed';
            video.style.pointerEvents = 'none';
            video.style.zIndex = '-1';
            document.body.appendChild(video);
            videoRef.current = video;
          }

          // 设置视频与流
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (error) {
          console.error('初始化流失败:', error);
          setIsSelectionMode(false);
          toast.error('初始化屏幕捕获失败');
        }
      }

      return mediaStreamRef.current;
    };

    const handleCopySelection = useCallback(async () => {
      if (!isSelectionMode || !selectionStart || !selectionEnd || !containerRef.current) {
        return;
      }

      setIsCapturing(true);

      try {
        const stream = await initializeStream();

        if (!stream || !videoRef.current) {
          return;
        }

        // 等待视频准备就绪
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 创建用于完整截图的临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = videoRef.current.videoWidth;
        tempCanvas.height = videoRef.current.videoHeight;

        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
          throw new Error('获取临时画布上下文失败');
        }

        // 绘制完整的视频帧
        tempCtx.drawImage(videoRef.current, 0, 0);

        // 计算视频与屏幕之间的缩放因子
        const scaleX = videoRef.current.videoWidth / window.innerWidth;
        const scaleY = videoRef.current.videoHeight / window.innerHeight;

        // 获取窗口的滚动位置
        const scrollX = window.scrollX;
        const scrollY = window.scrollY + 40;

        // 获取容器在页面中的位置
        const containerRect = containerRef.current.getBoundingClientRect();

        // 偏移调整以获得更精确的剪裁
        const leftOffset = -9; // 调整左侧位置
        const bottomOffset = -14; // 调整底部位置

        // 计算带有滚动偏移和调整后的缩放坐标
        const scaledX = Math.round(
          (containerRect.left + Math.min(selectionStart.x, selectionEnd.x) + scrollX + leftOffset) * scaleX,
        );
        const scaledY = Math.round(
          (containerRect.top + Math.min(selectionStart.y, selectionEnd.y) + scrollY + bottomOffset) * scaleY,
        );
        const scaledWidth = Math.round(Math.abs(selectionEnd.x - selectionStart.x) * scaleX);
        const scaledHeight = Math.round(Math.abs(selectionEnd.y - selectionStart.y) * scaleY);

        // 创建用于裁剪区域的最终画布
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(Math.abs(selectionEnd.x - selectionStart.x));
        canvas.height = Math.round(Math.abs(selectionEnd.y - selectionStart.y));

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('获取画布上下文失败');
        }

        // 绘制裁剪区域
        ctx.drawImage(tempCanvas, scaledX, scaledY, scaledWidth, scaledHeight, 0, 0, canvas.width, canvas.height);

        // 转换为blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('创建blob失败'));
            }
          }, 'image/png');
        });

        // 创建一个FileReader将blob转换为base64
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64Image = e.target?.result as string;

          // 查找textarea元素
          const textarea = document.querySelector('textarea');

          if (textarea) {
            // 从BaseChat组件中获取setter
            const setUploadedFiles = (window as any).__BOLT_SET_UPLOADED_FILES__;
            const setImageDataList = (window as any).__BOLT_SET_IMAGE_DATA_LIST__;
            const uploadedFiles = (window as any).__BOLT_UPLOADED_FILES__ || [];
            const imageDataList = (window as any).__BOLT_IMAGE_DATA_LIST__ || [];

            if (setUploadedFiles && setImageDataList) {
              // 更新文件和图像数据
              const file = new File([blob], 'screenshot.png', { type: 'image/png' });
              setUploadedFiles([...uploadedFiles, file]);
              setImageDataList([...imageDataList, base64Image]);
              toast.success('截图已捕获并添加到聊天中');
            } else {
              toast.error('无法将截图添加到聊天中');
            }
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('截图捕获失败:', error);
        toast.error('截图捕获失败');

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      } finally {
        setIsCapturing(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        setIsSelectionMode(false); // 捕获后关闭选择模式
      }
    }, [isSelectionMode, selectionStart, selectionEnd, containerRef, setIsSelectionMode]);

    const handleSelectionStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSelectionMode) {
          return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSelectionStart({ x, y });
        setSelectionEnd({ x, y });
      },
      [isSelectionMode],
    );

    const handleSelectionMove = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSelectionMode || !selectionStart) {
          return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSelectionEnd({ x, y });
      },
      [isSelectionMode, selectionStart],
    );

    if (!isSelectionMode) {
      return null;
    }

    return (
      <div
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleSelectionStart}
        onMouseMove={handleSelectionMove}
        onMouseUp={handleCopySelection}
        onMouseLeave={() => {
          if (selectionStart) {
            setSelectionStart(null);
          }
        }}
        style={{
          backgroundColor: isCapturing ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          pointerEvents: 'all',
          opacity: isCapturing ? 0 : 1,
          zIndex: 50,
          transition: 'opacity 0.1s ease-in-out',
        }}
      >
        {selectionStart && selectionEnd && !isCapturing && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-20"
            style={{
              left: Math.min(selectionStart.x, selectionEnd.x),
              top: Math.min(selectionStart.y, selectionEnd.y),
              width: Math.abs(selectionEnd.x - selectionStart.x),
              height: Math.abs(selectionEnd.y - selectionStart.y),
            }}
          />
        )}
      </div>
    );
  },
);
