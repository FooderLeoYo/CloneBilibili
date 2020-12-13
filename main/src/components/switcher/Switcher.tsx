import * as React from "react";

import SwitcherTab from "./child-components/switcher-tab/SwitcherTab";
import SwitcherSlide from "./child-components/switcher-slide/SwitcherSlide";

interface SwitcherProps {
  tabTitle: Array<string>,
  slideData: JSX.Element[],
  switchRatio: number,
  doSthWithNewInx?: Function
}

const { useState } = React;

function Switcher(props: SwitcherProps) {
  const { tabTitle, slideData, switchRatio, doSthWithNewInx } = props;
  const [curInx, setCurInx] = useState(0);

  return (
    <>
      <SwitcherTab
        tabTitle={tabTitle}
        setFatherCurInx={setCurInx}
        curFatherInx={curInx}
        doSthWithNewInx={doSthWithNewInx}
      />
      <SwitcherSlide
        slideData={slideData}
        curFatherInx={curInx}
        setFatherCurInx={setCurInx}
        switchRatio={switchRatio}
        doSthWithNewInx={doSthWithNewInx}
      />
    </>
  );
}

export { Switcher, SwitcherTab, SwitcherSlide };
