import * as React from "react";
import CleanText from "@root/src/components/clean-text/CleanText"
import style from "./search.styl?css-modules";

interface SearchProps {
  dataForSearch: any;
  searchKey: string;
  accessTarKey: Function;
  setSearchResult: React.Dispatch<React.SetStateAction<any>>;
  setSearchKey: React.Dispatch<React.SetStateAction<string>>;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
  setSearched: React.Dispatch<React.SetStateAction<boolean>>;
}

const { useRef, useEffect } = React;

function Search(props: SearchProps) {
  const { dataForSearch, searchKey, setSearchResult, setSearching,
    setSearched, setSearchKey, accessTarKey } = props;
  const cleanTextRef: React.MutableRefObject<any> = useRef(null);
  const searchInputRef: React.MutableRefObject<HTMLInputElement> = useRef(null);

  const getSearchRes = () => {
    const findAndHightlight = (list: Array<any>, keyAsString: string) => { // list是目标key所在的那层数组，keyAsString是字符串格式的目标key名
      const searchRes = list.filter(item => item[keyAsString].indexOf(searchKey) !== -1);
      const copy = JSON.parse(JSON.stringify(searchRes)); // 序列化后反序列化，实现深拷贝，否则修改title时会连dataForSearch的也一起改
      copy.forEach(item => {
        const target = item[keyAsString];
        const index = target.indexOf(searchKey);
        const front: string = target.slice(0, index);
        const back = target.slice(index + searchKey.length);
        item[keyAsString] = front + "<em class='keyword'>" + searchKey + "</em>" + back;
      });
      return copy;
    }

    // accessTarKey作用：父组件逐层遍历被搜索对象的数据结构并到达到目标key那层的数组
    setSearchResult(accessTarKey(dataForSearch, findAndHightlight));
  }

  const setKeyword = (keyword: string) => {
    setSearchKey(keyword);
    setSearched(true);
  }

  useEffect(() => {
    searchKey?.length > 0 && getSearchRes();
  }, [searchKey]);

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
          onKeyDown={e => e.key === "Enter" && e.currentTarget.value && setKeyword(e.currentTarget.value)}
          ref={searchInputRef}
        />
        <CleanText inputDOMRef={searchInputRef} ref={cleanTextRef} />
      </div>
      {/* “取消”按钮 */}
      <span className={style.cancel} onClick={() => {
        setSearching(false);
        setSearched(false);
      }}>取消</span>
    </div>
  )
}

export default Search;
