import * as React from "react";

import style from "./tab-bar.styl?css-modules";

const { useState } = React;

interface TabBarProps {
  tabTitle: Array<string>,
  setFatherCurInx: Function,
  curFatherInx: number,
  doSthWithNewInx?: Function
}

function TabBar(props: TabBarProps) {
  const { tabTitle, setFatherCurInx, curFatherInx, doSthWithNewInx } = props;
  const [curTab, setCurTab] = useState(0);
  const [preFatherInx, setPreFatherInx] = useState(0);

  function switchTab(index) {
    if (index !== curTab) {
      setCurTab(index);
      setFatherCurInx(index);
      if (doSthWithNewInx) { doSthWithNewInx(index); }
    }
  }

  if (curFatherInx !== preFatherInx) {
    setCurTab(curFatherInx);
    setPreFatherInx(curFatherInx);
  }

  return (
    <div className={style.tabBarWrapper}>
      {
        tabTitle.map((title, index) => {
          return (
            <span
              className={style.switcherItem + (curTab === index ? " " + style.actived : "")}
              onClick={() => switchTab(index)}
              key={index}
            >
              {title}
            </span>
          )
        })
      }
    </div>
  )
}

export default TabBar;
