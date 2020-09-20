import { AnyAction, Dispatch } from "redux";
import { parse } from "query-string";

import { getPartitions } from "../../../api/partitions"
import { getLiveListData, getLiveIndexData } from "../../../api/live";

import { Live, UpUser, createPartitionTypes } from "../../../class-object-creators";
import { setShouldLoad, setLiveList, setLiveData, setOneLevelPartitions } from "../../action-creators";

const itemTitle = [
  "电台", "网游", "手游",
  "单机", "娱乐", "绘画"
];

export default function getLiveListInfo(data: {
  parentAreaId: number;
  areaId: number;
  page: number,
  pageSize: number
}) {
  return (dispatch: Dispatch<AnyAction>) => {
    const promises = [
      getLiveListData(data),
      getPartitions(),
      getLiveIndexData(),
    ]
    return Promise.all(promises)
      .then(([liveListRes, partiRes, liveIndexRes]) => {
        if (liveListRes.code === "1") {
          const list = liveListRes.data.list.map((data) =>
            new Live(data.title, data.roomid, data.online, data.user_cover, 0, "",
              new UpUser(data.uid, data.uname, data.face))
          );

          dispatch(setLiveList({
            total: liveListRes.data.count,
            list
          }));
        }

        if (partiRes.code === "1") {
          const partitions = partiRes.data["0"];
          let oneLevels = createPartitionTypes(partitions);
          // 过滤掉 番剧，电影，电视剧，纪录片
          oneLevels = oneLevels.filter((partition) => [13, 23, 11, 177].indexOf(partition.id) === -1);
          dispatch(setOneLevelPartitions(oneLevels));
        }

        if (liveIndexRes.code === "1") {
          const moduleList = liveIndexRes.data.module_list;

          const itemModuleList = moduleList.filter((item) =>
            itemTitle.indexOf(item.module_info.title) !== -1
          );

          // 直播列表
          const itemList = itemModuleList.map((item) => {
            const query = parse(item.module_info.link.substring(item.module_info.link.indexOf("?")));
            const o = {
              title: item.module_info.title,
              parentAreaId: query.parent_area_id,
              parentAreaName: query.parent_area_name,
              areaId: query.area_id,
              areaName: query.area_name,
            };
            return o;
          });

          dispatch(setLiveData({
            itemList
          }));
        }

        if (process.env.REACT_ENV === "server") {
          dispatch(setShouldLoad(false));
        }
      });
  }
}