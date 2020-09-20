// 这个文件是用来添加/获取localStorage的
// localStorage 可以将第一次请求的数据直接存储到本地
// 相当于一个 5M 大小的针对于前端页面的数据库

const VIEW_HISTORY = "view_history";
const SEARCH_HISTORY = "search_history";

export interface ViewHistory {
  aId: number;
  title: string;
  pic: string;
  viewAt: number;
}

export interface SearcHistory {
  value: string;
  timestamp: number;
}

export default {
  //  添加播放历史
  setViewHistory(history: ViewHistory): void {
    let viewHistory = [];
    const item = window.localStorage.getItem(VIEW_HISTORY);
    if (item) {
      viewHistory = JSON.parse(item);
    }

    const findIndex = viewHistory.findIndex(view => view.aId === history.aId);
    // 如果之前有相同的历史记录则删除旧记录，并将新纪录添加到最后，其实就是换个位子
    if (findIndex !== -1) {
      viewHistory.splice(findIndex, 1);
    }

    viewHistory.unshift(history);
    // 将旧localStorage替换为新的
    window.localStorage.removeItem(VIEW_HISTORY);
    window.localStorage.setItem(VIEW_HISTORY, JSON.stringify(viewHistory));
  },

  // 获取播放历史
  getViewHistory(): ViewHistory[] {
    const item = window.localStorage.getItem(VIEW_HISTORY);
    return item ? JSON.parse(item) : [];
  },

  // 添加搜索历史
  setSearchHistory(history: SearcHistory): void {
    let searchHistory = [];
    const item = window.localStorage.getItem(SEARCH_HISTORY);
    if (item) {
      searchHistory = JSON.parse(item);
    }

    const findIndex = searchHistory.findIndex(view => view.value === history.value);
    if (findIndex !== -1) {
      searchHistory.splice(findIndex, 1);
    }

    searchHistory.unshift(history);
    this.clearSearchHistory();
    window.localStorage.setItem(SEARCH_HISTORY, JSON.stringify(searchHistory));
  },

  //  获取搜索历史
  getSearchHistory(): SearcHistory[] {
    const item = window.localStorage.getItem(SEARCH_HISTORY);
    return item ? JSON.parse(item) : [];
  },

  // 清空搜索历史
  clearSearchHistory(): void {
    window.localStorage.removeItem(SEARCH_HISTORY);
  },

  clearViewHistory(): void {
    window.localStorage.removeItem(VIEW_HISTORY);
  }
}
