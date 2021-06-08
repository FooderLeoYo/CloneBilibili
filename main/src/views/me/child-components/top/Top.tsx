import * as React from "react";
import { Link } from "react-router-dom";

import { fetchRelation } from "../../../../api/space";
// import { formatTenThousand } from "../../../../customed-methods/string";

import style from "./top.styl?css-modules";

const { useState, useEffect } = React;

function Top(props) {
  const { navData } = props;

  const [relationData, setRelationData] = useState(null);

  useEffect(() => {
    navData && fetchRelation(navData.mid).then(result => { setRelationData(result.data) })
  }, [navData]);

  return (
    <div className={style.top}>
      <div className={style.basicInfo}>
        <div className={style.portrait}>
          <img src={navData?.face} alt="" />
          {navData?.pendant?.image != "" && <span><img src={navData?.pendant?.image} alt="" /></span>}
        </div>
        <div className={style.descriptions}>
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
            {navData?.official_verify?.type === 0 && <span>{navData?.official?.role}</span>}
          </div>
        </div>
        <div className={style.toSpace}>
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
      <div className={style.statistics}>
        <div className={style.container}>
          {/* <span className={style.data}>{formatTenThousand(relationData?.following)}</span> */}
          <span className={style.data}>{relationData?.following}</span>
          <span className={style.title}>关注</span>
        </div>
        <div className={style.container + " " + style.follower}>
          {/* <span className={style.data}>{formatTenThousand(relationData?.follower)}</span> */}
          <span className={style.data}>{relationData?.follower}</span>
          <span className={style.title}>粉丝</span>
        </div>
        <div className={style.container}>
          {/* <span className={style.data}>{formatTenThousand(relationData?.whisper)}</span> */}
          <span className={style.data}>{relationData?.whisper}</span>
          <span className={style.title}>黑名单</span>
        </div>
      </div>
    </div>
  )
}

export default Top;
