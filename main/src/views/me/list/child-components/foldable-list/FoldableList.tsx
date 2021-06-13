import * as React from "react";

import style from "./foldable-list.styl?css-modules";

interface FoldableListProps {
  swichTitle: string;
  content: JSX.Element;
  count?: number;
}

const { useState, useRef, useEffect } = React;

function FoldableList(props: FoldableListProps) {
  const { swichTitle, content, count } = props;
  const [isHide, setIsHide] = useState(true);
  const [contentHeight, setContentHeight] = useState("");
  const contentRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const iconRef: React.MutableRefObject<HTMLSpanElement> = useRef(null);

  const handleClick = () => {
    const contentStyle = contentRef.current.style;
    const iconDOM = iconRef.current;
    if (isHide) {
      contentStyle.height = contentHeight;
      iconDOM.classList.add(style.show);
    } else {
      contentStyle.height = "0";
      iconDOM.classList.remove(style.show);
    }
    setIsHide(!isHide);
  }

  useEffect(() => {
    if (content) {
      console.log(content)
      // console.log(getComputedStyle(contentRef.current)["height"])
      setContentHeight(getComputedStyle(contentRef.current)["height"]);
      contentRef.current.classList.add(style.setZero);
    }
  }, [content])

  return (
    <>
      <div className={style.switch} onClick={handleClick}>
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