// 路由模块化，抽离路由配置
//router中的asyncData配置了组件一加载就获取数据并dispatch到store，以作为props供该路由对应的组件使用

import loadable from "@loadable/component"; // 组件懒加载

import NestedRoute from "./NestedRoute";
import StatusRoute from "./StatusRoute";

import getIndexContent from "../redux/async-action-creators/index";
import getPartitionList from "../redux/async-action-creators/channel";
import { getRankingVideoList } from "../redux/async-action-creators/ranking";
import getVideoInfo from "../redux/async-action-creators/video";
import getUpUserInfo from "../redux/async-action-creators/space";

import getLiveData from "../redux/async-action-creators/live/index";
import getLiveListInfo from "../redux/async-action-creators/live/list";
import getRoomData from "../redux/async-action-creators/live/room";


const router = [
  {
    path: "/index",
    // 路由匹配后，懒加载对应组件
    // 加载的组件是connect后的，这样组件拿到的props就只有自己需要的，而不是整个store
    component: loadable(() => import(/* webpackChunkName: 'index' */ "../redux/connect/Index")),
    // asyncData只有服务端渲染时会被调用
    // 如果组件是通过路由跳转加载的，需要手动dispatch
    asyncData: store => {
      return store.dispatch(getIndexContent());
    }
  },
  {
    path: "/channel/:rId",
    component: loadable(() => import(/* webpackChunkName: 'channel' */ "../redux/connect/Channel")),
    asyncData: store => {
      return store.dispatch(getPartitionList());
    }
  },
  {
    path: "/ranking/:rId",
    component: loadable(() => import(/* webpackChunkName: 'ranking' */ "../redux/connect/Ranking")),
    asyncData: (store, param) => {
      return store.dispatch(getRankingVideoList(param.rId));
    }
  },
  {
    path: "/video/av:aId",
    component: loadable(() => import(/* webpackChunkName: 'video' */ "../redux/connect/Video")),
    asyncData: (store, param) => {
      return store.dispatch(getVideoInfo(param.aId))
    }
  },
  {
    path: "/space/:mId",
    component: loadable(() => import(/* webpackChunkName: 'up-user' */ "../redux/connect/Sapce")),
    asyncData: (store, param) => {
      return store.dispatch(getUpUserInfo(param.mId));
    },
  },
  {
    path: "/search",
    component: loadable(() => import(/* webpackChunkName: 'search' */ "../views/search/search/Search"))
  },
  {
    path: "/live",
    component: loadable(() => import(/* webpackChunkName: 'live-index' */ "../redux/connect/live/Index")),
    exact: true,
    asyncData: store => {
      return store.dispatch(getLiveData());
    }
  },
  {
    path: "/live/list",
    component: loadable(() => import(/* webpackChunkName: 'live-list' */ "../redux/connect/live/List")),
    asyncData: (store, param) => {
      return store.dispatch(getLiveListInfo({
        parentAreaId: param.parent_area_id,
        areaId: param.area_id,
        page: 1,
        pageSize: 30
      }));
    }
  },
  {
    path: "/live/:roomId",
    component: loadable(() => import(/* webpackChunkName: 'live-room' */ "../redux/connect/live/Room")),
    asyncData: (store, param) => {
      return store.dispatch(getRoomData(param.roomId));
    }
  },
  {
    path: "/login",
    component: loadable(() => import(/* webpackChunkName: 'login' */ "../views/login/Login")),
  },
  {
    path: "/me",
    exact: true,
    component: loadable(() => import(/* webpackChunkName: 'me' */ "../views/me/index/Index")),
  },
  {
    path: "/me/history",
    component: loadable(() => import(/* webpackChunkName: 'me-list' */ "../views/me/list/genre/my-history/MyHistory")),
  },
  {
    path: "/me/favlist/:uid",
    component: loadable(() => import(/* webpackChunkName: 'me-list' */ "../views/me/list/genre/favorites/Favorites")),
  },
  {
    path: "/me/favdetail",
    search: "?favid=favid&uid=uid",
    component: loadable(() => import(/* webpackChunkName: 'up-user' */ "../views/me/list/genre/favorites/child-components/fav-detail/FavDetail")),
  },
];

export default router;

export {
  NestedRoute,
  StatusRoute
}
