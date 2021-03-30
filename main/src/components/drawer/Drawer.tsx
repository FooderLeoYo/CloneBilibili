import * as React from "react";
import { getTransitionEndName } from "../../customed-methods/compatible";

import Overlay from "../../components/overlay/Overlay";
import style from "./drawer.styl?css-modules";

interface DataObj {
  id: number;
  name: string;
}

interface DrawerProps {
  data: DataObj[];
  onClick?: any;
  onPush?: any;
  onPullDown?: any;
  currentIndex?: number;
}

interface DrawerState {
  currentIndex: number;
}

class Drawer extends React.Component<DrawerProps, DrawerState> {
  /* 以下为初始化 */
  private drawerWrapperRef: React.RefObject<HTMLDivElement>;
  private switchRef: React.RefObject<HTMLDivElement>;
  private overlayRef: React.RefObject<HTMLDivElement>;
  public pull: boolean;
  constructor(props) {
    super(props);
    this.drawerWrapperRef = React.createRef();
    this.switchRef = React.createRef();
    this.overlayRef = React.createRef();
    this.pull = false;
    this.state = { currentIndex: 0 }
  }


  private handleClick(item, index) {
    this.setState({ currentIndex: index });
    if (this.props.onClick) { this.props.onClick(item); }
  }

  private setTranslateY(y) {
    const drawerWrapperDOM = this.drawerWrapperRef.current;
    // $是typescript的字符串拼接符
    // 注意要使用反引号`
    drawerWrapperDOM.style.webkitTransform = `translate3d(0, ${y}, 0)`;
    drawerWrapperDOM.style.transform = `translate3d(0, ${y}, 0)`;
  }

  public show() {
    const drawerWrapperDOM = this.drawerWrapperRef.current;
    const overlayDOM = this.overlayRef.current;

    this.pull = true;
    drawerWrapperDOM.style.display = "block";
    // 这里要将y设为0的原因是隐藏时，hide方法会将y设为-100%
    setTimeout(() => { this.setTranslateY(0); }, 10);

    overlayDOM.style.display = "block";
  }

  public hide() {
    this.pull = false;
    // 这里用setTranslateY而不是直接设display:none，是为了下拉动画效果
    this.setTranslateY("-100%");
    this.overlayRef.current.style.display = "none";
  }

  public componentDidMount() {
    const drawerWrapperDOM = this.drawerWrapperRef.current;
    const transitionEndName = getTransitionEndName(drawerWrapperDOM);

    this.hide();
    drawerWrapperDOM.addEventListener(transitionEndName, () => {
      const { onPush, onPullDown } = this.props;
      if (this.pull === false) {
        drawerWrapperDOM.style.display = "none";
        if (onPush) { onPush(); }
      } else { if (onPullDown) { onPullDown(); } }
    });
    this.switchRef.current.addEventListener("click", () => { this.hide(); });
    this.overlayRef.current.addEventListener("touchmove", e => { e.preventDefault(); });
  }

  public static getDerivedStateFromProps(props, state) {
    if (props.currentIndex !== undefined) {
      if (props.currentIndex !== state.currentIndex) {
        return { currentIndex: props.currentIndex }
      }
    }
    return state;
  }


  /* 以下为渲染部分 */
  public render() {
    /* 供渲染的数据 */
    const { data } = this.props;
    const items = data.map((item, i) => (
      <div
        className={
          style.drawerItem + (i === this.state.currentIndex ? " " +
            style.current : "")
        }
        key={item.id}
        onClick={() => { this.handleClick(item, i); }}
      >
        <span>{item.name}</span>
      </div>
    ));

    return (
      <div className={style.drawer}>
        <div className={style.drawerWrapper} ref={this.drawerWrapperRef}>
          <div className={style.drawerItemContainer}>
            {items}
          </div>
          <div className={style.drawerSwitch} ref={this.switchRef}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-arrowDownBig"></use>
            </svg>
          </div>
        </div>
        <div className={style.overlayWrapper} ref={this.overlayRef}>
          <Overlay />
        </div>
      </div>
    );
  }
}

export default Drawer;