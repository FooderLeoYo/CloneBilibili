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
  private wrapperOffsetLeft: number; // 大尺寸下视图未铺满屏幕时有意义
  private maxTarPosition: number;
  constructor(props) {
    super(props);
    this.tabBarRef = React.createRef();
    if (this.props.type === "underline") {
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
        const leftTabDOM = this.state.curInx !== 0 ? children[this.state.curInx - 1] : children[this.state.curInx];
        const disBetwTarTabAndWrap = tarTabDOM.getBoundingClientRect().left - this.wrapperOffsetLeft;
        const leftDOMWidth = leftTabDOM.offsetWidth;

        // 保证curTab始终处于第二位
        if (disBetwTarTabAndWrap > leftDOMWidth || disBetwTarTabAndWrap < leftDOMWidth) {
          const tarPosition = tarTabDOM.offsetLeft - leftDOMWidth;

          tabBarDOM.classList.add(style.slideAni);
          // if判断是为了解决tab右边拖到头了还会继续拖的问题
          if (tarPosition < this.maxTarPosition) { // 未拖到头
            tabBarDOM.style.transform = `translate3d(-${tarPosition}px, 0 ,0)`;
          } else { // 将拖到头，则只拖动可以拖动的距离
            tabBarDOM.style.transform = `translate3d(-${tabBarDOM.scrollWidth - tabBarDOM.offsetWidth}px, 0 ,0)`;
          }
          setTimeout(() => { tabBarDOM.classList.remove(style.slideAni) }, 350);
        }
      }
    }
  }

  private moveUnderline(curInx) {
    const tabBarDOM = this.tabBarRef.current;
    const children = tabBarDOM.getElementsByTagName("a");

    if (children.length > 0) {
      const currentTabDOM = children[curInx];
      const underlineDOM = this.underlineRef.current;

      const tabPadding = parseInt(getComputedStyle(currentTabDOM)["paddingLeft"].slice(0, -2))
      underlineDOM.style.left = `${currentTabDOM.offsetLeft + tabPadding}px`;

      const spanPadding = parseInt(getComputedStyle(currentTabDOM.children[0])["paddingLeft"].slice(0, -2))
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
    let tabBarStartPos: number = 0;
    let clickStartPos: number = 0;

    tabBarDOM.addEventListener("touchstart", e => {
      tabBarStartPos = tabBarDOM.getBoundingClientRect().left - this.wrapperOffsetLeft;
      clickStartPos = e.targetTouches[0].pageX;
    });
    tabBarDOM.addEventListener("touchmove", e => {
      const tarPosition = -(e.targetTouches[0].pageX - clickStartPos + tabBarStartPos);
      if (tarPosition > this.maxTarPosition || tarPosition < 0) {
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
    if (this.props.type === "underline") {
      this.moveUnderline(this.state.curInx);
    }
    setTimeout(() => { // 延时是为了获取元素完整加载后的tabBarDOM.scrollWidth
      this.maxTarPosition = tabBarDOM.scrollWidth - tabBarDOM.offsetWidth;
      this.resetScroll();
    });
  }

  public static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.needForcedUpdate && nextProps.currentIndex !== prevState.curInx) {
      return { curInx: nextProps.currentIndex };
    }
    return prevState;
  }

  public componentDidUpdate(prevProps) {
    if (this.props.needForcedUpdate && prevProps.currentIndex !== this.state.curInx) {
      this.resetScroll();
      if (this.props.type === "underline") { this.moveUnderline(this.state.curInx); }
    }
  }


  public render() {
    const { data, type } = this.props;
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
            type === "underline" &&
            <span className={style.underline} ref={this.underlineRef}></span>
          }
          {tabs}
        </ul>
      </div>
    );
  }
}

export default TabBar;
