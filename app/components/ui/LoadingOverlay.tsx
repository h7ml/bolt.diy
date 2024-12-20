export const LoadingOverlay = ({ message = '加载中...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm">
      {/* 加载内容 */}
      <div className="relative flex flex-col items-center gap-4 p-8 rounded-lg bg-bolt-elements-background-depth-2 shadow-lg">
        <div
          className={'i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress'}
          style={{ fontSize: '2rem' }}
        ></div>
        <p className="text-lg text-bolt-elements-textTertiary">{message}</p>
      </div>
    </div>
  );
};
