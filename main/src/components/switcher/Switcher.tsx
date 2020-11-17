import * as React from "react";

import SwitcherTab from "./child-components/switcher-tab/SwitcherTab";
import SwitcherSlide from "./child-components/switcher-slide/SwitcherSlide";
import style from "./stylus/switcher.styl?css-modules";

interface SwitcherProps {
  tabTitle: Array<string>,
  slideData: JSX.Element[],
  switchRatio: number,
  scrollToWhenSwitch?: number,
}

const { useState } = React;

function Switcher(props: SwitcherProps) {
  const { tabTitle, slideData, scrollToWhenSwitch, switchRatio } = props;
  const [curInx, setCurInx] = useState(0);

  return (
    <div className={style.switcherWrapper}>
      <SwitcherTab
        tabTitle={tabTitle}
        setFatherCurInx={setCurInx}
        curFatherInx={curInx}
      />
      <SwitcherSlide
        slideData={slideData}
        curFatherInx={curInx}
        scrollToWhenSwitch={scrollToWhenSwitch}
        setFatherCurInx={setCurInx}
        switchRatio={switchRatio}
      />
    </div>
  );
}

export { Switcher, SwitcherTab, SwitcherSlide };
