import * as React from "react";

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
    const scrollToptimer = setInterval(() => {
      var top = document.body.scrollTop || document.documentElement.scrollTop;
      var speed = top / 4;
      if (document.body.scrollTop != 0) {
        document.body.scrollTop -= speed;
      } else {
        document.documentElement.scrollTop -= speed;
      }
      if (top == 0) {
        clearInterval(scrollToptimer);
      }
    }, 30);
  }

  /* 以下为渲染部分 */
  public render() {
    return (
      <div className={style.toTopBtn} ref={this.toTopBtnRef}
        onClick={() => { this.handleClick() }}>
        <svg className="icon" aria-hidden="true">
          <use href="#icon-rocket"></use>
        </svg>
      </div>
    );
  }
}

export default ScrollToTop;
