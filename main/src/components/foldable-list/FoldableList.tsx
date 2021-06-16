import * as React from "react";

import style from "./foldable-list.styl?css-modules";

interface FoldableListProps {
  swichTitle: string;
  stickyPosition: string;
  content: JSX.Element;
  count?: number;
}

const { useState, useRef, useEffect } = React;

function FoldableList(props: FoldableListProps) {
  const { swichTitle, stickyPosition, content, count } = props;
  const [isShow, setIsShow] = useState(true);
  const [contentHeight, setContentHeight] = useState("");
  const contentRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const switchRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const iconRef: React.MutableRefObject<HTMLSpanElement> = useRef(null);

  const handleClick = () => {
    const contentStyle = contentRef.current.style;
    const iconDOM = iconRef.current;
    if (isShow) {
      // contentStyle.height = "0";
      contentRef.current.classList.add(style.hide);
      setTimeout(() => { iconDOM.classList.remove(style.show) }, 200);
    } else {
      // contentStyle.height = contentHeight;
      contentRef.current.classList.remove(style.hide);
      setTimeout(() => { iconDOM.classList.add(style.show) }, 200);
    }
    setIsShow(!isShow);
  }

  useEffect(() => {
    switchRef.current.style.top = stickyPosition;
  }, []);

  useEffect(() => {
    content && setContentHeight(getComputedStyle(contentRef.current)["height"]);
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