import { AnyAction, Dispatch } from "redux";
import { parse } from "query-string";

import { getPartitions } from "../../../api/partitions"
import { getLiveIndexData } from "../../../api/live";

import { Live, UpUser, createPartitionTypes } from "../../../class-object-creators";
import { setLiveData, setOneLevelPartitions, setShouldLoad } from "../../action-creators";

const itemTitle = [
  "电台", "网游", "手游",
  "单机", "娱乐", "绘画"
];

export default function getLiveData() {
  return (dispatch: Dispatch<AnyAction>) => {
    const promises = [
      getPartitions(),
      getLiveIndexData(),
    ]
    return Promise.all(promises)
      .then(([partiRes, liveIndexRes]) => {
        if (partiRes.code === "1") {
          const partitions = partiRes.data["0"];
          let oneLevels = createPartitionTypes(partitions);
          // 过滤掉 番剧，电影，电视剧，纪录片
          oneLevels = oneLevels.filter(partition => [13, 23, 11, 177].indexOf(partition.id) === -1);
          dispatch(setOneLevelPartitions(oneLevels));
        }

        if (liveIndexRes.code === "1") {
          const moduleList = liveIndexRes.data.module_list;

          const bannerList = moduleList.find(item =>
            item.module_info.title === "banner位").list;

          const itemModuleList = moduleList.filter(item =>
            itemTitle.indexOf(item.module_info.title) !== -1
          );

          // 直播类型列表
          const itemList = itemModuleList.map(item => {
            const query = parse(item.module_info.link
              // substring是js API
              .substring(item.module_info.link.indexOf("?")));
            const o = {
              title: item.module_info.title,
              parentAreaId: query.parent_area_id,
              parentAreaName: query.parent_area_name,
              areaId: query.area_id,
              areaName: query.area_name,
              list: []
            };
            // splice(0, 4)是从第0位开始删除4个元素
            o.list = item.list.splice(0, 4).map(data =>
              new Live(data.title, data.roomid, data.online, data.cover, 0,
                "", new UpUser(0, data.uname, data.face))
            )

            return o;
          });

          dispatch(setLiveData({
            bannerList,
            itemList
          }));
        }

        if (process.env.REACT_ENV === "server") {
          dispatch(setShouldLoad(false));
        }
      }
      );
  }
}
