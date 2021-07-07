import * as React from "react";

import { formatDuration } from "@customed-methods/string";
import BiliBili_midcrc from "../crc32";

import style from "./barrage.styl?css-modules";

interface BarrageData {
  type: string;
  decimalColor: string;
  content: string;
  uidHash: string;
  sendTime: string;
}

interface BarrageProps {
  isLive: boolean;
  paused: boolean;
  barrageRefs: {
    videoRef: React.RefObject<HTMLVideoElement>,
    curBrightnessRef: React.RefObject<HTMLDivElement>,
    curVolumeRef: React.RefObject<HTMLSpanElement>,
    gesRef: React.MutableRefObject<number>,
    progressRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLSpanElement>,
    showCtrBarRef: React.MutableRefObject<boolean>,
    controlBarRef: React.RefObject<HTMLDivElement>
  };
  barrageSetState: {
    setGestureType: React.Dispatch<React.SetStateAction<number>>,
    setIsShowCenterVolume: React.Dispatch<React.SetStateAction<boolean>>,
    setIsShowCenterBri: React.Dispatch<React.SetStateAction<boolean>>,
    setIsShowControlBar: React.Dispatch<React.SetStateAction<boolean>>,
  };
  barrageMethods: {
    setTimeupdateListener: () => void,
    showControls: () => void,
    showControlsTemporally: () => void,
    clearCtrTimer: () => void
  };
  myUid?: string;
  fontSize?: string;
  opacity?: number;
  barrages?: BarrageData[];
}

class fixedBarrTimer {
  private timerId: number;
  private start: number;
  private remaining: number;
  private callback: Function;
  constructor(callback: Function, delay: number) {
    this.start = delay;
    this.remaining = delay;
    this.callback = callback;
  }

  public pause = () => {
    clearTimeout(this.timerId);
    this.remaining -= Date.now() - this.start;
  };

  public resume = () => {
    this.start = Date.now();
    this.timerId = setTimeout(this.callback, this.remaining);
  };
}

/**
 * 使用纯组件，不发生update，发射弹幕采用DOM操作
 */
class Barrage extends React.PureComponent<BarrageProps> {
  public viewWidth: number; // 弹幕区域的宽度
  public viewHeight: number; // 弹幕区域的高度
  private barrageRef: React.RefObject<HTMLDivElement>;
  private contentHeight: number; // 一条弹幕的高度
  private randomTop: number = 0; // 随机弹幕距离弹幕区域顶端的竖直距离
  private fixedTop: number = 0; // 顶部固定弹幕距离弹幕区域顶端的竖直距离
  private fixedBottom: number = 0; // 底部固定弹幕距离弹幕区域底端的竖直距离
  private fontSize: string;
  private opacity: number;
  private isPC: boolean;
  private fixedBarrTimers: fixedBarrTimer[];
  private rollBarrStyles: CSSStyleDeclaration[]; // 用于控制动画的开/关
  private rollBarCSSStySheet: CSSStyleSheet; // 指向添加到document.head中的那个style元素

  constructor(props) {
    super(props);
    this.barrageRef = React.createRef();
    this.fontSize = props.fontSize || "0.8rem";
    this.opacity = props.opacity || 1;
    this.isPC = !(/(Safari|iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent));
    this.fixedBarrTimers = [];
    this.rollBarrStyles = [];
  }

  public initBarrAreaSize = () => {
    setTimeout(() => { // 用定时器是因为屏幕旋转有延时，要等屏幕转完再测距
      const barrageDOM = this.barrageRef.current;
      this.viewWidth = barrageDOM.offsetWidth;
      this.viewHeight = barrageDOM.offsetHeight;
    }, 1000);
  }

  private createBarrageElem(barrage: BarrageData) {
    const { content, type, decimalColor, uidHash } = barrage;

    const tempHex = Number(decimalColor).toString(16);
    // tempHex不够6位时前面需要补0
    const divColor = "#" + "00000000".substr(0, 6 - tempHex.length) + tempHex;

    const style: any = {
      position: "absolute",
      fontFamily: "黑体",
      fontSize: "0.8rem",
      fontWeight: "bold",
      whiteSpace: "pre",
      textShadow: "rgb(0, 0, 0) 1px 1px 2px",
      color: divColor,
      opacity: this.opacity,
      zIndex: "99"
    };
    const div = document.createElement("div");

    div.innerHTML = content;

    if (type === "4") {
      div.style.bottom = this.fixedBottom + "px"; ``
      // 距离底端位置增加一个弹幕内容高度，防止固定弹幕重叠
      this.fixedBottom += this.contentHeight;
      // 最大值边界判断
      if (this.fixedBottom > this.viewHeight - this.contentHeight) { this.fixedBottom = 0 }
    } else if (type === "5") {
      div.style.top = this.fixedTop + "px";
      this.fixedTop += this.contentHeight;
      if (this.fixedTop > this.viewHeight - this.contentHeight) { this.fixedTop = 0 }
    } else {
      style.top = `${this.randomTop}px`;
      style.left = `${this.viewWidth}px`;

      // 距离顶端位置增加一个弹幕内容高度，防止滚动弹幕重叠
      this.randomTop += this.contentHeight;
      // 最大值边界判断
      if (this.randomTop > this.viewHeight - this.contentHeight) {
        this.randomTop = 0;
      }
    }

    for (const k in style) {
      //  void 0等价于undefined，而且不能被重写且能节省字节
      if (style[k] !== void 0) {
        div.style[k] = style[k];
      }
    }

    // 检查是否为本人所发弹幕
    const { myUid } = this.props;
    if (myUid) {
      const covertUidHash = BiliBili_midcrc();
      if (covertUidHash(uidHash) === myUid) {
        div.style.border = `2px solid ${divColor}`;
      }
    }

    return div;
  }

  public send(barrage: BarrageData) {
    const { type, uidHash, sendTime } = barrage;
    const barrageDOM = this.barrageRef.current;
    const barrageElem = this.createBarrageElem(barrage);
    const barrEleStyle = barrageElem.style;
    let tempTimer: fixedBarrTimer;

    barrageDOM.appendChild(barrageElem);

    if (type === "4") {
      // 居中放置
      barrEleStyle.left = (this.viewWidth - barrageElem.offsetWidth) / 2 + "px";
      // 移除弹幕
      tempTimer = new fixedBarrTimer(() => {
        barrageDOM.removeChild(barrageElem);
        // 距底端位置减少一个弹幕内容高度
        this.fixedBottom -= this.contentHeight;
        if (this.fixedBottom < 0) { this.fixedBottom = 0 }
        this.fixedBarrTimers.splice(this.fixedBarrTimers.indexOf(tempTimer), 1);
      }, 5000);
    } else if (type === "5") {
      barrEleStyle.left = (this.viewWidth - barrageElem.offsetWidth) / 2 + "px";
      tempTimer = new fixedBarrTimer(() => {
        barrageDOM.removeChild(barrageElem);
        this.fixedTop -= this.contentHeight;
        if (this.fixedTop < 0) { this.fixedTop = 0 }
        this.fixedBarrTimers.splice(this.fixedBarrTimers.indexOf(tempTimer), 1);
      }, 5000);
    } else {
      const x = - (this.viewWidth + barrageElem.offsetWidth);
      this.rollBarCSSStySheet.insertRule(`@keyframes barr${uidHash}${sendTime}{from {transform: translate3d(0, 0, 0);}to {transform: translate3d(${x}px, 0, 0)};}`);
      barrEleStyle.animation = `barr${uidHash}${sendTime} 5s linear`;
      this.rollBarrStyles.push(barrEleStyle);

      const handleAnimationEnd = () => {
        // 弹幕运动完成后移除监听，清除弹幕
        barrageElem.removeEventListener("animationend", handleAnimationEnd);
        barrageDOM.removeChild(barrageElem);
        // 距顶端位置减少一个弹幕内容高度
        this.randomTop -= this.contentHeight;
        // 最小值边界判断
        if (this.randomTop < 0) { this.randomTop = 0 }
        // 清除已消失弹幕的样式缓存
        const inx = this.rollBarrStyles.indexOf(barrEleStyle);
        this.rollBarCSSStySheet.deleteRule(inx);
        this.rollBarrStyles.splice(inx, 1);
      };
      barrageElem.addEventListener("animationend", handleAnimationEnd);
    }

    barrageElem.addEventListener("click", () => {
      tempTimer ? tempTimer.pause() : barrEleStyle.animationPlayState = "paused";
      setTimeout(() => {
        tempTimer ? tempTimer.resume() : barrEleStyle.animationPlayState = "running";
      }, 3500);
    });

    if (tempTimer) {
      tempTimer.resume();
      this.fixedBarrTimers.push(tempTimer);
    }
  }

  public clear() {
    this.randomTop = 0;
    this.fixedTop = 0;
    this.fixedBottom = 0;
    const barrageDOM = this.barrageRef.current;
    const children = barrageDOM.children;
    // children是HTMLCollection类型的，因此要用Array.from()转成数组
    for (const child of Array.from(children)) {
      barrageDOM.removeChild(child);
    }
  }

  private init() {
    /* 将contentHeight初始化为fontSize */
    // this.fontSize由于类型原因，不能直接赋值给this.contentHeight
    // 因此要建一个临时的div并应用该fontSize
    // 然后再将div.offsetHeight赋值给this.contentHeight
    const div = document.createElement("div");
    div.innerHTML = "temp";
    div.style.fontSize = this.fontSize;
    // 末尾加[0]的原因是：getElementsByTagName返回的是一个数组
    // 因此即使只有一个元素，也要用[0]才能取到
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(div);
    this.contentHeight = div.offsetHeight;
    body.removeChild(div);

    /* 首次加载及屏幕旋转时更新弹幕区域大小 */
    this.initBarrAreaSize();
    // initBarrAreaSize要不用箭头函数（this永远指向上一层），要不用bind(this)处理，因为：
    // addEventListener的调用者是window，因此this.initBarrAreaSize的this就是window；
    // 那么触发orientationchange时，initBarrAreaSize中的this也将是window，但应该是Barrage
    addEventListener("orientationchange", this.initBarrAreaSize);

    // 为滚动弹幕单独创建一个CssStyleSheet，防止insertRule的时候污染其他sheet
    const styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);
    this.rollBarCSSStySheet = styleSheet.sheet;

    /* 如果父组件有弹幕传递过来，则显示这些弹幕（一般没有） */
    const { barrages } = this.props;
    if (barrages) { for (const barrage of barrages) { this.send(barrage) } }
  }

  public setFingerListener() {
    const { isLive } = this.props;
    const { setGestureType, setIsShowControlBar, setIsShowCenterVolume,
      setIsShowCenterBri } = this.props.barrageSetState;
    const { showControlsTemporally, setTimeupdateListener, showControls } = this.props.barrageMethods;
    const { videoRef, gesRef, curBrightnessRef, curVolumeRef, progressRef,
      currentTimeRef, showCtrBarRef } = this.props.barrageRefs;
    const videoDOM: HTMLVideoElement = videoRef.current;

    // 用barrageContainerDOM而不是videoAreaDOM的原因，见player.styl中各DOM的层级关系
    const barrageContainerDOM: HTMLDivElement = this.barrageRef.current;

    const isIos = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator',
      'iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) !== -1 ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)

    let barrageWidth: number = 0;
    let barrageHeight: number = 0;
    let initVolume: number;
    let initTime: number;
    let timeAfterChange: number;
    let initProgress: number;
    let initBrightness: number = 1;
    let briAfterChange: number;
    let startPos = {
      x: 0,
      y: 0
    };

    curBrightnessRef.current.style.width = `100%`;
    curVolumeRef.current.style.width = `100%`;

    barrageContainerDOM.addEventListener("touchstart", e => {

      // 设置触摸事件的初始值
      setGestureType(0);
      startPos = {
        x: e.targetTouches[0].pageX,
        y: e.targetTouches[0].pageY
      };
      initVolume = videoDOM.volume;
      initTime = videoDOM.currentTime;
      initProgress = initTime / videoDOM.duration;
      // 这两个求长度不能提到外面，因为横屏、全屏后会变
      barrageWidth = barrageContainerDOM.getBoundingClientRect().width;
      barrageHeight = barrageContainerDOM.getBoundingClientRect().height;
    });

    barrageContainerDOM.addEventListener("touchmove", e => {
      // 防止滑动拖动整个videoPage
      e.preventDefault();
      e.stopPropagation();

      const curPos = {
        x: e.targetTouches[0].pageX,
        y: e.targetTouches[0].pageY
      };
      const moveRatio = {
        x: (curPos.x - startPos.x) / barrageWidth,
        y: (curPos.y - startPos.y) / barrageHeight
      };

      // 判断gestureType === 1目的是：
      // 在本次touch中，如果手势之前已经处于“左右滑动”状态，则不会进入“上下滑动”
      if (!isLive && gesRef.current === 1 || (gesRef.current === 0 &&
        Math.abs(moveRatio.x) > Math.abs(moveRatio.y))) { // 左右滑动
        const progressDOM = progressRef.current;
        const currentTimeDOM = currentTimeRef.current;
        let progressAfterChange = initProgress + moveRatio.x;

        if (gesRef.current !== 1) { setGestureType(1); }
        videoDOM.removeEventListener("timeupdate", setTimeupdateListener);
        showControls();

        if (progressAfterChange > 1 || progressAfterChange < 0) { return; }
        else {
          timeAfterChange = initTime + videoDOM.duration * moveRatio.x;
          currentTimeDOM.innerHTML = formatDuration(timeAfterChange, "0#:##");
          progressDOM.style.width = `${progressAfterChange * 100}%`;
        }
      } else if (gesRef.current === 2 || (gesRef.current === 0 &&
        curPos.x > barrageWidth / 2)) { // 右边的上下滑动
        if (gesRef.current !== 2) { setGestureType(2); }
        setIsShowCenterVolume(true);

        let volumeAfterChange = initVolume - moveRatio.y; // y轴向下为正，因此取反
        if (isIos) { alert("IOS不允许我改音量啊! o(TヘTo)"); }
        else if (volumeAfterChange > 1) { return; } // 不判断<0是因为有些设备手指滑动灵敏度较低，判断<0就没法进else
        else {
          curVolumeRef.current.style.width = `${volumeAfterChange * 100}%`;
          videoDOM.volume = volumeAfterChange > 0 ? volumeAfterChange : 0;
        }
      } else { // 左边的上下滑动
        if (gesRef.current !== 3) { setGestureType(3); }
        setIsShowCenterBri(true);

        briAfterChange = initBrightness - moveRatio.y;
        // 这个重置必须有，否则下次滑动时，briAfterChange将是负数
        // 而进度和音量不用重置，是因为它们本来就被限定在0~1之间，而亮度则可以大于1和取负数
        if (briAfterChange < 0) { briAfterChange = 0; }
        else if (briAfterChange > 1) { briAfterChange = 1; }
        else {
          curBrightnessRef.current.style.width = `${briAfterChange * 100}%`;
          videoDOM.style.filter = `brightness(${briAfterChange})`;
        }
      }
    });

    barrageContainerDOM.addEventListener("touchend", e => {
      e.stopPropagation();

      if (gesRef.current === 0) {
        if (!showCtrBarRef.current) { showControlsTemporally(); }
        else { setIsShowControlBar(false); }
      } else if (gesRef.current === 1) {
        videoDOM.currentTime = timeAfterChange;
        videoDOM.addEventListener("timeupdate", setTimeupdateListener);
        showControlsTemporally();
      } else if (gesRef.current === 2) {
        setTimeout(() => { setIsShowCenterVolume(false); }, 200);
      } else {
        initBrightness = briAfterChange;
        setTimeout(() => { setIsShowCenterBri(false); }, 200);
      }
    });
  }

  public setMouseListener() {
    const { setIsShowControlBar } = this.props.barrageSetState;
    const controlBarDOM = this.props.barrageRefs.controlBarRef.current;
    const { showControlsTemporally, clearCtrTimer } = this.props.barrageMethods;

    const barrageContainerDOM = this.barrageRef.current;
    // click事件不能正常显示/隐藏控制器，且会影响其他控制器子组件的点击
    // barrageContainerDOM.addEventListener("click", (e) => {
    //   e.stopPropagation();
    //   e.preventDefault();
    //   clearTimeout(timer);
    //   if (!isShowControlBar) {
    //     showControlsTemporally();
    //   } else {
    //     hideControls();
    //   }
    // });

    // 鼠标移入视频区则显示控制器，2秒后隐藏
    barrageContainerDOM.addEventListener("mouseover", e => {
      e.stopPropagation();
      showControlsTemporally();
    });
    // 鼠标移动过程中一直显示控制器
    barrageContainerDOM.addEventListener("mousemove", e => {
      e.stopPropagation();
      clearCtrTimer();
      showControlsTemporally();
    });
    // 鼠标移出视频区立即隐藏控制器
    barrageContainerDOM.addEventListener("mouseout", e => {
      e.stopPropagation();
      clearCtrTimer();
      setIsShowControlBar(false);
    });
    // 鼠标停留在控制器上时，一直显示控制器
    // 这里不绑定mouseover事件，是因为：
    //   触发mouseover后马上又触发barrageContainerDOM的mousemove，进而调用showControlsTemporally
    //   这样控制器就会2秒后隐藏，而不是一直显示
    controlBarDOM.addEventListener("mousemove", e => {
      e.stopPropagation();
      clearCtrTimer();
      showControlsTemporally();
    });
  }

  public componentDidMount() {
    this.init();
    if (this.isPC) { this.setMouseListener() }
    else { setTimeout(() => { this.setFingerListener() }, 1) }
  }

  public componentDidUpdate(prevProps) {
    const { paused } = this.props;
    if (paused !== prevProps.paused) {
      if (paused) {
        this.fixedBarrTimers.forEach(timer => timer.pause());
        this.rollBarrStyles.forEach(style => style.animationPlayState = "paused");
      } else {
        this.fixedBarrTimers.forEach(timer => timer.resume());
        this.rollBarrStyles.forEach(style => style.animationPlayState = "running");
      }
    }
  }

  public componentWillUnmount() {
    removeEventListener("orientationchange", this.initBarrAreaSize);
  }

  /* 以下为渲染部分 */
  public render() {
    return (
      <div className={style.barrContainer} ref={this.barrageRef} />
    );
  }
}

export default Barrage;
