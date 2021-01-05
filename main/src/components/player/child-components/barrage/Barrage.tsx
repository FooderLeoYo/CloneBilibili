import * as React from "react";
import { getTransitionEndName } from "../../../../customed-methods/compatible";
import { formatDuration } from "../../../../customed-methods/string";

/**
 * 弹幕类型
 * RANDOM: 随机位置
 * FIXED: 固定在中间
 */
enum BarrageType {
  RANDOM = 1,
  FIXED
}

interface BarrageData {
  type: BarrageType;
  color: string;
  content: string;
}

interface BarrageProps {
  isLive: boolean,
  refProps: {
    videoRef: React.RefObject<HTMLVideoElement>,
    curBrightnessRef: React.RefObject<HTMLDivElement>,
    curVolumeRef: React.RefObject<HTMLSpanElement>,
    gesRef: React.MutableRefObject<number>,
    progressRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLSpanElement>,
    showCtrBarRef: React.MutableRefObject<boolean>,
  },
  setStateProps: {
    setGestureType: React.Dispatch<React.SetStateAction<number>>,
    setIsShowCenterVolume: React.Dispatch<React.SetStateAction<boolean>>,
    setIsShowCenterBri: React.Dispatch<React.SetStateAction<boolean>>,
    setIsShowControlBar: React.Dispatch<React.SetStateAction<boolean>>,
  },
  methods: {
    setTimeupdateListener: () => void,
    showControls: () => void,
    showControlsTemporally: () => void,
  },
  fontSize?: string,
  opacity?: number,
  barrages?: BarrageData[]
}

/**
 * 使用纯组件，不发生update，发射弹幕采用DOM操作
 */
class Barrage extends React.PureComponent<BarrageProps> {
  /* 以下为初始化 */
  public viewWidth: number; // 弹幕区域的宽度
  public viewHeight: number; // 弹幕区域的高度
  private barrageRef: React.RefObject<HTMLDivElement>;
  private contentHeight: number; // 一条弹幕的高度
  private randomTop: number = 0; // 随机弹幕距离弹幕区域顶端的竖直距离
  private fixedTop: number = 0; // 固定弹幕距离弹幕区域顶端的竖直距离
  private fontSize: string;
  private opacity: number;

  constructor(props) {
    super(props);
    this.barrageRef = React.createRef();
    this.fontSize = props.fontSize || "0.8rem";
    this.opacity = props.opacity || 1;
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    this.init();
  }

  public componentWillUnmount() {
    this.clear();
  }

  /* 以下为自定义方法 */
  // 初始化弹幕区域大小和contentHeight
  private init() {
    this.initBarrageDomSize();
    // 初始化contentHeight
    // this.fontSize由于类型原因，不能直接赋值给this.contentHeight
    // 因此要建一个临时的div并应用该contentHeight
    // 然后再将div.offsetHeight赋值给this.contentHeight
    const div = document.createElement("div");
    div.innerHTML = "div";
    div.style.fontSize = this.fontSize;
    // 末尾加[0]的原因是：getElementsByTagName返回的是一个数组
    // 因此即使只有一个元素，也要用[0]才能取到
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(div);
    // 弹幕内容高度
    this.contentHeight = div.offsetHeight;
    body.removeChild(div);

    // 如果父组件有弹幕传递过来，则显示这些弹幕（一般没有）
    const { barrages } = this.props;
    if (barrages) {
      for (const barrage of barrages) {
        this.send(barrage);
      }
    }
  }

  //  初始化弹幕容器宽高
  public initBarrageDomSize() {
    const barrageDOM = this.barrageRef.current;
    // 弹幕区域宽
    this.viewWidth = barrageDOM.offsetWidth;
    // 弹幕区域高
    this.viewHeight = barrageDOM.offsetHeight;
  }

  //  创建弹幕元素
  private createBarrageElem(barrage: BarrageData) {
    const div = document.createElement("div");
    div.innerHTML = barrage.content;
    const style: any = {
      position: "absolute",
      fontFamily: "黑体",
      fontSize: "0.8rem",
      fontWeight: "bold",
      whiteSpace: "pre",
      textShadow: "rgb(0, 0, 0) 1px 1px 2px",
      color: barrage.color,
      opacity: this.opacity
    };
    // 随机滚动
    if (barrage.type !== BarrageType.FIXED) {
      style.top = `${this.randomTop}px`,
        style.left = `${this.viewWidth}px`,
        // transition是过渡，transform是具体的变化
        style.webkitTransition = "-webkit-transform 5s linear 0s";
      style.transition = "transform 5s linear 0s";
      const transitionName = getTransitionEndName(div);
      const handleTransitionEnd = () => {
        // 弹幕运动完成后移除监听，清除弹幕
        // 这里是移除handleTransitionEnd，不涉及递归
        div.removeEventListener(transitionName, handleTransitionEnd);
        this.barrageRef.current.removeChild(div);
        // 距顶端位置减少一个弹幕内容高度
        this.randomTop -= this.contentHeight;
        // 最小值边界判断
        if (this.randomTop < 0) {
          this.randomTop = 0;
        }
      };

      div.addEventListener(transitionName, handleTransitionEnd);
      // 距离顶端位置增加一个弹幕内容高度，防止滚动弹幕重叠
      this.randomTop += this.contentHeight;
      // 最大值边界判断
      if (this.randomTop > this.viewHeight - this.contentHeight) {
        this.randomTop = 0;
      }
    } else {
      div.style.top = this.fixedTop + "px";
      // 距离顶端位置增加一个弹幕内容高度，防止固定弹幕重叠
      this.fixedTop += this.contentHeight;
      // 最大值边界判断
      if (this.fixedTop > this.viewHeight - this.contentHeight) {
        this.fixedTop = 0;
      }
    }

    for (const k in style) {
      //  void 0等价于undefined，而且不能被重写且能节省字节
      if (style[k] !== void 0) {
        div.style[k] = style[k];
      }
    }

    return div;
  }

  //  发送弹幕
  public send(barrage: BarrageData) {
    const barrageDOM = this.barrageRef.current;
    const barrageElem = this.createBarrageElem(barrage);
    barrageDOM.appendChild(barrageElem);

    if (barrage.type !== BarrageType.FIXED) {
      const x = - (this.viewWidth + barrageElem.offsetWidth);
      setTimeout(() => {
        // transition是过渡，transform是具体的变化
        barrageElem.style.webkitTransform = `translate3d(${x}px, 0, 0)`;
        barrageElem.style.transform = `translate3d(${x}px, 0, 0)`;
      }, 10); // 这里的10不是动画时间，而是等待组件加载，然后才添加style
    } else {
      // 居中放置
      barrageElem.style.left = (this.viewWidth - barrageElem.offsetWidth) / 2 + "px";
      // 移除弹幕
      setTimeout(() => {
        // if (barrageElem.parentNode === barrageDOM) {
        barrageDOM.removeChild(barrageElem);
        // 距顶端位置减少一个弹幕内容高度
        this.fixedTop -= this.contentHeight;
        if (this.fixedTop < 0) {
          this.fixedTop = 0;
        }
        // }
      }, 5000);
    }
  }

  //  清除弹幕
  public clear() {
    this.randomTop = 0;
    this.fixedTop = 0;
    const barrageDOM = this.barrageRef.current;
    const children = barrageDOM.children;
    // children是HTMLCollection类型的，因此要用Array.from()转成数组
    for (const child of Array.from(children)) {
      barrageDOM.removeChild(child);
    }
  }

  public setFingerListener() {
    // 用barrageContainerDOM而不是videoAreaDOM的原因，见player.styl中各DOM的层级关系
    const barrageContainerDOM = this.barrageRef.current;
    const videoDOM = this.props.refProps.videoRef.current;
    const gesRef = this.props.refProps.gesRef.current;
    const setGestureType = this.props.setStateProps.setGestureType;

    let barrageWidth = 0;
    let barrageHeight = 0;
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

    this.props.refProps.curBrightnessRef.current.style.width = `100%`;
    this.props.refProps.curVolumeRef.current.style.width = `100%`;

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
      if (!this.props.isLive && gesRef === 1 || (gesRef === 0 &&
        Math.abs(moveRatio.x) > Math.abs(moveRatio.y))) { // 左右滑动
        const progressDOM = this.props.refProps.progressRef.current;
        const currentTimeDOM = this.props.refProps.currentTimeRef.current;
        let progressAfterChange = initProgress + moveRatio.x;

        if (gesRef !== 1) { setGestureType(1); }
        videoDOM.removeEventListener("timeupdate", this.props.methods.setTimeupdateListener);
        this.props.methods.showControls();

        if (progressAfterChange > 1 || progressAfterChange < 0) { return; }
        else {
          timeAfterChange = initTime + videoDOM.duration * moveRatio.x;
          currentTimeDOM.innerHTML = formatDuration(timeAfterChange, "0#:##");
          progressDOM.style.width = `${progressAfterChange * 100}%`;
        }
      } else if (gesRef === 2 || (gesRef === 0 &&
        curPos.x > barrageWidth / 2)) { // 右边的上下滑动
        if (gesRef !== 2) { setGestureType(2); }
        this.props.setStateProps.setIsShowCenterVolume(true);

        let volumeAfterChange = initVolume - moveRatio.y; // y轴向下为正，因此取反
        if (volumeAfterChange < 0 || volumeAfterChange > 1) { return; }
        else {
          this.props.refProps.curVolumeRef.current.style.width = `${volumeAfterChange * 100}%`;
          videoDOM.volume = volumeAfterChange;
        }
      } else { // 左边的上下滑动
        if (gesRef !== 3) { setGestureType(3); }
        this.props.setStateProps.setIsShowCenterBri(true);

        briAfterChange = initBrightness - moveRatio.y;
        // 这个重置必须有，否则下次滑动时，briAfterChange将是负数
        // 而进度和音量不用重置，是因为它们本来就被限定在0~1之间，而亮度则可以大于1和取负数
        if (briAfterChange < 0) { briAfterChange = 0; }
        else if (briAfterChange > 1) { briAfterChange = 1; }
        else {
          this.props.refProps.curBrightnessRef.current.style.width = `${briAfterChange * 100}%`;
          videoDOM.style.filter = `brightness(${briAfterChange})`;
        }
      }
    });

    barrageContainerDOM.addEventListener("touchend", e => {
      e.stopPropagation();

      if (gesRef === 0) {
        if (!this.props.refProps.showCtrBarRef.current) { this.props.methods.showControlsTemporally(); }
        else { this.props.setStateProps.setIsShowControlBar(false); }
      } else if (gesRef === 1) {
        videoDOM.currentTime = timeAfterChange;
        videoDOM.addEventListener("timeupdate", this.props.methods.setTimeupdateListener);
        this.props.methods.showControlsTemporally();
      } else if (gesRef === 2) {
        setTimeout(() => { this.props.setStateProps.setIsShowCenterVolume(false); }, 200);
      } else {
        initBrightness = briAfterChange;
        setTimeout(() => { this.props.setStateProps.setIsShowCenterBri(false); }, 200);
      }
    });
  }

  /* 以下为渲染部分 */
  public render() {
    const style: any = {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden"
    };
    return (
      <div style={style} ref={this.barrageRef} />
    );
  }
}

export { BarrageType };

export default Barrage;
