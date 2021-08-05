class FragmentedMSE {
  private videoDOM: HTMLVideoElement;
  private baseUrl: string;
  private mimeCodec: string;
  private mediaSource: MediaSource;
  private sourceBuffer: SourceBuffer;
  private cacheReserveSecs: number; // 缓冲预留秒数
  private totalLength: number; // 视频总共大小
  private segmentStart: number; // rangeStart
  private segmentSize: number; // 分段大小
  constructor(videoDOM: HTMLVideoElement, url: string, codec: string) {
    this.videoDOM = videoDOM;
    this.baseUrl = url;
    this.mimeCodec = codec;
    this.mediaSource = null;
    this.sourceBuffer = null;

    this.cacheReserveSecs = 2;
    this.totalLength = 0;
    this.segmentStart = 0;
    this.segmentSize = 1024 * 1024 * 1;
  }

  initVideoLength = async () => {
    let range;
    await fetch(this.baseUrl, {
      headers: {
        Range: "bytes=0-1"
      }
    }).then(response => {
      const cRange = response.headers.get("Content-Range");
      range = parseInt(cRange.split('/')[1]);
    }).catch(err => console.error(err));
    this.totalLength = range;
  }

  calculateRange = () => {
    // 计算出当前分段的range
    // return '0-1386';
    const rangeStart = this.segmentStart;
    const maxRange = this.segmentStart + this.segmentSize - 1;
    const rangeEnd = Math.min(maxRange, this.totalLength - 1);
    return `${rangeStart}-${rangeEnd}`;
  }

  fetchVideo = range => {
    // console.log(range)
    return new Promise((resolve) => {
      fetch(this.baseUrl, {
        headers: {
          "Range": "bytes=" + range
        }
      }).then(result => result.arrayBuffer().then(ab => resolve(ab)))
        .catch(err => console.error(err));
    });
  }

  updateSegmentStart = range => {
    const rangeEnd = parseInt(range.split('-')[1]);
    this.segmentStart = rangeEnd + 1;
  }

  // 播放时间变化时
  isNeedFetch = () => {
    for (let i = 0; i < this.videoDOM.buffered.length; i++) {
      const bufferend = this.videoDOM.buffered.end(i);
      if (this.videoDOM.currentTime < bufferend && bufferend - this.videoDOM.currentTime >= this.cacheReserveSecs)
        return false
    }
    return true;
  }
  timeupdate = async () => {
    if (this.totalLength && this.segmentStart >= this.totalLength) { // 所有数据已请求完成
      this.videoDOM.removeEventListener("timeupdate", this.timeupdate);
      this.mediaSource.endOfStream();
    } else {
      // 如果当前视频播放时间不够则继续请求分段数据
      if (this.isNeedFetch()) {
        const range = this.calculateRange();
        this.updateSegmentStart(range);
        const chunk: any = await this.fetchVideo(range);
        this.sourceBuffer.appendBuffer(chunk);
      }
    }
  }
  // positionChanged = async () => {
  //   this.videoDOM.removeEventListener("timeupdate", this.timeupdate);
  //   this.segmentStart = Math.floor(this.videoDOM.currentTime / this.videoDOM.duration * this.totalLength);
  //   const range = this.calculateRange();
  //   const chunk: any = await this.fetchVideo(range);
  //   await this.sourceBuffer.appendBuffer(chunk);
  //   // this.sourceBuffer.addEventListener("updateend", () => console.log(this.sourceBuffer.buffered))
  //   // this.videoDOM.addEventListener("timeupdate", this.timeupdate);
  // }


  seek = async () => {
    if (this.mediaSource.readyState === "open") {
      this.videoDOM.removeEventListener("timeupdate", this.timeupdate);
      this.sourceBuffer.updating && this.sourceBuffer.abort();
      // this.sourceBuffer.remove(this.sourceBuffer.buffered.start(0), this.sourceBuffer.buffered.end(0));

      this.segmentStart = Math.floor((this.videoDOM.currentTime) / this.videoDOM.duration * this.totalLength);
      const range = this.calculateRange();
      // this.updateSegmentStart(range);
      // const chunk: any = await this.fetchVideo(`1-${this.totalLength / 4}`);
      const chunk: any = await this.fetchVideo(range);
      this.sourceBuffer.appendBuffer(chunk);
      this.sourceBuffer.addEventListener("updateend", () => {
        // this.videoDOM.addEventListener("timeupdate", this.timeupdate)
      })
    }
  }


  handleSBUpdated = async () => {
    if (this.videoDOM.buffered.length) {
      // 视频开始能播放后，监听视频的timeupdate来决定是否继续请求数据
      this.sourceBuffer.removeEventListener("updateend", this.handleSBUpdated);
      this.videoDOM.addEventListener("timeupdate", this.timeupdate);
      this.videoDOM.addEventListener("seeking", this.seek);
    } else {
      // 继续加载初始化数据，直到视频能够播放，才触发timeupdate事件
      const initRange = this.calculateRange();
      const initData: any = await this.fetchVideo(initRange);
      this.updateSegmentStart(initRange);
      this.sourceBuffer.appendBuffer(initData);
    }
  }

  initVideo = async () => {
    // 获取初始的视频播放数据
    const initRange = this.calculateRange();
    const initData: any = await this.fetchVideo(initRange);
    this.updateSegmentStart(initRange);
    this.sourceBuffer.appendBuffer(initData);
    this.sourceBuffer.addEventListener("updateend", this.handleSBUpdated);
  }

  sourceOpen = async () => {
    URL.revokeObjectURL(this.videoDOM.src);
    this.sourceBuffer = this.mediaSource.addSourceBuffer(this.mimeCodec);
    await this.initVideoLength();
    this.initVideo();
  }

  // 初始化MSE实例
  initMediaSource = () => {
    if ('MediaSource' in window && MediaSource.isTypeSupported(this.mimeCodec)) {
      const mediaSource = new MediaSource();
      this.videoDOM.src = URL.createObjectURL(mediaSource);
      this.mediaSource = mediaSource;
      mediaSource.addEventListener('sourceopen', this.sourceOpen);
    } else {
      console.error('Unsupported MIME type or codec: ', this.mimeCodec);
      // 不支持MediaSource，则降级普通的video
      const source = document.createElement('source');
      source.type = 'videoDOM/mp4';
      source.src = this.baseUrl;
      this.videoDOM.appendChild(source);
    }
  }
}

export { FragmentedMSE };
