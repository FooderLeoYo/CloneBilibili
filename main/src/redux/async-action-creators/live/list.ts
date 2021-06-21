import { AnyAction, Dispatch } from "redux";
import { parse } from "query-string";

import { getPartitions } from "@api/partitions"
import { getLiveListData, getLiveIndexData } from "@api/live";

import { Live, UpUser, createPartitionTypes, PartitionType, LiveSecQueryParType } from "@class-object-creators/index";
import {
  setShouldLoad, setLiveList, setLiveLvTwoTabs, setLvOneTabs,
  setLiveLvTwoQuery, setliveBanners, setLivePartitionRecList
} from "../../action-creators";
import { store } from "@src/entry-client";

const itemTitle = ["电台", "视频唱见", "单机游戏", "手游", "网游", "娱乐", "虚拟主播"];

export default function getLiveListInfo(data: {
  parentAreaId: number;
  areaId: number;
  page: number,
  pageSize: number
}) {
  return (dispatch: Dispatch<AnyAction>) => {
    const setLvOneTabData = partiRes => {
      if (partiRes.code === "1") {
        let oneLevels = createPartitionTypes(partiRes.data["0"]);
        // 过滤掉 番剧，电影，电视剧，纪录片
        oneLevels = oneLevels.filter(partition => [13, 23, 11, 177].indexOf(partition.id) === -1);
        const temp: PartitionType[] = [{ id: 0, name: "首页" } as PartitionType].concat(oneLevels);
        temp.push(new PartitionType(-1, "直播"));
        dispatch(setLvOneTabs(temp));
      }
    };

    const setOtherListData = (liveListRes, liveIndexRes, needToSetTwo: boolean) => {
      if (liveListRes.code === "1") {
        const list = liveListRes.data.list.map(data =>
          new Live(data.title, data.roomid, data.online, data.user_cover, 0, "", new UpUser(data.uid, data.uname, data.face))
        );
        dispatch(setLiveList({ total: liveListRes.data.count, list }));
      }

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
      const promises = [getLiveListData(data), getPartitions(), getLiveIndexData()];
      return Promise.all(promises).then(([liveListRes, partiRes, liveIndexRes]) => {
        setLvOneTabData(partiRes);
        setOtherListData(liveListRes, liveIndexRes, true);
      });
    } else {
      const { lvOneTabs, liveLvTwoTabs } = store.getState();
      lvOneTabs.length === 0 && getPartitions().then(partiRes => setLvOneTabData(partiRes));
      const promises = [getLiveListData(data), getLiveIndexData()];
      Promise.all(promises).then(([liveListRes, liveIndexRes]) =>
        setOtherListData(liveListRes, liveIndexRes, liveLvTwoTabs.length === 0)
      );
    }
  }
}