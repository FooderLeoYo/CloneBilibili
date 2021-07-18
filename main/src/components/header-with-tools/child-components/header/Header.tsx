import * as React from "react";

import Search from "../search/Search";
import style from "./header.styl?css-modules";

interface HeaderProps {
  mode: number; // heder最右边显示：0：无；1：省略号；2：批量删除；3：加号；4：自定义
  title?: string;
  // 搜索相关
  searching?: boolean;
  setSearching?: React.Dispatch<React.SetStateAction<boolean>>;
  setSearched?: React.Dispatch<React.SetStateAction<boolean>>;
  dataForSearch?: Array<any>;
  setSearchResult?: React.Dispatch<React.SetStateAction<Array<any>>>;
  searchKey?: string;
  setSearchKey?: React.Dispatch<React.SetStateAction<string>>;
  accessArray?: Function;
  // 批量删除相关
  mulDeleting?: boolean;
  setShowBatchActionBottom?: React.Dispatch<React.SetStateAction<boolean>>;
  turnOnBatchDel?: Function;
  // 加号相关
  handleAdd?: Function;
  // 自定义相关
  customBtn?: any;
  handleCustomClick?: Function;
  customHandleBack?: Function;
}

const { useRef, useEffect } = React;

function Header(props: HeaderProps) {
  const { mode, title, mulDeleting, turnOnBatchDel, setShowBatchActionBottom,
    searching, setSearching, setSearched, handleAdd, customBtn, handleCustomClick,
    customHandleBack, dataForSearch, setSearchResult, searchKey, setSearchKey,
    accessArray } = props;

  const multipleRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    mode === 1 && multipleRef.current.addEventListener("click", () => setShowBatchActionBottom(true));
  }, [mode]);

  return (
    <>
      {searching ?
        <Search setSearching={setSearching} setSearched={setSearched} setSearchKey={setSearchKey}
          dataForSearch={dataForSearch} setSearchResult={setSearchResult} searchKey={searchKey}
          accessArray={accessArray}
        /> :
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
            {mode === 2 &&
              <span className={style.search} onClick={() => setSearching(true)}>
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-search"></use>
                </svg>
              </span>
            }
            {mode != 0 && <div className={style.manipulation}>
              {mode === 1 ? <div className={style.multiple} ref={multipleRef}>…</div> :
                mode === 2 ? <div className={style.edit} onClick={() => turnOnBatchDel()}>
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
