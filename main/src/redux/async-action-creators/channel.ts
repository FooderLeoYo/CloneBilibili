// 这个文件提供给router.ts使用，在加载channel组件后即获取数据并dispatch到store

import { AnyAction, Dispatch } from "redux";

import { getPartitions } from "../../api/partitions";

import { setPartitions, setShouldLoad } from "../action-creators";
import { createPartitionTypesTree } from "../../class-object-creators/PartitionType";

export default function getPartitionList() {
  return (dispatch: Dispatch<AnyAction>) => {
    return getPartitions()
      .then(result => {
        if (result.code === "1") {
          let partitions = createPartitionTypesTree(result.data);
          // 过滤掉 番剧，电影，电视剧，纪录片（这几个页面的布局和其他不一样）
          partitions = partitions.filter(
            partition => [13, 23, 11, 177].indexOf(partition.id) === -1);

          dispatch(setPartitions(partitions));
        }

        if (process.env.REACT_ENV === "server") {
          dispatch(setShouldLoad(false));
        }
      });
  }
}
