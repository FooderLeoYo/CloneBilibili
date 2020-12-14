import * as React from "react";

import SwitcherTab from "./child-components/switcher-tab/SwitcherTab";
import SwitcherSlide from "./child-components/switcher-slide/SwitcherSlide";

interface SwitcherProps {
  tabTitle: Array<string>,
  slideData: JSX.Element[],
  switchRatio: number,
  scrollToAtFirstSwitch?: number,
  doSthWithNewInx?: Function
}

const { useState } = React;

function Switcher(props: SwitcherProps) {
  const { tabTitle, slideData, switchRatio, scrollToAtFirstSwitch, doSthWithNewInx } = props;
  const [curInx, setCurInx] = useState(0);
  const [switchType, setSwitchType] = useState(0); // 切换类型：0、滑动；1、tab

  return (
    <>
      <SwitcherTab
        tabTitle={tabTitle}
        setFatherCurInx={setCurInx}
        curFatherInx={curInx}
        switchType={switchType}
        setSwitchType={setSwitchType}
        doSthWithNewInx={doSthWithNewInx}
      />
      <SwitcherSlide
        slideData={slideData}
        curFatherInx={curInx}
        setFatherCurInx={setCurInx}
        switchRatio={switchRatio}
        switchType={switchType}
        setSwitchType={setSwitchType}
        scrollToAtFirstSwitch={scrollToAtFirstSwitch}
        doSthWithNewInx={doSthWithNewInx}
      />
    </>
  );
}

export { Switcher, SwitcherTab, SwitcherSlide };
