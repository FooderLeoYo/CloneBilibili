import * as React from "react";
import style from "./switcher-tab.styl?css-modules";

interface SwitcherTabProps {
  tabTitle: Array<string>,
  setFatherCurInx: Function,
  curFatherInx: number,
  switchType: number,
  setSwitchType: Function,
  doSthWithNewInx?: Function
}

const { useState } = React;

function SwitcherTab(props: SwitcherTabProps) {
  const { tabTitle, setFatherCurInx, curFatherInx, switchType, setSwitchType, doSthWithNewInx } = props;
  const [curTab, setCurTab] = useState(0);
  const [preFatherInx, setPreFatherInx] = useState(0);

  function switchTab(index) {
    if (index !== curTab) {
      setCurTab(index);
      setFatherCurInx(index);
      if (switchType === 0) { setSwitchType(1); }
      if (doSthWithNewInx) { doSthWithNewInx(index); }
    }
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
              onClick={() => switchTab(index)}
              key={index}
            >{title}</span>
          );
        })
      }
    </div>
  );
}

export default SwitcherTab;
