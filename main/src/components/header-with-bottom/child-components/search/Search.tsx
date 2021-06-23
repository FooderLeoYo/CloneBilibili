import * as React from "react";

import Clean from "@components/clean/CleanText"
import style from "./search.styl?css-modules";

interface SearchProps {
  setSerching: React.Dispatch<React.SetStateAction<boolean>>;
}

const { useState, useRef } = React;

function Search(props: SearchProps) {
  const { setSerching } = props;

  const [searchValue, setSearchValue] = useState("");
  const searchInputRef: React.MutableRefObject<HTMLInputElement> = useRef(null);

  return (
    <div className={style.search}>
      <div className={style.boxWrapper}>
        <span className={style.searchIcon}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-search"></use>
          </svg>
        </span>
        <input className={style.searchBox} type="search" autoComplete="off" maxLength={33}
          placeholder="输入搜索关键字" onChange={e => setSearchValue(e.currentTarget.value)}
          onKeyDown={() => console.log("回车")} ref={searchInputRef}
        />
        <Clean inputValue={searchValue}
          inputDOMRef={searchInputRef} clickMethods={() => setSearchValue("")}
        />
      </div>
      {/* “取消”按钮 */}
      <span
        className={style.cancel} onClick={() => setSerching(false)}      >取消</span>
    </div>
  )
}

export default Search;
