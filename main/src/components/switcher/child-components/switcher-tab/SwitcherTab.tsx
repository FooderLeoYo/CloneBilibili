import * as React from "react";
import style from "./switcher-tab.styl?css-modules";

interface SwitcherTabProps {
  tabTitle: Array<string>,
  setFatherCurInx: Function,
  curFatherInx: number,
}

const { useState } = React;

function SwitcherTab(props: SwitcherTabProps) {
  const { tabTitle, setFatherCurInx, curFatherInx } = props;
  const [curTab, setCurTab] = useState(0);
  const [preFatherInx, setPreFatherInx] = useState(0);


  function switchTab(index) {
    setCurTab(index);
    setFatherCurInx(index);
  }

  if (curFatherInx !== preFatherInx) {
    setCurTab(curFatherInx);
    setPreFatherInx(curFatherInx);
  }

  return (
    <div className={style.tabWrapper}>
      {
        tabTitle.map((title, index) => {
          return (
            <span
              className={style.switcherItem + (curTab === index ? " " + style.actived : "")}
              onClick={() => { switchTab(index) }}
              key={index}
            >{title}</span>
          );
        })
      }
    </div>
  );
}

export default SwitcherTab;
