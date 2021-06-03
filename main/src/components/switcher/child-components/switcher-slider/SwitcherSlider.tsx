import * as React from "react";
import style from "./switcher-slider.styl?css-modules";

interface SwitcherSliderProps {
  sliderData: JSX.Element[],
  curFatherInx: number,
  setFatherCurInx: Function,
  switchRatio: number, // 手指拖动超过该比例才切换
  switchType: number,
  setSwitchType: Function
  scrollToAtFirstSwitch?: number,
  doSthWithNewInx?: Function
}

const { useState, useRef, useEffect } = React;

function SwitcherSlider(props: SwitcherSliderProps) {
  /* 以下为初始化 */
  const { sliderData, curFatherInx, setFatherCurInx, switchRatio, switchType, setSwitchType, scrollToAtFirstSwitch, doSthWithNewInx } = props;
  const switchThreshold: number = switchRatio * outerWidth;
  const contentWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);

  /* 解决事件回调中的闭包问题 */
  const [curInx, setCurInx] = useState(0);
  const curInxRef: React.MutableRefObject<number> = useRef(curInx);
  if (curInxRef.current !== curInx) { curInxRef.current = curInx; }

  const [gestureType, setGestureType] = useState(-1); // 0代表上下滑动，1代表左右滑动
  const gesRef: React.MutableRefObject<number> = useRef(gestureType);
  if (gesRef.current !== gestureType) { gesRef.current = gestureType; }

  const [preY, setPreY] = useState(0);
  const preYRef: React.MutableRefObject<number> = useRef(preY);
  if (preYRef.current !== preY) { preYRef.current = preY; }

  const switchTypeRef: React.MutableRefObject<number> = useRef(switchType);
  if (switchTypeRef.current !== switchType) { switchTypeRef.current = switchType; }

  function switchSlider(indx) {
    const sliderDOM: HTMLDivElement = contentWrapperRef.current;
    const sliderItems: HTMLCollection = sliderDOM.children;
    const sliderLen: number = sliderItems.length;

    sliderDOM.classList.add(style.moving);
    sliderDOM.style.transform = `translate3d(-${indx * 100}vw, 0, 0)`;

    for (let i = 0; i < sliderLen; i++) {
      const div = sliderItems[i];

      if (i !== indx) { div.classList.remove(style.current); }
      else { div.classList.add(style.current); }
    }
  }

  function scrollToLastPos() {
    const leaveY = pageYOffset;
    const jumpTo = preYRef.current;

    // 放在延迟中是因为要等切换到的slide添加style.current，不然slide高度为0
    // 由于加了延迟，所以这里不能直接用preYRef.current，否则拿到的就是下面setPreY以后的新值
    // 而是改为利用闭包拿到旧值
    setTimeout(() => { scrollTo(0, jumpTo); }, 1);
    setPreY(leaveY);
  }

  // 根据手指滑动距离判断是否切换switcher
  function shouldSwitch(moveDistanceX: number) {
    const sliderLen: number = contentWrapperRef.current.children.length;
    const moveXAbs: number = Math.abs(moveDistanceX);
    // 不能直接用curInx，否则会因为state closure，永远只能拿到curSliderInx的初始值
    const curI: number = curInxRef.current;
    const isNoContentSide: boolean = (curI === sliderLen - 1 && moveDistanceX < 0) || (curI === 0 && moveDistanceX > 0)

    if (moveXAbs === 0) { return; }
    else if (moveXAbs < switchThreshold || isNoContentSide) {
      switchSlider(curI);
    } else {
      let inx: number;
      if (moveDistanceX < 0) { inx = curI + 1; }
      else { inx = curI - 1; }

      if (switchTypeRef.current === 1) { setSwitchType(0); }
      scrollToLastPos();
      switchSlider(inx);
      setFatherCurInx(inx);
      setCurInx(inx);
      // 父组件回调
      if (doSthWithNewInx) { doSthWithNewInx(inx); }
    }
  }

  // 保证手指拖动时只沿x或y滑动
  function avoidSway(moveDistance, DOM, e) {
    const curGes = gesRef.current;

    if (curGes === 0 || (curGes === -1 && Math.abs(moveDistance.x) < Math.abs(moveDistance.y))) {
      if (gestureType !== 0) { setGestureType(0); }
      return;
    } else {
      e.preventDefault();
      if (gestureType !== 1) { setGestureType(1); }
      DOM.style.transform = `translate3d(${-outerWidth * curInxRef.current + moveDistance.x}px, 0, 0)`;
    }
  }

  function setSliderListeners(sliderDOM) {
    let startPos = {
      x: 0,
      y: 0
    };
    let moveDistance = {
      x: 0,
      y: 0
    };

    // 拖动底部区域时切换推荐/评论
    sliderDOM.addEventListener("touchstart", e => {
      setGestureType(-1);
      startPos = {
        x: e.touches[0].pageX,
        y: e.targetTouches[0].pageY
      };
      sliderDOM.classList.remove(style.moving);
    });
    sliderDOM.addEventListener("touchmove", e => {
      moveDistance = {
        x: e.touches[0].pageX - startPos.x,
        y: e.touches[0].pageY - startPos.y
      };
      avoidSway(moveDistance, sliderDOM, e);
    });
    sliderDOM.addEventListener("touchend", () => shouldSwitch(moveDistance.x));
  }

  useEffect(() => {
    const sliderDOM: HTMLDivElement = contentWrapperRef.current;
    const sliderItems: any = sliderDOM.children;
    const sliderLen = sliderItems.length;

    // 避免sliderDOM.children取值较慢时sliderItems为空，sliderItems[0]
    if (sliderLen > 0) {
      for (let i = 1; i < sliderLen; i++) {
        sliderItems[i].style.transform = `translate3d(${i * 100}vw, 0, 0)`;
      }
      sliderItems[0].classList.add(style.current);
      setSliderListeners(sliderDOM);
    }
  }, []);

  useEffect(() => {
    if (scrollToAtFirstSwitch) { setPreY(scrollToAtFirstSwitch); }
  }, [scrollToAtFirstSwitch])

  useEffect(() => {
    if (switchType === 1) {
      scrollToLastPos();
      switchSlider(curFatherInx);
      setCurInx(curFatherInx);
    }
  }, [curFatherInx]);

  return (
    <div className={style.sliderWrapper} >
      <div className={style.contentWrapper} ref={contentWrapperRef}>
        {sliderData}
      </div>
    </div>
  );
}

export default SwitcherSlider;
