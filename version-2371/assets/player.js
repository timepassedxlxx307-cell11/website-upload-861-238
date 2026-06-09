import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(shell) {
  const video = shell.querySelector('video');
  const playButton = shell.querySelector('[data-play-button]');
  const status = shell.querySelector('[data-player-status]');
  const source = shell.getAttribute('data-video-src');
  let hls = null;
  let initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  async function playVideo() {
    try {
      await video.play();
      shell.classList.add('is-playing');
      setStatus('正在播放');
    } catch (error) {
      setStatus('浏览器阻止了自动播放，请再次点击播放');
    }
  }

  function initialize() {
    if (initialized) {
      playVideo();
      return;
    }
    initialized = true;
    setStatus('正在加载播放源');

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已就绪');
        playVideo();
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络加载异常，正在重试');
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码异常，正在恢复');
          hls.recoverMediaError();
          return;
        }
        setStatus('播放源加载失败，请刷新页面后重试');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setStatus('播放源已就绪');
        playVideo();
      }, { once: true });
    } else {
      setStatus('当前浏览器不支持 HLS 播放');
    }
  }

  playButton.addEventListener('click', initialize);
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      shell.classList.remove('is-playing');
      setStatus('已暂停，点击画面继续播放');
    }
  });
  video.addEventListener('ended', function () {
    shell.classList.remove('is-playing');
    setStatus('播放结束');
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
