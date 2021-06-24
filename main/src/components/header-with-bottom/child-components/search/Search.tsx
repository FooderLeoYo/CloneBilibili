import * as React from "react";

import CleanText from "@root/src/components/clean-text/CleanText"
import style from "./search.styl?css-modules";

interface SearchProps {
  setKeyword: (keyword: string) => any;
  setSerching: React.Dispatch<React.SetStateAction<boolean>>;
}

const { useRef } = React;

function Search(props: SearchProps) {
  const { setKeyword, setSerching } = props;
  const cleanTextRef: React.MutableRefObject<any> = useRef(null);
  const searchInputRef: React.MutableRefObject<HTMLInputElement> = useRef(null);

  console.log(searchInputRef.current?.value)

  return (
    <div className={style.search}>
      <div className={style.boxWrapper}>
        <span className={style.searchIcon}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-search"></use>
          </svg>
        </span>
        <input className={style.searchBox} type="search" autoComplete="off" maxLength={33}
          placeholder="输入搜索关键字"
          onChange={e => cleanTextRef.current.checkIfShow(e.currentTarget.value)}
          onKeyDown={e => e.keyCode === 13 && e.currentTarget.value && setKeyword(e.currentTarget.value)}
          ref={searchInputRef}
        />
        <CleanText inputDOMRef={searchInputRef} ref={cleanTextRef} />
      </div>
      {/* “取消”按钮 */}
      <span className={style.cancel} onClick={() => setSerching(false)}>取消</span>
    </div>
  )
}

export default Search;
