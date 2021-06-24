import * as React from "react";
import style from "./clean-text.styl?css-modules";

interface CleanTextProps {
  inputDOMRef: React.MutableRefObject<HTMLInputElement>;
  clickMethods?: Function;
}

const { useState, useRef, useEffect, useImperativeHandle, forwardRef } = React;

const CleanText = forwardRef((props: CleanTextProps, ref) => {
  const { inputDOMRef, clickMethods } = props;
  const [firstLetter, setFirstLetter] = useState(true);
  const btnRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    const cleanBtnDOM = btnRef.current;
    const inputDOM = inputDOMRef.current;

    inputDOM.value.length > 0 && cleanBtnDOM.classList.add(style.show);
    clickMethods && cleanBtnDOM.addEventListener("click", () => { clickMethods() });
    cleanBtnDOM.addEventListener("click", () => {
      inputDOM.value = "";
      cleanBtnDOM.classList.remove(style.show);
      setFirstLetter(true);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    checkIfShow: value => {
      if (value.length > 0 && firstLetter) {
        btnRef.current.classList.add(style.show);
        setFirstLetter(false);
      } else {
        btnRef.current.classList.remove(style.show);
      }
    }
  }), []);

  return (
    <div className={style.cleanBtn} ref={btnRef}>
      <svg className="icon" aria-hidden="true">
        <use href="#icon-close"></use>
      </svg>
    </div>
  )
})

export default CleanText;
