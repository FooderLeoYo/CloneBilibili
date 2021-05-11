import * as React from "react";
import { Helmet } from "react-helmet";

import Result from "../result/Result";
import { getHotwords, getSuggests } from "../../../api/search";
import storage, { SearcHistory } from "../../../customed-methods/storage";
import Clean from "../../../components/clean/Clean"

import style from "./search.styl?css-modules";

interface SearchState {
  searchValue: string; // 用户输入过程中的搜索框中的值
  keyword: string; // 用户最终要搜索的关键字
  words: string[]; // “大家都在搜”的tags
  suggestList: Array<{ name: string, value: string }>; // 根据用户输入内容获取的智能推荐
  searchHistories: SearcHistory[]; // 保存在localstorage中的搜索记录
}

class Search extends React.Component<any, SearchState> {
  /* 以下为初始化 */
  constructor(props) {
    super(props);
    this.state = {
      searchValue: "",
      keyword: "",
      words: [],
      suggestList: [],
      searchHistories: []
    }
  }

  /* 以下为自定义方法 */
  // 设置用户最终要搜索的关键字
  private setKeyword(keyword) {
    if (keyword) {
      this.setState({
        suggestList: [],
        // 这里要把searchValue设置成keyword是因为：
        // 如果用户是通过点击“大家都在搜”或“智能推荐”搜索的，搜索框中是没有这个关键字的
        // 而搜索框习惯上应该显示用户当前搜索的关键字
        searchValue: keyword,
        keyword,
      });
      // 记录当前搜索历史
      storage.setSearchHistory({
        value: keyword,
        timestamp: new Date().getTime()
      });
    }
  }

  // 获取搜索建议
  private getSuggests = e => {
    // 如果用户敲下的不是回车，说明没输完
    if (e.keyCode !== 13) {
      const content = e.currentTarget.value;
      if (content) {
        getSuggests(content)
          .then(result => {
            if (result.code === "1") {
              let suggestList = [];
              if (result.data.tag) {
                suggestList = result.data.tag.map(item => {
                  return { name: item.name, value: item.value }
                })
              }
              this.setState({
                suggestList,
                keyword: ""
              });
            }
          });
      } else { // 用户没输入内容的时候，则不显示推荐列表
        this.setState({
          suggestList: [],
          keyword: ""
        });
      }
    }
  }

  //  当用户敲下回车后，清空推荐列表、设置keyword、记录搜索历史
  private setSearchContent = e => {
    if (e.keyCode === 13) {
      const content = e.currentTarget.value;
      if (content) {
        this.setState({
          suggestList: [], // 清空推荐列表
          keyword: content
        });
        // 记录当前搜索历史
        storage.setSearchHistory({
          value: content,
          timestamp: new Date().getTime()
        });
      }
    }
  }

  //  清除搜索内容
  private clearSearch() {
    this.setState({
      suggestList: [],
      searchValue: "",
      keyword: "",
      searchHistories: storage.getSearchHistory()
    });
  }

  //  清除搜索历史记录
  private clearSearchHistory() {
    storage.clearSearchHistory();
    this.setState({ searchHistories: [] });
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    getHotwords()
      .then(result => {
        if (result.code === "1") {
          const words = result.data.map(item => item.keyword)
          this.setState({ words });
        }
      });
    this.setState({ searchHistories: storage.getSearchHistory() });
  }

  /* 以下为渲染部分 */
  public render() {
    return (
      <div className="search">
        <Helmet>
          <title>搜索</title>
        </Helmet>
        {/* 搜索框 */}
        <div className={style.searchTop}>
          <div className={style.boxWrapper}>
            <span className={style.searchIcon}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-search"></use>
              </svg>
            </span>
            <input
              type="search"
              autoComplete="off"
              maxLength={33}
              placeholder="搜索视频、up主或av号"
              value={this.state.searchValue}
              className={style.searchBox}
              onChange={e => {
                this.setState({ searchValue: e.currentTarget.value })
              }}
              onKeyUp={this.getSuggests}
              onKeyDown={this.setSearchContent}
            />
            {/* 清空输入内容 */}
            {/* {
              this.state.searchValue ? (
                <span
                  className={style.cleanContent}
                  onClick={() => { this.clearSearch(); }}
                >
                  <svg className="icon" aria-hidden="true">
                    <use href="#icon-close"></use>
                  </svg>
                </span>
              ) : null
            } */}
            <Clean inputValue={this.state.searchValue} inputDOMRef={passwordRef} />

          </div>
          {/* “取消”按钮 */}
          <span
            className={style.cancel}
            onClick={() => { window.history.back(); }}
          >取消</span>
        </div>
        { // 用户已确认最终要搜索的关键词
          this.state.keyword ? (
            <div className={style.searchResult}>
              <Result keyword={this.state.keyword} />
            </div>
          ) : ( // 用户未确认最终要搜索的关键词
            <div>
              {/* 大家都在搜 */}
              <div className={style.words}>
                <div className={style.wordTitle}>大家都在搜</div>
                <div className={style.wordWrapper + " clear"}>
                  {
                    this.state.words.map((word, i) => (
                      <div
                        className={style.wordItem}
                        key={"word" + i}
                        onClick={() => { this.setKeyword(word) }}
                      >{word}</div>
                    ))
                  }
                </div>
              </div>
              { // 根据用户输入内容智能推荐
                this.state.suggestList.length > 0 ? (
                  <div className={style.suggest}>
                    {
                      this.state.suggestList.map((suggest, i) => (
                        <div className={style.suggestItem} key={"suggest" + i}>
                          <p
                            // 这里使用dangerouslySetInnerHTML是因为拿到的数据suggest.name就是个html元素而不是字符串
                            dangerouslySetInnerHTML={{ __html: suggest.name }}
                            onClick={() => { this.setKeyword(suggest.value) }}
                          />
                        </div>
                      ))
                    }
                  </div>
                ) : null
              }
              {/* 历史搜索 */}
              <div className={style.history}>
                <div className={style.historyTitle}>历史搜索</div>
                <div className={style.historyList}>
                  {
                    this.state.searchHistories.map((history, i) => (
                      <div
                        className={style.historyItem}
                        key={i}
                        onClick={() => { this.setKeyword(history.value); }}
                      >
                        <span className={style.historyIcon} >
                          <svg className="icon" aria-hidden="true">
                            <use href="#icon-history"></use>
                          </svg>
                        </span>
                        <div className={style.name}>{history.value}</div>
                      </div>
                    ))
                  }
                </div>
                { // 清空历史记录
                  this.state.searchHistories.length > 0 ? (
                    <div
                      className={style.historyClear}
                      onClick={() => { this.clearSearchHistory(); }}
                    >清除历史记录</div>
                  ) : null
                }
              </div>
            </div>
          )
        }
      </div>
    );
  }
}
export default Search;
