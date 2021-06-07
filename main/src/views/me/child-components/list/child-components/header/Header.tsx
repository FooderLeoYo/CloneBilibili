import * as React from "react";
import { Link } from "react-router-dom";

import style from "./header.styl?css-modules";

interface HeaderProps {
  title: string;
  needEdit?: boolean;
  editting?: boolean;
  setEditting?: Function;
}

function Header(props: HeaderProps) {
  const { title, needEdit, editting, setEditting } = props;

  return (
    <div className={style.header}>
      <div className={style.backWrapper}>
        <span className={style.backBtn} onClick={() => window.history.back()}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-arrowDownBig"></use>
          </svg>
        </span>
      </div>
      <div className={style.listType}>{title}</div>
      <div className={style.tools}>
        <Link className={style.search} to="/search">
          <svg className="icon" aria-hidden="true">
            <use href="#icon-search"></use>
          </svg>
        </Link>
        {needEdit && <div className={style.edit} onClick={() => setEditting()}>
          {editting ? "取消" : "编辑"}</div>
        }
      </div>
    </div>
  );
}

export default Header;
