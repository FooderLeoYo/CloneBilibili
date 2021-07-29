import * as React from "react";
import * as ReactDOM from "react-dom";

import { getBarrLikeCount, thumbupBarr, withdrawBarr } from "@api/video";

import { formatDuration } from "@customed-methods/string";
import BiliBili_midcrc from "@customed-methods/crc32";
import Toast from "@components/toast/index";

import style from "./barrage.styl?css-modules";

interface BarrageData {
  type: string; // 弹幕类型：位置、互动、高级等
  decimalColor: string; // 十进制颜色
  content: string; // 内容
  sendTime: string; // 发送时间
  time?: string;// 视频内弹幕出现时间
  isMineBarr?: boolean; // 手动标记为“我的弹幕”
  uidHash?: string; // 发送者UID的HASH
  size?: string; // 字号
  dmid?: string;// 弹幕dmid
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
  time?: number;
  oid?: number;
}

class pausedableTimer {
  private timerId: number;
  private delay: number;
  private start: number;
  private remaining: number;
  private callback: Function;
  constructor(callback: Function, delay: number) {
    this.delay = delay;
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

  public executeCallback = () => this.callback();

  public reset = () => {
    clearTimeout(this.timerId);
    this.remaining = this.delay;
    this.resume();
  };

  public destroy = () => clearTimeout(this.timerId);
}

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
  private rollBarrStyles: CSSStyleDeclaration[]; // 用于控制动画的开/关
  private rollBarCSSStySheet: CSSStyleSheet; // 指向添加到document.head中的那个style元素
  private fixedBarrTimers: pausedableTimer[]; // 固定弹幕动画结束倒计时，结束后移除这条弹幕的DOM并腾出一个位置
  private singleClickTimer: pausedableTimer; // 点击单个弹幕后，该弹幕暂停动画的倒计时
  private manipulationTimer: pausedableTimer; // 弹幕操作盒隐藏的倒计时，同一时间只能有一个操作盒
  private curBarrDOM: HTMLDivElement;

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

  public send(barrage: BarrageData) {
    const { myUid, oid } = this.props;
    const { content, type, decimalColor, sendTime, isMineBarr, uidHash, size, dmid } = barrage;
    const barrageAreaDOM = this.barrageRef.current;
    const tempHex = Number(decimalColor).toString(16);
    const divColor = "#" + "00000000".substr(0, 6 - tempHex.length) + tempHex; // tempHex不够6位时前面需要补0
    const fSize = size === "25" ? "0.8rem" : "0.5rem";
    const tempStyle: any = {
      fontSize: fSize,
      color: divColor,
      opacity: this.opacity,
    };
    let isMineBarrage = false;
    let fixedBarrTimer: pausedableTimer;
    let handleAnimationEnd: () => void;

    /* 初始化一条弹幕的div */
    const barrageWrapper = document.createElement("div");
    barrageWrapper.className = `${style.barrWrapper}`;
    const textWrapper = document.createElement("div");
    textWrapper.innerHTML = content;
    textWrapper.className = `${style.text}`
    barrageWrapper.appendChild(textWrapper);
    barrageAreaDOM.appendChild(barrageWrapper);
    const wrapperStyle = barrageWrapper.style;
    const textStyle = textWrapper.style;
    for (const k in tempStyle) {
      //  void 0等价于undefined，而且不能被重写且能节省字节
      if (tempStyle[k] !== void 0) { textWrapper.style[k] = tempStyle[k] }
    }

    // 检查是否为本人所发弹幕
    if (isMineBarr) {
      isMineBarrage = true;
    } else if (isMineBarr === undefined) {
      if (myUid) {
        const covertUidHash = BiliBili_midcrc();
        if (covertUidHash(uidHash) === myUid) { isMineBarrage = true }
      }
    }
    if (isMineBarrage) { textStyle.border = `2px solid ${divColor}` }

    const destroyBarr = (type: string) => {
      if (type === "4") {
        barrageAreaDOM.removeChild(barrageWrapper);
        // 减少距底端的位置，减少值为一个弹幕内容的高度
        this.fixedBottom -= this.contentHeight;
        if (this.fixedBottom < 0) { this.fixedBottom = 0 }
        this.fixedBarrTimers.splice(this.fixedBarrTimers.indexOf(fixedBarrTimer), 1);
      } else if (type === "5") {
        barrageAreaDOM.removeChild(barrageWrapper);
        this.fixedTop -= this.contentHeight;
        console.log("减：" + this.fixedTop)
        if (this.fixedTop < 0) { this.fixedTop = 0 }
        this.fixedBarrTimers.splice(this.fixedBarrTimers.indexOf(fixedBarrTimer), 1);
      } else {
        // 弹幕运动完成后移除监听，清除弹幕
        barrageWrapper.removeEventListener("animationend", handleAnimationEnd);
        barrageAreaDOM.removeChild(barrageWrapper);
        // 距顶端位置减少一个弹幕内容高度
        this.randomTop -= this.contentHeight;
        // 最小值边界判断
        if (this.randomTop < 0) { this.randomTop = 0 }
        // 清除已消失弹幕的样式缓存
        const inx = this.rollBarrStyles.indexOf(wrapperStyle);
        this.rollBarCSSStySheet.deleteRule(inx);
        this.rollBarrStyles.splice(inx, 1);
      }
    };

    /* 根据弹幕类型设置具体属性 */
    if (type === "4") {
      wrapperStyle.bottom = this.fixedBottom + "px";
      // 距离底端位置增加一个弹幕内容高度，防止固定弹幕重叠
      this.fixedBottom += this.contentHeight;
      // 最大值边界判断
      if (this.fixedBottom > this.viewHeight - this.contentHeight) { this.fixedBottom = 0 }
      // 居中放置
      wrapperStyle.left = (this.viewWidth - textWrapper.offsetWidth) / 2 + "px";
      // 新建一个可暂停的定时器，倒计时结束时移除弹幕并清除该定时器
      fixedBarrTimer = new pausedableTimer(() => destroyBarr(type), 5000)
    } else if (type === "5") {
      wrapperStyle.top = this.fixedTop + "px";
      this.fixedTop += this.contentHeight;
      console.log("加: " + this.fixedTop)
      if (this.fixedTop > this.viewHeight - this.contentHeight) { this.fixedTop = 0 }
      wrapperStyle.left = (this.viewWidth - textWrapper.offsetWidth) / 2 + "px";
      fixedBarrTimer = new pausedableTimer(() => destroyBarr(type), 5000);
    } else {
      wrapperStyle.top = `${this.randomTop}px`;
      // 使弹幕最左端位于视口右边界
      wrapperStyle.left = `${this.viewWidth}px`;
      // 距离顶端位置增加一个弹幕内容高度，防止滚动弹幕重叠
      this.randomTop += this.contentHeight;
      // 最大值边界判断
      if (this.randomTop > this.viewHeight - this.contentHeight) { this.randomTop = 0 }
      // 添加滚动动画及结束时的回调
      const x = - (this.viewWidth + textWrapper.offsetWidth);
      // uidHash + sendTime命名keyframes，以保证不重复；barr是因为不能以数字开头
      this.rollBarCSSStySheet.insertRule(`@keyframes barr${uidHash}${sendTime}{from {transform: translate3d(0, 0, 0);}to {transform: translate3d(${x}px, 0, 0)};}`);
      wrapperStyle.animation = `barr${uidHash}${sendTime} 5s linear`;
      this.rollBarrStyles.unshift(wrapperStyle);
      // 结束时的回调
      handleAnimationEnd = () => destroyBarr(type);
      barrageWrapper.addEventListener("animationend", handleAnimationEnd);
    }
    // 如果是固定弹幕则启动它的定时器并将该定时器存入fixedBarrTimers
    if (fixedBarrTimer) {
      fixedBarrTimer.resume();
      this.fixedBarrTimers.push(fixedBarrTimer);
    }

    /* 单独点击这条弹幕时的事件监听 */
    if (!this.props.isLive) {
      textWrapper.addEventListener("click", e => {
        e.stopPropagation();
        barrageWrapper.classList.add(style.clicked);

        getBarrLikeCount(oid, dmid).then(result => {
          const { code, data } = result.data;
          const manipulationBox = document.createElement("ul");
          let liked: boolean; // 是否已点赞该弹幕

          // 如果之前已经点开了一个manipulationBox，则销毁它并还原对应弹幕的状态
          if (this.manipulationTimer) {
            // 销毁前一个盒子
            this.manipulationTimer.executeCallback();
            this.manipulationTimer.destroy();
            // 恢复上一个打开box的弹幕的z-index
            this.curBarrDOM.classList.remove(style.clicked);
            // 视频播放时，恢复上一个打开box的弹幕的动画
            if (!this.props.paused) {
              this.singleClickTimer.executeCallback();
              this.singleClickTimer.destroy();
            }
          }

          // 视频播放时，暂停这条弹幕的动画、设置暂停倒计时
          if (!this.props.paused) {
            fixedBarrTimer ? fixedBarrTimer.pause() : wrapperStyle.animationPlayState = "paused";
            this.singleClickTimer = new pausedableTimer(() => fixedBarrTimer ? fixedBarrTimer.resume() : wrapperStyle.animationPlayState = "running", 3500);
            this.singleClickTimer.resume();
          }

          const handleLike = () => {
            const op = liked ? 2 : 1;
            thumbupBarr(dmid, oid, op).then(result => {
              const { code, data } = result;
              if (code === "0") {
                Toast.warning(data.message, false, null, 2000);
              } else {
                liked = !liked;
                renderingBox();
              }
            });
          };

          const handleReport = () => {

          };

          const handleWithdraw = () => {
            withdrawBarr(dmid, oid).then(result => {

              const { code, message } = result.data;
              if (code === 0) {
                Toast.info(message, false, null, 2000);
                barrageAreaDOM.appendChild(barrageWrapper);
                destroyBarr(type);
              } else {
                Toast.error(message, false, null, 2000);
              }
            });
          };

          const renderingBox = () => {
            ReactDOM.render(
              <>
                <li className={`${style.icon} ${style.like}`} key={"like"} onClick={handleLike}>
                  {liked ?
                    <span>
                      <svg className="icon" aria-hidden="true">
                        <use href="#icon-thumbupFilling"></use>
                      </svg>
                    </span> :
                    <span className={style.like}>
                      <svg className="icon" aria-hidden="true">
                        <use href="#icon-thumbup"></use>
                      </svg>
                    </span>
                  }
                </li>
                <li className={style.icon} key={"report"} onClick={handleReport}>
                  <svg className="icon" aria-hidden="true">
                    <use href="#icon-report"></use>
                  </svg>
                </li>
                {isMineBarrage &&
                  <li className={style.icon} key={"withdraw"} onClick={handleWithdraw}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-withdraw"></use>
                    </svg>
                  </li>
                }
              </>,
              manipulationBox
            )
          };

          if (code === 0) { for (let id in data) { liked = data[id].user_like === 1 } }
          manipulationBox.className = `${style.manipulation}`;
          manipulationBox.addEventListener("click", () => { // 点击某一操作后，重置动画暂停及盒子消失倒计时
            !this.props.paused && this.singleClickTimer.reset();
            this.manipulationTimer.reset();
          });
          renderingBox();
          barrageWrapper.appendChild(manipulationBox);

          this.manipulationTimer = new pausedableTimer(() => { // 设置这条弹幕的manipulationBox消失的倒计时
            manipulationBox.style.visibility = "hidden";
            barrageWrapper.classList.remove(style.clicked);
          }, 3500);
          this.manipulationTimer.resume();
          // 更新curBarrDOM
          this.curBarrDOM = barrageWrapper;
        });
      });
    }
  }

  public clear() {
    this.randomTop = 0;
    this.fixedTop = 0;
    this.fixedBottom = 0;
    const barrageDOM = this.barrageRef.current;
    const children = barrageDOM.children;
    // children是HTMLCollection类型的，因此要用Array.from()转成数组
    for (const child of Array.from(children)) { barrageDOM.removeChild(child) }

    // 清除样式相关的缓存
    this.fixedBarrTimers.forEach(timer => timer.destroy());
    this.fixedBarrTimers = [];
    for (let i = 0; i < this.rollBarCSSStySheet.cssRules.length; i++) { this.rollBarCSSStySheet.deleteRule(i) }
    // rollBarrStyles不需要逐个清除动画，因为不同于timer，动画及其animationend会随着DOM一并被销毁
    this.rollBarrStyles = [];
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
    const { setGestureType, setIsShowControlBar, setIsShowCenterVolume, setIsShowCenterBri } = this.props.barrageSetState;
    const { showControlsTemporally, setTimeupdateListener, showControls } = this.props.barrageMethods;
    const { videoRef, gesRef, curBrightnessRef, curVolumeRef, progressRef, currentTimeRef, showCtrBarRef } = this.props.barrageRefs;
    const videoDOM: HTMLVideoElement = videoRef.current;
    // 用barrageContainerDOM而不是videoAreaDOM的原因，见player.styl中各DOM的层级关系
    const barrageContainerDOM: HTMLDivElement = this.barrageRef.current;
    const isIos = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator',
      'iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) !== -1 ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document) // iPad on iOS 13 detection
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
      // e.preventDefault(); // 防止ControlBar隐藏时点击该区域也触发ControlBar的功能
      if (gesRef.current === 0) {
        if (!showCtrBarRef.current) { showControlsTemporally() }
        else { setIsShowControlBar(false) }
      } else if (gesRef.current === 1) {
        videoDOM.currentTime = timeAfterChange;
        videoDOM.addEventListener("timeupdate", setTimeupdateListener);
        showControlsTemporally();
      } else if (gesRef.current === 2) {
        setTimeout(() => { setIsShowCenterVolume(false) }, 200);
      } else {
        initBrightness = briAfterChange;
        setTimeout(() => { setIsShowCenterBri(false) }, 200);
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
        this.singleClickTimer?.pause();
      } else {
        this.fixedBarrTimers.forEach(timer => timer.resume());
        this.rollBarrStyles.forEach(style => style.animationPlayState = "running");
        this.singleClickTimer?.resume();
      }
    }
  }

  public componentWillUnmount() {
    removeEventListener("orientationchange", this.initBarrAreaSize);
  }

  public render() {
    return (
      <div className={style.barrArea} ref={this.barrageRef} />
    );
  }
}

export default Barrage;
