import * as React from "react";

import style from "./tab-bar.styl?css-modules";
import { PartitionType } from "../../class-object-creators";

interface TabBarProps {
  type: string,
  data: PartitionType[],
  clickMethod?: Function,
  currentIndex?: number,
  needForcedUpdate?: boolean
}

interface TabBarState {
  curInx: number
}

class TabBar extends React.Component<TabBarProps, TabBarState> {
  private tabBarRef: React.RefObject<HTMLUListElement>;
  private underlineRef: React.RefObject<HTMLSpanElement>;
  private wrapperOffsetLeft: number;
  constructor(props) {
    super(props);
    this.tabBarRef = React.createRef();
    this.underlineRef = React.createRef();
    this.state = {
      curInx: this.props.currentIndex ? this.props.currentIndex : 0
    }
  }

  // private scrollSmoothTo(targetPos, wrapperDOM: HTMLElement) {
  //   // 当前滚动高度
  //   let curPOs = wrapperDOM.offsetLeft;
  //   // 滚动step方法
  //   let step = function () {
  //     // 距离目标滚动距离
  //     let distance = targetPos - curPOs;

  //     if (Math.abs(distance) < 1) {
  //       wrapperDOM.scrollLeft = targetPos;
  //     } else {
  //       // 目标滚动位置
  //       curPOs = curPOs + distance / 12;
  //       wrapperDOM.scrollLeft = curPOs;
  //       requestAnimationFrame(step);
  //     }
  //   };

  //   step();
  // }

  private resetScroll() {
    const tabBarDOM = this.tabBarRef.current;
    const children = tabBarDOM.getElementsByTagName("a");

    if (children.length > 0) {
      const currentTabDOM = children[this.state.curInx];

      if (currentTabDOM) {
        const curTabOffsetLeft = currentTabDOM.getBoundingClientRect().left - this.wrapperOffsetLeft;

        if (curTabOffsetLeft > currentTabDOM.offsetWidth || curTabOffsetLeft < currentTabDOM.offsetWidth) {
          tabBarDOM.style.transform = `translate3d(-${currentTabDOM.offsetLeft -
            currentTabDOM.offsetWidth}px, 0 ,0)`;
          // tabBarDOM.scrollLeft = currentTabDOM.offsetLeft - currentTabDOM.offsetWidth;
          // this.scrollSmoothTo(currentTabDOM.offsetLeft - currentTabDOM.offsetWidth, tabBarDOM);
        }

        // if ( // 即currentTabDOM在tabBarDOM可视区的右边
        //   currentTabDOM.offsetLeft > tabBarDOM.offsetWidth + tabBarDOM.scrollLeft
        //   || // 或左边
        //   tabBarDOM.scrollLeft > currentTabDOM.offsetLeft + currentTabDOM.offsetWidth) {
        //   // 则滚动currentTabDOM到tabBarDOM中的第二个位置
        //   // tabBarDOM.scrollLeft = currentTabDOM.offsetLeft - currentTabDOM.offsetWidth;
        //   tabBarDOM.style.transform = `translateX(-${currentTabDOM.offsetLeft -
        //     currentTabDOM.offsetWidth}px)`
        // }
      }
    }
  }

  private moveUnderline(preInx) {
    const tabBarDOM = this.tabBarRef.current;
    const children = tabBarDOM.getElementsByTagName("a");
    const preTabDOM = children[preInx];
    const currentTabDOM = children[this.state.curInx];
    const underlineDOM = this.underlineRef.current;

    const distance = currentTabDOM.offsetLeft - preTabDOM.offsetLeft - currentTabDOM.offsetWidth;
    // underlineDOM.style.transform = `translate3d(${distance}px, 0 ,0)`;
    underlineDOM.style.left = `${currentTabDOM.offsetLeft - currentTabDOM.offsetWidth}px`;
    console.log(underlineDOM.style.transform)
  }

  private handleClick(tab, index) {
    const preInx = this.state.curInx;

    this.setState({ curInx: index }, () => { this.moveUnderline(preInx) });

    if (this.props.clickMethod) {
      this.props.clickMethod(tab);
    }
  }

  // 等待父组件初始化数据（有些初始化依赖异步数据，如Raking的currentTabIndex）后再执行
  public componentDidMount() {
    this.wrapperOffsetLeft = this.tabBarRef.current.parentElement.getBoundingClientRect().left
    this.resetScroll();
  }

  public static getDerivedStateFromProps(props, state) {
    if (props.needForcedUpdate && props.currentIndex !== state.curInx) {
      return { curInx: props.currentIndex };
    }
    return state;
  }

  public componentDidUpdate(prevProps) {
    if (this.props.needForcedUpdate && prevProps.currentIndex !== this.state.curInx) {
      this.resetScroll();
      this.tabBarRef.current.classList.add(style.slideAni)
      // setTimeout(() => {
      //   this.tabBarRef.current.classList.remove(style.slideAni)
      // }, 400);
    }
  }


  public render() {
    const { data, type } = this.props;
    // indicate样式带下划线用于一级tab，highlight样式不带下划线用于二级tab
    const cls = type === "indicate" ? style.indicate : style.highlight;
    const tabs = data.map((tab, i) => (
      <a
        className={style.tab + (i === this.state.curInx ? " " + cls : "")}
        onClick={() => { this.handleClick(tab, i); }}
        key={tab.id}
      >
        <span>{tab.name}</span>
      </a>
    ));

    return (
      <div className={style.tabBarWrapper}>
        <ul className={style.tabBar} ref={this.tabBarRef}>
          <span className={style.underline} ref={this.underlineRef}></span>
          {tabs}
        </ul>
      </div>
    );
  }
}

export default TabBar;
