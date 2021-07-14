import * as React from "react";

import style from "./batch-del-item.styl?css-modules";

interface BatchDelItemProps {
  itemDOM: JSX.Element;
  mulDeleting: boolean;
  selected?: boolean;
  clickMethod?: Function;
}

function BatchDelItem(props: BatchDelItemProps) {
  const { itemDOM, mulDeleting, selected, clickMethod } = props;

  const handleClick = () => {
    clickMethod()
  }

  return (
    <div className={style.batDelItem} onClick={handleClick} >
      {mulDeleting && <span className={style.circle}>
        {selected && <svg className="icon" aria-hidden="true">
          <use href="#icon-toast-success"></use>
        </svg>
        }
      </span>
      }
      <div className={`${style.contentWrapper}${mulDeleting ? " " + style.editting : ""}`}>
        {itemDOM}
      </div>
    </div>
  )
}

export default BatchDelItem;