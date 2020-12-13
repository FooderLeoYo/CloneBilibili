import * as React from "react";
import style from "./switcher-slide.styl?css-modules";

interface SwitcherSlideProps {
  slideData: JSX.Element[],
  curFatherInx: number,
  setFatherCurInx: Function,
  switchRatio: number, // 手指拖动超过该比例才切换
  doSthWithNewInx?: Function
}

const { useState, useRef, useEffect } = React;

function SwitcherSlide(props: SwitcherSlideProps) {
  const { slideData, curFatherInx, setFatherCurInx, switchRatio, doSthWithNewInx } = props;
  const [preFatherInx, setPreFatherInx] = useState(0);
  const switchThreshold: number = switchRatio * outerWidth;
  const contentWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [curInx, setCurInx] = useState(0);
  const curInxRef: React.MutableRefObject<number> = useRef(curInx);
  if (curInxRef.current !== curInx) {
    curInxRef.current = curInx;
  }

  const [gestureType, setGestureType] = useState(-1); // 0代表上下滑动，1代表左右滑动
  const gesRef: React.MutableRefObject<number> = useRef(gestureType);
  if (gesRef.current !== gestureType) {
    gesRef.current = gestureType;
  }

  const [preY, setPreY] = useState(0);
  const preYRef: React.MutableRefObject<number> = useRef(preY);
  if (preYRef.current !== preY) {
    preYRef.current = preY;
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
  function shouldSwitch(moveDistanceX: number) {
    const slideLen: number = contentWrapperRef.current.children.length;
    const moveXAbs: number = Math.abs(moveDistanceX);
    // 不能直接用curInx，否则会因为state closure，永远只能拿到curSlideInx的初始值
    const curI: number = curInxRef.current;
    const isNoContentSide: boolean = (curI === slideLen - 1 && moveDistanceX < 0) || (curI === 0 && moveDistanceX > 0)
    const prePos = preYRef.current;

    if (moveXAbs === 0) {
      return;
    } else if (moveXAbs < switchThreshold || isNoContentSide) {
      switchSlide(curI);
    } else {
      let inx: number;
      if (moveDistanceX < 0) {
        inx = curI + 1;
      } else {
        inx = curI - 1;
      }

      switchSlide(inx);
      setCurInx(inx);
      setFatherCurInx(inx);
      // 跳转到之前浏览的位置
      const y = pageYOffset;
      scrollTo(0, prePos);
      setPreY(y);
      // 父组件回调
      doSthWithNewInx(inx);
    }
  }

  // 保证手指拖动时只沿x或y滑动
  function avoidSway(moveDistance, DOM, e) {
    const curGes = gesRef.current;

    if (curGes === 0 || (curGes === -1 && Math.abs(moveDistance.x) < Math.abs(moveDistance.y))) {
      if (gestureType !== 0) {
        setGestureType(0);
      }
      return;
    } else {
      e.preventDefault();
      if (gestureType !== 1) {
        setGestureType(1);
      }
      DOM.style.transform =
        `translate3d(${-outerWidth * curInxRef.current + moveDistance.x}px, 0, 0)`;
    }
  }

  function setSlideListeners(slideDOM) {
    let startPos = {
      x: 0,
      y: 0
    };
    let moveDistance = {
      x: 0,
      y: 0
    };

    // 拖动底部区域时切换推荐/评论
    slideDOM.addEventListener("touchstart", e => {
      setGestureType(-1);
      startPos = {
        x: e.touches[0].pageX,
        y: e.targetTouches[0].pageY
      };
      slideDOM.classList.remove(style.moving);
    });
    slideDOM.addEventListener("touchmove", e => {
      moveDistance = {
        x: e.touches[0].pageX - startPos.x,
        y: e.touches[0].pageY - startPos.y
      };
      avoidSway(moveDistance, slideDOM, e);
    });
    slideDOM.addEventListener("touchend", () => {
      shouldSwitch(moveDistance.x);
    });
  }

  useEffect((() => {
    const slideDOM: HTMLDivElement = contentWrapperRef.current;
    const slideItems: any = slideDOM.children;
    const slideLen = slideItems.length;

    // 避免slideDOM.children取值较慢时slideItems为空，slideItems[0]
    if (slideLen > 0) {
      for (let i = 1; i < slideLen; i++) {
        slideItems[i].style.transform = `translate3d(${i * 100}vw, 0, 0)`;
      }
      slideItems[0].classList.add(style.current);
      setSlideListeners(slideDOM);
      setPreY(slideDOM.getBoundingClientRect().top);
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
