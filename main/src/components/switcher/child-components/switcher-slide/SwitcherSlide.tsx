import * as React from "react";
import style from "./switcher-slide.styl?css-modules";

interface SwitcherSlideProps {
  slideData: JSX.Element[],
  curFatherInx: number,
  scrollToWhenSwitch?: number,
  setFatherCurInx: Function,
  switchRatio: number, // 手指拖动超过该比例才切换
}

const { useState, useRef, useEffect } = React;

function SwitcherSlide(props: SwitcherSlideProps) {
  const { slideData, curFatherInx, scrollToWhenSwitch, setFatherCurInx, switchRatio } = props;
  const [preFatherInx, setPreFatherInx] = useState(0);
  const switchThreshold: number = switchRatio * outerWidth;
  const contentWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);

  // 解决闭包旧数据问题
  const [curInx, setCurInx] = useState(0);
  const curInxRef: React.MutableRefObject<number> = useRef(curInx);
  if (curInxRef.current !== curInx) {
    curInxRef.current = curInx;
  }

  function switchSlide(indx) {
    const slideDOM: HTMLDivElement = contentWrapperRef.current;
    const slideItems: HTMLCollection = slideDOM.children;
    const slideLen: number = slideItems.length;

    slideDOM.classList.add(style.moving);
    slideDOM.style.transform = `translate3d(-${indx * 100}vw, 0, 0)`;
    for (let i = 0; i < slideLen; i++) {
      const div = slideItems[i];
      if (i !== indx) {
        div.classList.remove(style.current);
      } else {
        div.classList.add(style.current);
      }
    }
  }

  // 根据手指滑动距离判断是否切换switcher
  function shouldSwitch(fingerMoveDistanceX: number) {
    const slideLen: number = contentWrapperRef.current.children.length;
    const fingerMoveXAbs: number = Math.abs(fingerMoveDistanceX);
    // 不能直接用curInx，否则会因为state closure，永远只能拿到curSlideInx的初始值
    const curI: number = curInxRef.current;
    const isNoContentSide: boolean = (curI === slideLen - 1 && fingerMoveDistanceX < 0) || (curI === 0 && fingerMoveDistanceX > 0)

    if (fingerMoveXAbs === 0) {
      return;
    } else if (fingerMoveXAbs < switchThreshold || isNoContentSide) {
      switchSlide(curI);
    } else {
      let inx: number;
      if (fingerMoveDistanceX < 0) {
        inx = curI + 1;
      } else {
        inx = curI - 1;
      }
      switchSlide(inx);
      setCurInx(inx);
      setFatherCurInx(inx);
      scrollTo(0, scrollToWhenSwitch);
    }
  }

  function setSlideListeners(slideDOM) {
    let initX = 0;
    let fingerMoveDistanceX = 0;

    // 拖动底部区域时切换推荐/评论
    slideDOM.addEventListener("touchstart", e => {
      initX = e.touches[0].pageX;
      slideDOM.classList.remove(style.moving);
    });
    slideDOM.addEventListener("touchmove", e => {
      fingerMoveDistanceX = e.touches[0].pageX - initX;
      const curPos = -outerWidth * curInxRef.current + fingerMoveDistanceX;
      slideDOM.style.transform = `translate3d(${curPos}px, 0, 0)`;
    });
    slideDOM.addEventListener("touchend", () => {
      shouldSwitch(fingerMoveDistanceX);
    });
  }

  useEffect((() => {
    const slideDOM: HTMLDivElement = contentWrapperRef.current;
    const slideItems: HTMLCollection = slideDOM.children;

    // 避免slideDOM.children取值较慢时slideItems为空，slideItems[0]
    if (slideItems.length > 0) {
      slideItems[0].classList.add(style.current);
      setSlideListeners(slideDOM);
    }
  }), []);

  // 当curFatherInx发生变化时进行切换
  if (curFatherInx !== preFatherInx) {
    switchSlide(curFatherInx);
    setPreFatherInx(curFatherInx);
    setCurInx(curFatherInx);
  }

  return (
    <div className={style.slideWrapper} >
      <div className={style.contentWrapper} ref={contentWrapperRef}>
        {slideData}
      </div>
    </div>
  );
}

export default SwitcherSlide;
