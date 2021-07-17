import * as React from "react";

import style from "./batch-del-bottom.styl?css-modules";

interface BatchDelBottomProps {
  bottomSelected: number;
  setAllSelectedStatus: (status) => void;
  handleMulDel: Function;
}

const { useState, useEffect } = React;

function BatchDelBottom(props: BatchDelBottomProps) {
  const { bottomSelected, setAllSelectedStatus, handleMulDel } = props;

  const [selected, setSelected] = useState(false);
  const [hasSelectedItem, setHasSelectedItem] = useState(false);

  useEffect(() => {
    setSelected(bottomSelected === 1 ? true : false);
    setHasSelectedItem(bottomSelected === 0 ? false : true);
  }, [bottomSelected]);

  return (
    <div className={style.bottomWrapper}>
      <div className={style.all} onClick={() => {
        setSelected(!selected);
        setAllSelectedStatus(selected ? 0 : 1);
      }}>
        <span className={style.circle}>
          <span className={style.hollow} />
          {selected &&
            <span className={style.solid}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-toast-success"></use>
              </svg>
            </span>
          }
        </span>
        <span className={style.word}>全选</span>
      </div>
      <div
        className={hasSelectedItem ? style.delete + " " + style.actived : style.delete}
        onClick={hasSelectedItem ? () => handleMulDel() : null}
      >删除
      </div>
    </div>
  )
}

export default BatchDelBottom;
