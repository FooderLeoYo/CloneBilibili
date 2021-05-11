import * as React from "react";

import style from "./clean.styl?css-modules";


interface CleanProps {
  inputValue: string;
  inputDOMRef: React.MutableRefObject<HTMLInputElement>;
}

const { useState, useRef, useEffect } = React;

function Clean(props: CleanProps) {
  const { inputValue, inputDOMRef } = props;

  const [firstLetter, setFirstLetter] = useState(false);

  const btnRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    const cleanBtnDOM = btnRef.current;
    cleanBtnDOM.addEventListener("click", () => {
      inputDOMRef.current.value = "";
      cleanBtnDOM.classList.add(style.hide);
      setFirstLetter(true);
    })
  }, []);

  useEffect(() => {
    if (firstLetter) {
      btnRef.current.classList.remove(style.hide);
      setFirstLetter(false);
    }
  }, [inputValue]);


  return (
    <div className={style.cleanBtn} ref={btnRef}>
      <svg className="icon" aria-hidden="true">
        <use href="#icon-close"></use>
      </svg>
    </div>
  )
}

export default Clean;
