import * as React from "react";
import { Link } from "react-router-dom";

import style from "./basic-info.styl?css-modules";

function BasicInfo(props) {
  const { navData } = props;

  return (
    <div className={style.basicInfo}>
      <div className={style.left}>
        <img src={navData?.face} alt="Face" />
        {navData?.pendant?.image != "" ? <span><img src={navData?.pendant?.image} alt="pendant" /></span> : null}
      </div>
      <div className={style.middle}>
        <div className={style.nameAndLv}>
          <span className={style.uname}>{navData?.uname}</span>
          <span className={style.level}>
            <svg className="icon" aria-hidden="true">
              <use href={`#icon-lv${navData?.level_info?.current_level}`}></use>
            </svg>
          </span>
        </div>
        <div className={style.accountType}>
          {<span className={style.membership}>{navData?.vipStatus === 1 ? navData?.vip_label?.text : "正式会员"}</span>}
          {navData?.official_verify?.type === 0 ? <span>{navData?.official?.role}</span> : null}
        </div>
      </div>
      <div className={style.right}>
        <Link className={style.link} to={"/space/myspace"}>
          空间&nbsp;
          <span className={style.arrow}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-arrowDownBig"></use>
            </svg>
          </span>
        </Link>
      </div>
    </div>
  )
}

export default BasicInfo;
