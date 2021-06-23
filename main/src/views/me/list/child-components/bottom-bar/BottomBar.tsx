import * as React from "react";

import style from "./bottom-bar.styl?css-modules";

interface BottomBarProps {
  selectedStatus: number;
  setAllSelectedStatus: (status) => void;
  handleDelete: Function;
}

const { useState, useEffect } = React;

function BottomBar(props: BottomBarProps) {
  const { selectedStatus, setAllSelectedStatus, handleDelete } = props;

  const [selected, setSelected] = useState(false);
  const [hasSelectedItem, setHasSelectedItem] = useState(false);

  useEffect(() => {
    setSelected(selectedStatus === 1 ? true : false);
    setHasSelectedItem(selectedStatus === 0 ? false : true);
  }, [selectedStatus]);

  return (
    <div className={style.bottomWrapper}>
      <span className={style.circle}
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
      <span
        className={hasSelectedItem ? style.delete + " " + style.actived : style.delete}
        onClick={hasSelectedItem ? () => handleDelete() : null}
      >删除
      </span>
    </div>
  )
}

export default BottomBar;
