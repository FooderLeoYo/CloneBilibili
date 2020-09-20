import * as React from "react";
import { History } from "history";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import Context from "../../../context";
import getLiveData from "../../../redux/async-action-creators/live/index";
import { setShouldLoad } from "../../../redux/action-creators";

import { PartitionType, Live, LiveSecQueryParType } from "../../../class-object-creators";

import LoadingCutscene from "../../../components/loading-cutscene/LoadingCutscene";
import Nav from "../child-components/Nav"
import LiveInfo from "../child-components/LiveInfo";

import "swiper/dist/css/swiper.css";
import style from "./index.styl?css-modules";

interface IndexProps {
  shouldLoad: boolean;
  dispatch: (action: any) => Promise<void>;
  liveData: {
    bannerList: Array<{ id: number, title: string, pic: string, link: string }>,
    itemList: Array<{
      title: string,
      parentAreaId: number,
      parentAreaName: string,
      areaId: number,
      areaName: string,
      list: Array<Live>
    }>,
  },
  history: History,
  oneLevelPartitions: PartitionType[],
}

const { useEffect, useState } = React;

function Index(props: IndexProps) {
  /* 以下为初始化 */
  const [isDataOk, setIsDataOk] = useState(false);
  const { shouldLoad, dispatch } = props;
  // 轮播图和直播类型数据
  const { bannerList, itemList } = props.liveData;
  // 导航栏数据
  // 一级导航栏数据
  const { oneLevelPartitions } = props;
  const firstTabBarData = [{ id: 0, name: "首页" } as PartitionType].concat(oneLevelPartitions);
  firstTabBarData.push(new PartitionType(-1, "直播"));
  // 二级导航栏数据
  // 这里用map而不用forEach是因为forEach没有返回值而是直接修改原数组
  const twoLevelPartitions = itemList.map((item, i) =>
    new PartitionType(i + 1, item.title)
  );
  const secondTabBarData = [{ id: 0, name: "直播首页" } as PartitionType].concat(twoLevelPartitions);
  secondTabBarData.push(new PartitionType(9, "所有直播"));
  const secondQueryPar = itemList.map(item =>
    new LiveSecQueryParType(item.parentAreaId, item.parentAreaName, item.areaId, item.areaName)
  );

  useEffect(() => {
    const Swiper = require("swiper");
    new Swiper(".swiper-container", {
      loop: true,
      autoplay: 3000,
      autoplayDisableOnInteraction: false,
      pagination: ".swiper-pagination"
    });

    // 如果页面是通过路由跳转的，shouldLoad为true，则调用getLives获取直播列表数据
    // 如果页面是通过传统跳转的，shouldLoad为false
    // 此时有服务端的预取数据，页面使用预取数据即可而无需调用getLives
    // 但是预取数据仅仅是当前页面，因此要setShouldLoad(true)
    // 因为路由跳转切换下一个页面时，下一个页面将没有对应的预取数据，需要自己获取
    if (shouldLoad) {
      dispatch(getLiveData()).then(() => { setIsDataOk(true); });
    } else {
      setIsDataOk(true);
      dispatch(setShouldLoad(true));
    }
  }, []);  // 传入空数组，组件第一次挂载后调用，组件更新不回调

  /* 以下为渲染部分 */
  return (
    <div className="live-index">
      <Helmet>
        <title>哔哩哔哩直播</title>
      </Helmet>
      {
        !isDataOk ? <LoadingCutscene /> :
          <div>
            <Nav
              history={props.history}
              firstTabBarData={firstTabBarData}
              secondTabBarData={secondTabBarData}
              lvTwoTabIndex={0}
              secondQueryPar={secondQueryPar}
            />
            <Context.Consumer>
              {
                context => (
                  // 这里用section是为了语义化，因为其内有标题（h1~6）
                  <section className={style.main}>
                    {/* 轮播图 */}
                    <div className={style.banner}>
                      {
                        bannerList.length > 0 ? (
                          <div className="swiper-container">
                            <div className="swiper-wrapper">
                              {
                                bannerList.map(banner => (
                                  <div className="swiper-slide" key={banner.id}>
                                    <a href={banner.link}>
                                      <img
                                        src={`${context.picURL}?pic=${banner.pic}`}
                                        width="100%"
                                        height="100%"
                                      />
                                    </a>
                                  </div>
                                ))
                              }
                            </div>
                            <div className="swiper-pagination clear" />
                          </div>
                        ) : null
                      }
                    </div>
                    {
                      itemList.map((item, i) => (
                        <div className={style.roomContainer} key={i}>
                          {/* 分区标题及进去看看 */}
                          <h4 className={style.title}>
                            {item.areaName ? item.areaName : item.parentAreaName}
                            <span className={style.more} onClick={() => {
                              // window.location.href = `/live/list` +
                              //   `?parent_area_id=${item.parentAreaId}` +
                              //   `&parent_area_name=${item.parentAreaName}` +
                              //   `&area_id=${item.areaId}` +
                              //   `&area_name=${item.areaName}`;
                              props.history.push({
                                pathname: "/live/list",
                                search: `?parent_area_id=${item.parentAreaId}` +
                                  `&parent_area_name=${item.parentAreaName}` +
                                  `&area_id=${item.areaId}` +
                                  `&area_name=${item.areaName}`
                              });
                            }}>进去看看</span>
                          </h4>
                          {/* 分区下的4个直播间 */}
                          <div className={style.rooms}>
                            {
                              item.list.map(data => {
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
                                  <Link
                                    className={style.roomWrapper}
                                    key={data.roomId}
                                    to={`/live/${data.roomId}`}
                                  >
                                    <LiveInfo data={data} />
                                  </Link>
                                )
                              })
                            }
                          </div>
                        </div>
                      ))
                    }
                  </section>
                )}
            </Context.Consumer>
          </div>
      }
    </div>
  );
}

export default Index;