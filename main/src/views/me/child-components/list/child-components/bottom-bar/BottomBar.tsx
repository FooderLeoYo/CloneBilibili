import * as React from "react";

import style from "./bottom-bar.styl?css-modules";

interface BottomBarProps {
  selectedStatus: number;
  setAllSelectedStatus: (status) => void;
}

const { useState, useEffect } = React;

function BottomBar(props: BottomBarProps) {
  const { selectedStatus, setAllSelectedStatus } = props;

  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(selectedStatus === 1 ? true : false);
  }, [selectedStatus]);
  return (
    <>
      <span
        className={style.circle}
        onClick={() => {
          setSelected(!selected);
          setAllSelectedStatus(selected ? 0 : 1);
        }}
      >
        {selected && <svg className="icon" aria-hidden="true">
          <use href="#icon-toast-success"></use>
        </svg>
        }
      </span>
      <span className={style.all}>全选</span>
      <span className={style.delete}>删除</span>
    </>
  )
}

export default BottomBar;
