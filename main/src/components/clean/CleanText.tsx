import * as React from "react";

import style from "./cleantext.styl?css-modules";


interface CleanProps {
  inputValue: string;
  inputDOMRef: React.MutableRefObject<HTMLInputElement>;
  clickMethods?: Function;
}

const { useState, useRef, useEffect } = React;

function CleanText(props: CleanProps) {
  const { inputValue, inputDOMRef, clickMethods } = props;

  const [firstLetter, setFirstLetter] = useState(true);

  const btnRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    const cleanBtnDOM = btnRef.current;

    if (inputValue.length > 0) { cleanBtnDOM.classList.add(style.show); }
    if (clickMethods) { cleanBtnDOM.addEventListener("click", () => { clickMethods(); }); }

    cleanBtnDOM.addEventListener("click", () => {
      inputDOMRef.current.value = "";
      cleanBtnDOM.classList.remove(style.show);
      setFirstLetter(true);
    });
  }, []);

  useEffect(() => {
    if (inputValue.length > 0 && firstLetter) {
      btnRef.current.classList.add(style.show);
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

export default CleanText;
