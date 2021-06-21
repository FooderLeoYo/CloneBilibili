import { AnyAction, Dispatch } from "redux";

import { getBanner } from "@api/index";
import { getPartitions } from "@api/partitions"
import { getRankings } from "@api/ranking";

import { store } from "@src/entry-client";
import { createPartitionTypesTree, createVideoByRanking, PartitionType } from "@class-object-creators/index";
import { setLvOneTabs, setBanners, setRankingVideos, setShouldLoad } from "../action-creators";

export default function getIndexContent() {
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

    const setOtherIndexData = (banRes, ranRes) => {
      if (banRes.code === "1") {
        const data = banRes.data;
        if (data) {
          const banners = data.map(item => (
            { id: item.id, name: item.name, pic: item.pic, url: item.url }
          ));
          dispatch(setBanners(banners));
        }
      }

      if (ranRes.code === "1") {
        const list = ranRes.data.list;
        const rankingVideos = list.map(data => createVideoByRanking(data));

        dispatch(setRankingVideos(rankingVideos));
      }
    };

    if (process.env.REACT_ENV === "server") {
      dispatch(setShouldLoad(false));
      const promises = [getPartitions(), getBanner(), getRankings(0)];
      return Promise.all(promises).then(([partiRes, banRes, ranRes]) => {
        setLvOneTabData(partiRes);
        setOtherIndexData(banRes, ranRes);
      });
    } else {
      store.getState().lvOneTabs.length === 0 && getPartitions().then(partiRes => setLvOneTabData(partiRes));
      const promises = [getBanner(), getRankings(0)];
      Promise.all(promises).then(([banRes, ranRes]) => setOtherIndexData(banRes, ranRes));
    }
  }
}
