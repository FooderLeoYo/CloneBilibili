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
  const contentWrapperRef = useRef(null);

  const [preFatherInx, setPreFatherInx] = useState(0);
  const [curSlideInx, setCurSlideInx] = useState(0);

  const slideDOM = contentWrapperRef.current;
  const slideItems = slideDOM ? slideDOM.children : {};
  let len;
  const switchThreshold = switchRatio * outerWidth;

  function switchSlide(indx) {
    slideDOM.style.transform = `translateX(-${indx * 100}vw)`;
    for (let i = 0; i < len; i++) {
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
    const fingerMoveXAbs = Math.abs(fingerMoveDistanceX);

    // 在推荐时手指往右或在评论时手指往左
    const isNoContentSide = (curSlideInx === len - 1 && fingerMoveDistanceX < 0) || (curSlideInx === 0 && fingerMoveDistanceX > 0)
    console.log(slideItems);
    console.log("len:" + len)
    console.log("curSlideInx:" + curSlideInx)
    console.log("fingerMoveDistanceX:" + fingerMoveDistanceX);
    console.log("isNoContentSide:" + isNoContentSide);

    if (fingerMoveXAbs === 0 || fingerMoveXAbs < switchThreshold || isNoContentSide) {
      console.log("不跳转")
      return
    } else {
      let inx;
      if (fingerMoveDistanceX < 0) {
        inx = curSlideInx + 1
      } else {
        inx = curSlideInx - 1
      }
      switchSlide(inx);
      setCurSlideInx(inx);
      setFatherCurInx(inx);
      console.log(curSlideInx)
    }
  }

  function setSlideListeners() {
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

  // 确保slideDOM已生成后，才设置相关参数
  useEffect((() => {
    if (len > 0) {
      len = slideItems.length;
      slideItems[0].classList.add(style.current);
      setSlideListeners();
    }
  }), [slideItems])

  // 监听curTabInx，发生变化时进行切换
  if (curFatherInx !== preFatherInx) {
    switchSlide(curFatherInx);
    setPreFatherInx(curFatherInx);
    setCurSlideInx(curFatherInx);
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
