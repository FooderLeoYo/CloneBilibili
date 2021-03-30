import * as React from "react";
import { Location } from "history";
import { Helmet } from "react-helmet";
import { parse } from "query-string";
import { History } from "history";
import { Link } from "react-router-dom";

import Context from "../../../context";
import { getLiveListData } from "../../../api/live";
import { setShouldLoad } from "../../../redux/action-creators";

import { Live, UpUser, PartitionType, LiveSecQueryParType } from "../../../class-object-creators";
import Nav from "../child-components/Nav"
import LiveInfo from "../child-components/LiveInfo";
import ScrollToTop from "../../../components/scroll-to-top/ScrollToTop";

import style from "./list.styl?css-modules";

interface ListProps {
  shouldLoad: boolean;
  liveListData: {
    total: number,
    list: Array<Live>
  };
  liveData: {
    itemList: Array<{
      title: string,
      parentAreaId: number,
      parentAreaName: string,
      areaId: number,
      areaName: string,
    }>,
  },
  location: Location;
  dispatch: (action: any) => Promise<void>;
  history: History;
  lvOnePartitions: PartitionType[];
}

const { useState, useEffect, useMemo } = React;

const livePage: { pageNumber: number, pageSize: number, totalPage: number } = {
  // 首次点击“加载更多”调用getLives时，就要根据pageNumber获取数据
  // “加载更多”要获取的数据肯定是从第二页开始，因此pageNumber初始值为2
  pageNumber: 2,
  pageSize: 30,
  totalPage: 1
}

function List(props: ListProps) {
  const { shouldLoad, liveListData, location, dispatch } = props;
  const query = parse(location.search);

  const [lives, setLives] = useState(liveListData.list);
  // const [isDataOk, setIsDataOk] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [firstTimeRender, setFirstTimeRender] = useState(true);

  // 第一次render
  let firstRender: boolean = true;
  if (firstRender) {
    livePage.totalPage = Math.ceil(liveListData.total / livePage.pageSize);
    firstRender = false;
  }

  /* 导航栏数据 */
  // 一级导航栏
  const { lvOnePartitions } = props;
  const lvOneTabBarData: PartitionType[] = useMemo(() => {
    let temp: PartitionType[] = [{ id: 0, name: "首页" } as PartitionType].concat(lvOnePartitions);
    temp.push(new PartitionType(-1, "直播"));

    return temp;
  }, []);
  // 二级导航栏
  const { itemList } = props.liveData;
  const lvTwoPartitions: PartitionType[] = useMemo(() => {
    if (itemList.length > 0) {
      // 这里用map而不用forEach是因为forEach没有返回值而是直接修改原数组
      const temp = itemList.map((item, i) =>
        new PartitionType(i + 1, item.title)
      );

      return temp;
    }
  }, [itemList]);
  const lvTwoTabBarData: PartitionType[] = useMemo(() => {
    if (lvTwoPartitions) {
      const temp = [{ id: 0, name: "直播首页" } as PartitionType].concat(lvTwoPartitions);
      temp.push(new PartitionType(7, "全部直播"));

      return temp;
    }
  }, [lvTwoPartitions]);
  const secondQueryPar: LiveSecQueryParType[] = useMemo(() => {
    if (itemList.length > 0) {
      const temp = itemList.map(item =>
        new LiveSecQueryParType(item.parentAreaId, item.parentAreaName, item.areaId, item.areaName)
      );

      return temp;
    }
  }, [itemList]);
  const parentName = query.parent_area_name;
  const lvTwoInx: number = useMemo(() => {
    if (lvTwoTabBarData) {
      const temp = lvTwoTabBarData.findIndex(parittion =>
        parittion.name === parentName
      );
      return temp;
    }
  }, [parentName]);

  /* 以下为自定义方法 */
  const getLives = () => {
    getLiveListData({
      parentAreaId: query.parent_area_id as any,
      areaId: query.area_id as any,
      page: livePage.pageNumber,
      pageSize: livePage.pageSize
    }).then(result => {
      if (result.code === "1") {
        const list = result.data.list.map(data =>
          new Live(data.title, data.roomid, data.online, data.user_cover, 0,
            "", new UpUser(data.uid, data.uname, data.face)));

        livePage.totalPage = Math.ceil(result.data.count / livePage.pageSize);
        livePage.pageNumber++;

        setLives(lives.concat(list));
        setIsLoadMore(false);
        // setIsDataOk(true);
      }
    });
  };

  useEffect(() => {
    if (shouldLoad) {
      livePage.pageNumber = 1;
      getLives();
    } else {
      // setIsDataOk(true);
      dispatch(setShouldLoad(true));
    }
  }, []);

  // 切换二级tab后清空之前的lives
  useEffect(() => {
    if (!firstTimeRender) {
      // setIsDataOk(false);
      setLives([]); // 这里清空生效太慢加setTimeout都不行，所以只能再用另一个useEffect获取新数据
    } else {
      setFirstTimeRender(false);
    }
  }, [props.location.key]);
  // 切换二级tab后获取新的lives数据
  useEffect(() => {
    if (lives.length === 0) { // 判断的作用是：getLives后将继续触发该useEffect，形成死循环
      livePage.pageNumber = 1;
      getLives();
    }
  }, [lives.length])

  return (
    <div className="live-list">
      <Helmet>
        <title>直播-{query.area_name ? query.area_name : query.parent_area_name}</title>
      </Helmet>
      {
        // !isDataOk ? <LoadingCutscene /> :
        <>
          <div className={style.head}>
            <Nav
              history={props.history}
              firstTabBarData={lvOneTabBarData}
              secondTabBarData={lvTwoTabBarData}
              secondQueryPar={secondQueryPar}
              lvTwoInx={lvTwoInx}
            />
          </div>
          <Context.Consumer>
            {context => (
              <section className={style.main}>
                <div className={style.roomContainer}>
                  {/* 分类名称 */}
                  <h4 className={style.title}>
                    {query.area_name ? query.area_name : query.parent_area_name}
                  </h4>
                  {/* 房间列表 */}
                  <div className={style.rooms}>
                    {
                      lives.map(data => {
                        if (data.cover.indexOf(context.picURL) === -1) {
                          data.cover = `${context.picURL}?pic=${data.cover}`;
                        }
                        return (
                          // <a
                          //   className={style.roomWrapper}
                          //   key={data.roomId}
                          //   href={`/live/${data.roomId}`}
                          // >
                          //   <LiveInfo data={data} />
                          // </a>
                          <Link className={style.roomWrapper} key={data.roomId} to={`/live/${data.roomId}`}>
                            <LiveInfo data={data} />
                          </Link>
                        )
                      })
                    }
                  </div>
                </div>
                {/* 加载更多 */}
                {
                  lives.length > 0 && livePage.totalPage > 1 &&
                  <div className={style.loadMore}>
                    <div className={style.loadBtn} onClick={() => {
                      if (livePage.pageNumber <= livePage.totalPage) {
                        setIsLoadMore(true);
                        getLives();
                      }
                    }}>
                      {
                        !isLoadMore ? (livePage.pageNumber <= livePage.totalPage ?
                          "请给我更多！" : "没有更多了") : "加载中..."
                      }
                    </div>
                  </div>
                }
              </section>
            )}
          </Context.Consumer>
          <ScrollToTop />
        </>
      }
    </div>
  );
}

export default List;