import * as React from "react";

import Search from "../search/Search";
import style from "./header.styl?css-modules";

interface HeaderProps {
  mode: number; // heder最右边显示：0：无；1：省略号；2：编辑；3：加号；4：自定义
  title?: string;
  setKeyword?: (keyword: string) => any;
  searching?: boolean;
  setSerching?: React.Dispatch<React.SetStateAction<boolean>>;
  mulDeleting?: boolean;
  setShowBottom?: React.Dispatch<React.SetStateAction<boolean>>;
  handleAdd?: Function;
  customBtn?: any;
  handleCustomClick?: Function;
  customHandleBack?: Function;
  handleMulDelete?: Function;
}

const { useRef, useEffect } = React;

function Header(props: HeaderProps) {
  const { mode, title, setKeyword, mulDeleting, handleMulDelete, setShowBottom,
    searching, setSerching, handleAdd, customBtn, handleCustomClick,
    customHandleBack } = props;

  const multipleRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    mode === 1 && multipleRef.current.addEventListener("click", () => {
      setShowBottom(true);
    });
  }, [mode]);

  return (
    <>
      {searching ? <Search setKeyword={setKeyword} setSerching={setSerching} /> :
        <div className={style.header}>
          <div className={style.backWrapper}>
            <span className={style.backBtn}
              onClick={() => {
                if (customHandleBack) { customHandleBack() }
                else { window.history.back() }
              }}
            >
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
                mode === 2 ? <div className={style.edit} onClick={() => handleMulDelete()}>
                  {mulDeleting ? "取消" : "编辑"}</div> :
                  mode === 3 ? <div className={style.add} onClick={() => handleAdd()}>+</div> :
                    mode === 4 ? <div className={style.custom} onClick={() => handleCustomClick()}>{customBtn}</div> : null
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
