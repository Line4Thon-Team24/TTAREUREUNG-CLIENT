// 서버로 보낼 사진의 긴 변 최대 크기(px, 5MB 제한을 넘지 않도록 줄임)
const MAX_SIDE = 1280;

// 카메라 영상의 현재 화면을 JPEG 사진으로 만들기 (영상이 아직 준비 안 됐으면 null)
export const captureVideoFrame = (video: HTMLVideoElement) =>
  new Promise<Blob | null>((resolve) => {
    const { videoWidth, videoHeight } = video;
    if (!videoWidth || !videoHeight) {
      resolve(null);
      return;
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(videoWidth, videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(videoWidth * scale);
    canvas.height = Math.round(videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      resolve(null);
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(resolve, 'image/jpeg', 0.85);
  });
