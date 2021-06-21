// 这个文件提供给router.ts使用，在加载channel组件后即获取数据并dispatch到store

import { AnyAction, Dispatch } from "redux";

import { getPartitions } from "../../api/partitions";

import { store } from "@src/entry-client";
import { setLvOneTabs, setShouldLoad } from "../action-creators";
import { createPartitionTypesTree, PartitionType } from "@class-object-creators/PartitionType";

export default function getPartitionList() {
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

    if (process.env.REACT_ENV === "server") {
      dispatch(setShouldLoad(false));
      return getPartitions().then(partiRes => setLvOneTabData(partiRes));
    } else {
      store.getState().lvOneTabs.length === 0 && getPartitions().then(partiRes => setLvOneTabData(partiRes));
    }
  }
}
