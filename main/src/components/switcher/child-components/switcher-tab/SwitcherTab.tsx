import * as React from "react";
import style from "./switcher-tab.styl?css-modules";

interface SwitcherTabProps {
  tabTitle: Array<string>,
  setFatherCurInx: Function,
}

const { useState } = React;

function SwitcherTab(props: SwitcherTabProps) {
  const { tabTitle, setFatherCurInx } = props;
  const [curTab, setCurTab] = useState(0);

  function switchTab(index) {
    setCurTab(index);
    setFatherCurInx(index);
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
