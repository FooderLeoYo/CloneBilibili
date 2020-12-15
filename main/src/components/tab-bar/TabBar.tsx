import * as React from "react";

import style from "./tab-bar.styl?css-modules";
import { PartitionType } from "../../class-object-creators";

interface TabBarProps {
  type: string;
  data: PartitionType[];
  onClick?: any;
  currentIndex?: number;
}

interface TabBarState {
  curInx: number;
}

class TabBar extends React.Component<TabBarProps, TabBarState> {
  /* 以下为初始化 */
  private tabBarRef: React.RefObject<HTMLDivElement>;
  constructor(props) {
    super(props);
    this.tabBarRef = React.createRef();
    this.state = {
      curInx: this.props.currentIndex ? this.props.currentIndex : 0
    }
  }

  /* 以下为自定义方法 */
  // 如果当前tab超出了tabbar的可视范围，则将其滚动到tabbar的第二个位置
  // 比如当通过drawer点击了当前tabbar可视区之外的标签
  private resetScroll() {
    const tabBarDOM = this.tabBarRef.current;
    const children = tabBarDOM.getElementsByTagName("div");
    if (children.length > 0) {
      const currentTabDOM = children[this.state.curInx];
      // 若currentTabDOM在tabBarDOM可视区之外
      // 即currentTabDOM在tabBarDOM可视区的右边
      if (currentTabDOM.offsetLeft >
        tabBarDOM.clientWidth + tabBarDOM.scrollLeft
        || // 或左边
        tabBarDOM.scrollLeft >
        currentTabDOM.offsetLeft + currentTabDOM.clientWidth) {
        // 则滚动currentTabDOM到tabBarDOM中的第二个位置
        tabBarDOM.scrollLeft =
          currentTabDOM.offsetLeft - currentTabDOM.offsetWidth;
      }
    }
  }

  private handleClick(tab, index) {
    this.setState({ curInx: index });
    if (this.props.onClick) {
      this.props.onClick(tab);
    }
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    // 等待父组件初始化数据（有些初始化依赖异步数据，如Raking的currentTabIndex）后再执行
    setTimeout(() => { this.resetScroll(); }, 100);
  }

  // 路由跳转时更新state进而触发页面更新，否则路由跳转时路径变化无法触发页面更新
  public static getDerivedStateFromProps(props, state) {
    if (props.currentIndex) {
      if (props.currentIndex !== state.currentIndex) {
        return { currentIndex: props.currentIndex }
      }
    }
    return state;
  }

  // 当在路由跳转下的点击切换tab后，如果当前tab超出了tabbar的可视范围，则将其滚动到tabbar的第二个位置
  public componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentIndex !== this.state.curInx) {
      this.resetScroll();
    }
  }

  /* 以下为渲染部分 */
  public render() {
    const { data, type } = this.props;
    // indicate样式带下划线用于一级tab，highlight样式不带下划线用于二级tab
    const cls = type === "indicate" ? style.indicate : style.highlight;
    const tabs = data.map((tab, i) => (
      <div
        className={style.tab + (i === this.state.curInx ? " " + cls : "")}
        key={tab.id}
        onClick={() => { this.handleClick(tab, i); }}
      >
        <span>{tab.name}</span>
      </div>
    ));
    return (
      <div className={style.tabBar} ref={this.tabBarRef}>
        {tabs}
      </div>
    );
  }
}

export default TabBar;
