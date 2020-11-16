import * as React from "react";

import SwitcherTab from "./child-components/switcher-tab/SwitcherTab";
import SwitcherSlide from "./child-components/switcher-slide/SwitcherSlide";
import style from "./stylus/switcher.styl?css-modules";

interface SwitcherProps {
  tabTitle: Array<string>,
  setFatherCurInx: Function
  slideData: JSX.Element[],
  curFatherInx: number,
  scrollToWhenSwitch?: number,
  switchRatio: number
}

function Switcher(props: SwitcherProps) {
  const { tabTitle, setFatherCurInx, slideData, curFatherInx, scrollToWhenSwitch, switchRatio } = props;

  return (
    <div className={style.switcherWrapper}>
      <SwitcherTab
        tabTitle={tabTitle}
        setFatherCurInx={setFatherCurInx}
      />
      <SwitcherSlide
        slideData={slideData}
        curFatherInx={curFatherInx}
        scrollToWhenSwitch={scrollToWhenSwitch}
        setFatherCurInx={setFatherCurInx}
        switchRatio={switchRatio}
      />
    </div>
  );
}

export { Switcher, SwitcherTab, SwitcherSlide };
