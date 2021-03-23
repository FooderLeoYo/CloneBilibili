import * as React from "react";

import style from "./tab-bar.styl?css-modules";
import { PartitionType } from "../../class-object-creators";

interface TabBarProps {
  data: PartitionType[],
  needUnderline?: boolean,
  clickMethod?: Function,
  currentIndex?: number,
  needForcedUpdate?: boolean,
  noSlideAni?: boolean, // 直播一级tabBar会在从直播首页切换到别的类别时发生的滚动，因此禁用动画
  oneInx?: number, // 仅二级tab需要，解决切换二级tab后再切换一级tab时，二级tabBar不会滚到推荐位置
}

interface TabBarState {
  curInx: number
}

class TabBar extends React.Component<TabBarProps, TabBarState> {
  private tabBarRef: React.RefObject<HTMLUListElement>;
  private underlineRef: React.RefObject<HTMLSpanElement>;
  private wrapperOffsetLeft: number; // 大尺寸下视图未铺满屏幕时有意义
  constructor(props) {
    super(props);
    this.tabBarRef = React.createRef();
    if (this.props.needUnderline) {
      this.underlineRef = React.createRef();
    }
    this.state = {
      curInx: this.props.currentIndex ? this.props.currentIndex : 0
    }
  }


  private resetScroll() {
    const tabBarDOM = this.tabBarRef.current;
    const children = tabBarDOM.getElementsByTagName("a");

    if (children.length > 0) {
      const tarTabDOM = children[this.state.curInx];

      if (tarTabDOM) {
        const disBetwTarTabAndWrap = tarTabDOM.getBoundingClientRect().left - this.wrapperOffsetLeft;
        const leftDOMWidth = this.state.curInx !== 0 ? children[this.state.curInx - 1].offsetWidth : 0;

        // 保证curTab始终处于第二个位置
        if (disBetwTarTabAndWrap > leftDOMWidth || disBetwTarTabAndWrap < leftDOMWidth) {
          const tarPosition = tarTabDOM.offsetLeft - leftDOMWidth;

          if (!this.props.noSlideAni) {
            tabBarDOM.classList.add(style.slideAni);
            setTimeout(() => { tabBarDOM.classList.remove(style.slideAni) }, 350);
          }

          // if (this.state.curInx === 0) { // 拖动了二级tab后切换一级tab
          //   tabBarDOM.classList.remove(style.slideAni);
          //   tabBarDOM.style.transform = `translate3d(-${tarPosition}px, 0 ,0)`;
          // } 
          if (tarPosition < tabBarDOM.scrollWidth - tabBarDOM.offsetWidth) { // 未拖到头
            tabBarDOM.style.transform = `translate3d(-${tarPosition}px, 0 ,0)`;
          } else { // 将拖到头，则只拖到可以拖动的距离
            tabBarDOM.style.transform = `translate3d(-${tabBarDOM.scrollWidth - tabBarDOM.offsetWidth}px, 0 ,0)`;
          }
        }
      }
    }
  }

  private moveUnderline(curInx) {
    const tabBarDOM = this.tabBarRef.current;
    const children = tabBarDOM.getElementsByTagName("a");

    if (children.length > 2) { // 除了直播、首页外的其他tab也加载了
      const currentTabDOM = children[curInx];
      const underlineDOM = this.underlineRef.current;
      const tabPadding = parseInt(getComputedStyle(currentTabDOM)["paddingLeft"].slice(0, -2));
      const spanPadding = parseInt(getComputedStyle(currentTabDOM.children[0])["paddingLeft"].slice(0, -2));

      if (this.props.noSlideAni) {
        underlineDOM.classList.add(style.noAni);
      }

      underlineDOM.style.left = `${currentTabDOM.offsetLeft + tabPadding + spanPadding}px`;
      underlineDOM.style.width = `${currentTabDOM.children[0].clientWidth - 2 * spanPadding}px`;
    }
  }

  private handleClick(tab, index) {
    this.setState({ curInx: index });
    if (this.props.clickMethod) {
      this.props.clickMethod(tab);
    }
  }

  private setListeners() {
    const tabBarDOM = this.tabBarRef.current;
    let maxTarPosition: number;
    let tabBarStartPos: number;
    let clickStartPos: number;

    tabBarDOM.addEventListener("touchstart", e => {
      maxTarPosition = tabBarDOM.scrollWidth - tabBarDOM.offsetWidth;
      tabBarStartPos = tabBarDOM.getBoundingClientRect().left - this.wrapperOffsetLeft;
      clickStartPos = e.targetTouches[0].pageX;
    });
    tabBarDOM.addEventListener("touchmove", e => {
      const tarPosition = -(e.targetTouches[0].pageX - clickStartPos + tabBarStartPos);
      if (tarPosition > maxTarPosition || tarPosition < 0) {
        return;
      } else {
        tabBarDOM.style.transform = `translate3d(-${tarPosition}px, 0, 0)`;
      }
    });
  }

  public componentDidMount() {
    const tabBarDOM = this.tabBarRef.current;

    this.wrapperOffsetLeft = tabBarDOM.parentElement.getBoundingClientRect().left;
    this.setListeners();
    this.resetScroll();
    // if (this.props.needUnderline) {
    //   setTimeout(() => {
    //     this.moveUnderline(this.state.curInx);
    //   });
    // }
  }

  public static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.needForcedUpdate && nextProps.currentIndex !== prevState.curInx) {
      return { curInx: nextProps.currentIndex };
    }
    return prevState;
  }

  public componentDidUpdate(prevProps) {
    if (this.props.needForcedUpdate && (prevProps.currentIndex !== this.state.curInx ||
      this.props.oneInx && this.props.oneInx !== prevProps.oneInx)) {
      this.resetScroll();
      if (this.props.needUnderline) { this.moveUnderline(this.state.curInx); }
    }
  }


  public render() {
    const { data, needUnderline } = this.props;
    const tabs = data.map((tab, i) => (
      <a
        className={style.tab + (i === this.state.curInx ? " " + style.highlight : "")}
        onClick={() => { this.handleClick(tab, i); }}
        key={tab.id}
      >
        <span>{tab.name}</span>
      </a>
    ));

    return (
      <div className={style.tabBarWrapper}>
        <ul className={style.tabBar} ref={this.tabBarRef}>
          {
            needUnderline &&
            <span className={style.underline} ref={this.underlineRef}></span>
          }
          {tabs}
        </ul>
      </div>
    );
  }
}

export default TabBar;
