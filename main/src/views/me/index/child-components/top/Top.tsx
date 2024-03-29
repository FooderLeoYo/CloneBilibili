import * as React from "react";
import { Link } from "react-router-dom";

import Context from "@context/index";
import { fetchMyRelation } from "@api/me";
import { getPicSuffix } from "@customed-methods/image";
// import { formatTenThousand } from "../../../../customed-methods/string";

import style from "./top.styl?css-modules";

const { useState, useEffect, useContext } = React;

function Top(props) {
  const { navData } = props;
  const [relationData, setRelationData] = useState(null);
  const context = useContext(Context);

  const getPicUrl = (url: string, format: string) => {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  useEffect(() => { fetchMyRelation().then(result => setRelationData(result.data.data)) }, []);

  return (
    <div className={style.top}>
      <div className={style.basicInfo}>
        <div className={style.portrait}>
          {navData ? <img className={style.face} src={getPicUrl(navData?.face, "@320w_200h")} /> :
            <span className={style.icon}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-avatar"></use>
              </svg>
            </span>
          }
          {navData?.pendant?.image != "" && <span className={style.pendant}><img src={navData?.pendant?.image} /></span>}
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
          <div className={style.otherInfo}>
            <span className={style.uid}>{`UID : ${navData?.mid}`}</span>
            <span className={style.moral}>{`节操值 : ${navData?.moral}`}</span>
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
          <span className={style.data}>{relationData?.dynamic_count}</span>
          <span className={style.title}>动态</span>
        </div>
      </div>
    </div>
  )
}

export default Top;
