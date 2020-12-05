import * as React from "react";

import SwitcherTab from "./child-components/switcher-tab/SwitcherTab";
import SwitcherSlide from "./child-components/switcher-slide/SwitcherSlide";

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
    <>
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
    </>
  );
}

export { Switcher, SwitcherTab, SwitcherSlide };
