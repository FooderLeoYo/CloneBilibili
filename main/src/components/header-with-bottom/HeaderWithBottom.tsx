import * as React from "react";

import Header from "./header/Header"
import Bottom from "./bottom/Bottom";
import style from "./header-with-bottom.styl?css-modules";

interface HeaderWithBottomProps {
  mode: number; // heder最右边显示：0：无；1：省略号；2：编辑；3：加号；4：自定义
  title?: string;
  doSthWhenSwitch?: Function;
  editting?: boolean;
}

function HeaderWithBottom(props: HeaderWithBottomProps) {
  const { mode, title, doSthWhenSwitch, editting } = props;

  return (
    <>
      <Header mode={mode} title={title} doSthWhenSwitch={doSthWhenSwitch} editting={editting} />
    </>
  )
}

export default HeaderWithBottom;
