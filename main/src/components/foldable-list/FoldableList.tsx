import * as React from "react";

import style from "./foldable-list.styl?css-modules";

interface FoldableListProps {
  swichTitle: string;
  stickyPosition: string;
  content: JSX.Element;
  count?: number;
  shouldOpen?: boolean;
}

const { useState, useRef, useEffect } = React;

function FoldableList(props: FoldableListProps) {
  const { swichTitle, stickyPosition, content, count, shouldOpen } = props;
  const [isClose, setIsClese] = useState(true);
  const [contentHeight, setContentHeight] = useState("");
  const contentRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const switchRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const iconRef: React.MutableRefObject<HTMLSpanElement> = useRef(null);

  const handleClick = () => {
    const contentStyle = contentRef.current.style;
    const iconDOM = iconRef.current;
    if (isClose) {
      contentStyle.height = contentHeight;
      setTimeout(() => { iconDOM.classList.add(style.show) }, 200);
    } else {
      contentStyle.height = "0";
      setTimeout(() => { iconDOM.classList.remove(style.show) }, 200);
    }
    setIsClese(!isClose);
  }

  useEffect(() => {
    switchRef.current.style.top = stickyPosition;
  }, []);

  useEffect(() => {
    if (content) {
      const heightAfterGettingData = getComputedStyle(contentRef.current)["height"];
      setContentHeight(heightAfterGettingData);
      if (shouldOpen) {
        contentRef.current.style.height = heightAfterGettingData; // content要设置height，第一次点击switch时transition才能起效
        setIsClese(false);
      } else {
        contentRef.current.style.height = "0"; // content要设置height，第一次点击switch时transition才能起效
      }
    }
  }, [content]);

  return (
    <>
      <div className={style.switch} onClick={handleClick} ref={switchRef}>
        <span className={style.icon} ref={iconRef}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-arrowDownBig"></use>
          </svg>
        </span>
        <span className={style.title}>{swichTitle}</span>
        {count && <span className={style.count}> · {count}</span>}
      </div>
      <div className={style.contentWrapper} ref={contentRef}>{content}</div>
    </>
  )
}

export default FoldableList;