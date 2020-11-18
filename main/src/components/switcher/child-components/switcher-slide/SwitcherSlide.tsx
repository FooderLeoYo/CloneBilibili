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
  const switchThreshold = switchRatio * outerWidth;
  const contentWrapperRef = useRef(null);
  const [preFatherInx, setPreFatherInx] = useState(0);

  const [curInx, setCurInx] = useState(0);
  // 解决state closure问题
  const curInxRef = useRef(curInx);
  useEffect((() => {
    curInxRef.current = curInx;
  }), [curInx]);


  function switchSlide(indx) {
    const slideDOM = contentWrapperRef.current;
    const slideItems = slideDOM.children;
    const slideLen = slideItems.length;

    slideDOM.style.transform = `translateX(-${indx * 100}vw)`;
    for (let i = 0; i < slideLen; i++) {
      const div = slideItems[i];
      if (i !== indx) {
        div.classList.remove(style.current);
      } else {
        div.classList.add(style.current);
      }
    }
    scrollTo(0, scrollToWhenSwitch);
  }

  // 根据手指滑动距离判断是否切换switcher
  function shouldSwitch(fingerMoveDistanceX: number) {
    const slideDOM = contentWrapperRef.current;
    const slideItems = slideDOM.children;
    const slideLen = slideItems.length;
    const fingerMoveXAbs = Math.abs(fingerMoveDistanceX);
    // 不能直接用curInx，否则会因为state closure，永远只能拿到curSlideInx的初始值
    const curI = curInxRef.current;

    // 在推荐时手指往右或在评论时手指往左
    const isNoContentSide = (curI === slideLen - 1 && fingerMoveDistanceX < 0) || (curI === 0 && fingerMoveDistanceX > 0)

    if (fingerMoveXAbs === 0 || fingerMoveXAbs < switchThreshold || isNoContentSide) {
      return
    } else {
      let inx;
      if (fingerMoveDistanceX < 0) {
        inx = curI + 1;
      } else {
        inx = curI - 1;
      }
      switchSlide(inx);
      setCurInx(inx);
      setFatherCurInx(inx);
    }
  }

  function setSlideListeners(slideDOM) {
    let initX = 0;
    let fingerMoveDistanceX = 0;

    // 拖动底部区域切换推荐/评论
    slideDOM.addEventListener("touchstart", e => {
      e.stopPropagation();
      initX = e.touches[0].pageX;
    });
    slideDOM.addEventListener("touchmove", e => {
      let curX = e.touches[0].pageX;
      fingerMoveDistanceX = curX - initX;
    });
    slideDOM.addEventListener("touchend", () => {
      shouldSwitch(fingerMoveDistanceX);
    });
  }

  useEffect((() => {
    const slideDOM = contentWrapperRef.current;
    const slideItems = slideDOM.children;
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
      <button onClick={() => { console.log(curInx) }}>点击</button>
      <div className={style.contentWrapper} ref={contentWrapperRef}>
        {slideData}
      </div>
    </div>
  );
}

export default SwitcherSlide;
