import * as React from "react";
import { Link } from "react-router-dom";

import Search from "../search/Search";
import style from "./header.styl?css-modules";

interface HeaderProps {
  mode: number; // heder最右边显示：0：无；1：省略号；2：编辑；3：加号；4：自定义
  title?: string;
  setKeyword?: (keyword: string) => any;
  handleEdit?: Function;
  editting?: boolean;
  setShowBottom?: React.Dispatch<React.SetStateAction<boolean>>;
}

const { useState, useRef, useEffect } = React;

function Header(props: HeaderProps) {
  const { mode, title, setKeyword, editting, handleEdit, setShowBottom } = props;

  const [searching, setSerching] = useState(false);
  const multipleRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    mode === 1 && multipleRef.current.addEventListener("click", () => {
      setShowBottom(true);
    });
  }, []);

  return (
    <>
      {searching ? <Search setKeyword={setKeyword} setSerching={setSerching} /> :
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
            {setKeyword &&
              <span className={style.search} onClick={() => setSerching(true)}>
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-search"></use>
                </svg>
              </span>
            }
            {mode != 0 && <div className={style.manipulation}>
              {mode === 1 ? <div className={style.multiple} ref={multipleRef}>…</div> :
                mode === 2 ? <div className={style.edit} onClick={() => handleEdit()}>
                  {editting ? "取消" : "编辑"}</div> :
                  mode === 3 ? <div className={style.add}>+</div> :
                    mode === 4 ? <div className={style.custom}></div> : null
              }
            </div>
            }
          </div>
        </div>
      }
    </>
  );
}

export default Header;
