import { AnyAction, Dispatch } from "redux";

import { getRankingPartitions } from "../../api/partitions";
import { getRankings } from "../../api/ranking";

import { setShouldLoad, setRankingPartitions, setRankingVideos } from "../action-creators";

import { createPartitionTypes, createVideoByRanking } from "../../class-object-creators";

export function getRankingVideoList(rId: number) {
  return (dispatch: Dispatch<AnyAction>) => {
    return Promise.all([
      getRankingPartitions(),
      getRankings(rId)
    ]).then(([result1, result2]) => {
      if (result1.code === "1") {
        let partitions = createPartitionTypes(result1.data);
        // 过滤掉 番剧，电影，电视剧，纪录片
        partitions = partitions.filter((partition) => [13, 23, 11, 177].indexOf(partition.id) === -1);
        dispatch(setRankingPartitions(partitions));
      }
      if (result2.code === "1") {
        const list = result2.data.list;
        const rankingVideos = list.map(data => createVideoByRanking(data));
        dispatch(setRankingVideos(rankingVideos.splice(0, 30)));
      }
      // process.env.REACT_ENV === "server"是在webpack.config.server.js中设置的
      if (process.env.REACT_ENV === "server") {
        dispatch(setShouldLoad(false));
      }
    })
  }
}

export function getVideoList(rId: number) {
  return (dispatch) => {
    return getRankings(rId).then((result) => {
      if (result.code === "1") {
        const list = result.data.list;
        const rankingVideos = list.map((data) => createVideoByRanking(data));
        dispatch(setRankingVideos(rankingVideos.splice(0, 30)));
      }
    })
  }
}
