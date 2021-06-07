import * as React from "react";

import style from "./bottom-bar.styl?css-modules";

interface BottomBarProps {
  allSelected: boolean;
  setAllSelected: Function;
  setAllCancled: Function;
}

const { useState, useEffect } = React;

function BottomBar(props: BottomBarProps) {
  const { allSelected, setAllSelected, setAllCancled } = props;

  const [selected, setSelected] = useState(allSelected);

  useEffect(() => {
    setSelected(allSelected);
  }, [allSelected]);
  return (
    <>
      <span
        className={style.circle}
        onClick={() => {
          setSelected(!selected);
          setAllSelected();
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
