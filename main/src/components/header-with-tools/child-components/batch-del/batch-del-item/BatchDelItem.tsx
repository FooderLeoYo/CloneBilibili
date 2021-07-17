import * as React from "react";

import style from "./batch-del-item.styl?css-modules";

interface BatchDelItemProps {
  itemDOM: JSX.Element;
  mulDeleting: boolean;
  handleClick?: Function;
  batchDelList: Array<any>;
  batDelItemInx: number;
  header: any;
  setBatchDelList: Function;
}


function BatchDelItem(props: BatchDelItemProps) {
  const { itemDOM, mulDeleting, handleClick, batchDelList, batDelItemInx,
    header, setBatchDelList } = props;

  const switchSelStatus = (batchDelList, batDelItemInx: number, header) => {
    const temp = [...batchDelList];
    temp[batDelItemInx].selected = !temp[batDelItemInx].selected;
    setBatchDelList(temp);
    header.checkAllSelectedStatus();
  }

  return (
    <div className={style.batDelItem} onClick={() => {
      !mulDeleting && handleClick();
      switchSelStatus(batchDelList, batDelItemInx, header);
    }} >
      {mulDeleting && <span className={style.circle}>
        {batchDelList[batDelItemInx].selected && <svg className="icon" aria-hidden="true">
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