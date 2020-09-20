import { AnyAction, Dispatch } from "redux";

import { getBanner } from "../../api/index";
import { getPartitions } from "../../api/partitions"
import { getRankings } from "../../api/ranking";

import { createPartitionTypes, createVideoByRanking } from "../../class-object-creators";
import { setOneLevelPartitions, setBanners, setRankingVideos, setShouldLoad } from "../action-creators";

export default function getIndexContent() {
  return (dispatch: Dispatch<AnyAction>) => {
    const promises = [
      getPartitions(),
      getBanner(),
      getRankings(0),
    ];
    return Promise.all(promises).then(([result1, result2, result3]) => {
      if (result1.code === "1") {
        const partitions = result1.data["0"];
        let oneLevels = createPartitionTypes(partitions);
        // 过滤掉 番剧，电影，电视剧，纪录片
        oneLevels = oneLevels.filter(partition => [13, 23, 11, 177].indexOf(partition.id) === -1);

        dispatch(setOneLevelPartitions(oneLevels));
      }

      if (result2.code === "1") {
        const data = result2.data;
        if (data) {
          const banners = data.map(item => (
            {
              id: item.id,
              name: item.name,
              pic: item.pic,
              url: item.url
            }
          ));

          dispatch(setBanners(banners));
        }
      }

      if (result3.code === "1") {
        const list = result3.data.list;
        const rankingVideos = list.map(data => createVideoByRanking(data));

        dispatch(setRankingVideos(rankingVideos));
      }


      if (process.env.REACT_ENV === "server") {
        dispatch(setShouldLoad(false));
      }
    });
  }
}
