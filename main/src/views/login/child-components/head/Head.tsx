import * as React from "react";

import style from "./head.styl?css-modules";

interface LoginProps {
  loginType: string;
  setLoginType: React.Dispatch<React.SetStateAction<string>>;
}

const { useRef, useEffect } = React;

function Head(props: LoginProps) {
  const { loginType, setLoginType } = props;
  const backRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    backRef.current.addEventListener("click", () => window.history.back());
  }, []);

  return (
    <>
      <div className={style.head}>
        <div className={style.backWrapper}>
          <div ref={backRef}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-back"></use>
            </svg>
          </div>
        </div>
        <div className={style.tittle}>{loginType}</div>
        <div
          className={style.typeSwitch}
          onClick={() => setLoginType(loginType === "短信登录" ? "密码登录" : "短信登录")}
        >
          {loginType === "短信登陆" ? "密码登录" : "短信登录"}
        </div>
      </div>
    </>
  )
}

export default Head;