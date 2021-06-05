import * as React from "react";
import { History } from "history";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { formatDate } from "../../../../customed-methods/datetime";
import { getPicSuffix } from "../../../../customed-methods/image";
import Context from "../../../../context";

import { Switcher } from "../../../../components/switcher/Switcher";
import ScrollToTop from "../../../../components/scroll-to-top/ScrollToTop";

import style from "./my-space.styl?css-modules";
import tips from "../../../../assets/images/nocontent.png";

interface MyspaceProps {
}

interface MyspaceState {
}

class MySpace extends React.Component<MyspaceProps, MyspaceState> {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  public render() {
    return (
      <div className={style.mySpace} >
        <Helmet>
          <title>个人空间</title>
        </Helmet>
      </div>
    );
  }
}

MySpace.contextType = Context;

export default MySpace;