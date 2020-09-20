import * as React from "react";

import ToTopBtn from "../totop/ToTopBtn";

import style from "./scroll-to-top.styl?css-modules";

class ScrollToTop extends React.Component {
  /* 以下为初始化 */
  private toTopBtnRef: React.RefObject<HTMLDivElement>;
  constructor(props) {
    super(props);
    this.toTopBtnRef = React.createRef();
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  public componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  /* 以下为自定义方法 */
  private handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 0) {
      this.toTopBtnRef.current.style.display = "block";
    } else {
      this.toTopBtnRef.current.style.display = "none";
    }
  }

  private handleClick() {
    const initialScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    // 计算每次向上移动的步长
    // 回到顶部总的动画时间是一定的，initialScrollTop大单位时间移动的步长就大
    const step = Math.round(initialScrollTop / 10);
    const scroll = () => {
      const scrollDistance = document.documentElement.scrollTop || document.body.scrollTop;
      // scroll被调用一次则向上移动一步长
      window.scrollTo(0, scrollDistance - step);
      // 如果尚未到顶，则继续向上移动一步长
      if (scrollDistance > 0) {
        requestAnimationFrame(scroll);
      }
    }
    requestAnimationFrame(scroll);
  }

  /* 以下为渲染部分 */
  public render() {
    return (
      <div className={style.toTopBtn} ref={this.toTopBtnRef}
        onClick={() => { this.handleClick() }}>
        <ToTopBtn />
      </div>
    );
  }
}

export default ScrollToTop;
