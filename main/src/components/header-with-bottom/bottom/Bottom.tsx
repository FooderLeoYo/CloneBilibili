import * as React from "react";

import style from "./bottom.styl?css-modules";

const { useRef, useEffect } = React;

function Bottom() {

  const overlayRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    overlayRef.current.addEventListener("touchmove", e => e.preventDefault());
  }, []);

  return (
    <div>
      <div className={style.manipulations}>

      </div>
      <div className={style.overlay} ref={overlayRef} />
    </div>
  )
}

export default Bottom;
