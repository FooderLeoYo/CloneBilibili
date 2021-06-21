import { AnyAction, Dispatch } from "redux";
import { parse } from "query-string";

import { getPartitions } from "@api/partitions"
import { getLiveIndexData } from "@api/live";

import { store } from "@src/entry-client";
import { Live, UpUser, createPartitionTypesTree, PartitionType, LiveSecQueryParType } from "@class-object-creators/index";
import {
  setliveBanners, setLiveLvTwoTabs, setLvOneTabs, setShouldLoad,
  setLivePartitionRecList, setLiveLvTwoQuery
} from "../../action-creators";

const itemTitle = ["电台", "视频唱见", "单机游戏", "手游", "网游", "娱乐", "虚拟主播"];

export default function getLiveData() {
  return (dispatch: Dispatch<AnyAction>) => {
    const setLvOneTabData = partiRes => {
      if (partiRes.code === "1") {
        let partitions = createPartitionTypesTree(partiRes.data);
        // 过滤掉 番剧，电影，电视剧，纪录片（这几个页面的布局和其他不一样）
        partitions = partitions.filter(partition => [13, 23, 11, 177].indexOf(partition.id) === -1);
        const temp: PartitionType[] = [{ id: 0, name: "首页" } as PartitionType].concat(partitions);
        temp.push(new PartitionType(-1, "直播"));
        dispatch(setLvOneTabs(temp));
      }
    };

    const setOtherIndexData = (liveIndexRes, needToSetTwo: boolean) => {
      if (liveIndexRes.code === "1") {
        const moduleList = liveIndexRes.data.module_list;
        const itemModuleList = moduleList.filter(item => itemTitle.indexOf(item.module_info.title) !== -1);

        // 设置二级tab
        if (needToSetTwo) {
          const itemList = itemModuleList.map(item => {
            const query = parse(item.module_info.link
              .substring(item.module_info.link.indexOf("?")));// substring是js API
            const o = {
              title: query.area_name ? query.area_name : query.parent_area_name,
              parentAreaId: query.area_v2_parent_id ? query.area_v2_parent_id : query.parent_area_id,
              parentAreaName: query.parent_area_name,
              areaId: query.area_v2_id ? query.area_v2_id : query.area_id,
              areaName: query.area_name,
            };
            return o;
          });
          const convertToPartition = itemList.map((item, i) => new PartitionType(i + 1, item.title));
          const tabs = [{ id: 0, name: "直播首页" } as PartitionType].concat(convertToPartition);
          tabs.push(new PartitionType(-1, "全部直播"));
          dispatch(setLiveLvTwoTabs(tabs));
          dispatch(setLiveLvTwoQuery(itemList.map(item =>
            new LiveSecQueryParType(item.parentAreaId, item.parentAreaName, item.areaId, item.areaName)
          )));
        }

        // 设置banner
        const bannerList = moduleList.find(item => item.module_info.title === "banner位").list;
        dispatch(setliveBanners(bannerList));

        // 设置推荐
        const partitionRecList = [];
        itemModuleList.forEach(item => {
          partitionRecList.push(item.list.splice(0, 4).map(data =>
            new Live(data.title, data.roomid, data.online, data.cover, 0,
              "", new UpUser(0, data.uname, data.face))
          ));
        });
        dispatch(setLivePartitionRecList(partitionRecList));
      }
    };

    if (process.env.REACT_ENV === "server") {
      dispatch(setShouldLoad(false));
      const promises = [getPartitions(), getLiveIndexData()];
      // 服务端渲染时必须将操作包到promise中并return，因为server/renderer是用route.asyncData来获取数据并dispatch到store的
      // 如果没有return一个promise，那么asyncData将是：store.dispatch(void);
      // 下面else中的客户端渲染部分则不需要return一个promise，因为客户端渲染数据不依赖asyncData
      return Promise.all(promises).then(([partiRes, liveIndexRes]) => {
        setLvOneTabData(partiRes);
        setOtherIndexData(liveIndexRes, true);
      });
    } else {
      // 一二级tab如果store中已有数据则复用，banner和推荐由于更新频繁因此每次都重新获取
      const { lvOneTabs, liveLvTwoTabs } = store.getState();
      lvOneTabs.length === 0 && getPartitions().then(partiRes => setLvOneTabData(partiRes));
      getLiveIndexData().then(liveIndexRes => { setOtherIndexData(liveIndexRes, liveLvTwoTabs.length === 0) });
    }
  }
}
