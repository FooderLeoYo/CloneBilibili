import * as React from "react";
import { History } from "history";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import Context from "@context/index";
import getLiveData from "@redux/async-action-creators/live/index";
import { setShouldLoad } from "@redux/action-creators";

import { PartitionType, Live, LiveSecQueryParType } from "@class-object-creators/index";

import LoadingCutscene from "@components/loading-cutscene/LoadingCutscene";
import Nav from "../child-components/nav/Nav"
import LiveInfo from "../child-components/liveinfo/LiveInfo";

import "swiper/dist/css/swiper.css";
import style from "./index.styl?css-modules";

interface IndexProps {
  shouldLoad: boolean;
  dispatch: (action: any) => Promise<void>;
  liveBanners: Array<{ id: number, title: string, pic: string, link: string }>,
  lvOneTabs: PartitionType[],
  liveLvTwoTabs: PartitionType[],
  liveLvTwoQueries: LiveSecQueryParType[],
  partitionRecList: Array<Array<Live>>,
  history: History
}

const { useState, useEffect } = React;

function Index(props: IndexProps) {
  const { shouldLoad, dispatch, history, liveBanners, liveLvTwoTabs, liveLvTwoQueries,
    lvOneTabs, partitionRecList } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // 如果页面是通过路由跳转的，shouldLoad为true，则调用getLives获取直播列表数据
    // 如果页面是通过传统跳转的，shouldLoad为false
    // 此时有服务端的预取数据，页面使用预取数据即可而无需调用getLives
    // 但是预取数据仅仅是当前页面，因此要setShouldLoad(true)
    // 因为路由跳转切换下一个页面时，下一个页面将没有对应的预取数据，需要自己获取
    if (shouldLoad) { dispatch(getLiveData()) }
    else { dispatch(setShouldLoad(true)) }

    const Swiper = require("swiper");
    new Swiper(".swiper-container", {
      loop: true,
      autoplay: 3000,
      autoplayDisableOnInteraction: false,
      pagination: ".swiper-pagination"
    });
  }, []);

  return (
    <>
      {!shouldLoad && !isMounted ? <LoadingCutscene /> :
        <>
          <Helmet><title>哔哩哔哩直播</title></Helmet>
          <Nav history={history} firstTabBarData={lvOneTabs}
            lvTwoTabBarData={liveLvTwoTabs} secondQueryPar={liveLvTwoQueries}
          />
          <Context.Consumer>
            {context => (
              <section className={style.main}>
                {/* 轮播图 */}
                <div className={style.banner}>
                  {liveBanners &&
                    <div className="swiper-container">
                      <div className="swiper-wrapper">
                        {liveBanners.map(banner => (
                          <div className="swiper-slide" key={banner.id}>
                            <a href={banner.link}>
                              <img src={`${context.picURL}?pic=${banner.pic}`} width="100%" height="100%" />
                            </a>
                          </div>
                        ))}
                      </div>
                      <div className="swiper-pagination clear" />
                    </div>
                  }
                </div>
                {liveLvTwoQueries?.map((item, i) => {
                  return (
                    <div className={style.roomContainer} key={i}>
                      {/* 分区标题及进去看看 */}
                      <h4 className={style.title}>
                        {item.area_name ? item.area_name : item.parent_area_name}
                        <span className={style.more} onClick={() => {
                          location.href = `/live/list` +
                            `?parent_area_id=${item.parent_area_id}` +
                            `&parent_area_name=${item.parent_area_name}` +
                            `&area_id=${item.area_id}` +
                            `&area_name=${item.area_name}`;
                          // props.history.push({
                          //   pathname: "/live/list",
                          //   search: `?parent_area_id=${item.parentAreaId}` +
                          //     `&parent_area_name=${item.parentAreaName}` +
                          //     `&area_id=${item.areaId}` +
                          //     `&area_name=${item.areaName}`
                          // });
                        }}>进去看看
                          <svg className="icon" aria-hidden="true">
                            <use href="#icon-more"></use>
                          </svg>
                        </span>
                      </h4>
                      {/* 分区下的4个直播间 */}
                      <div className={style.rooms}>
                        {partitionRecList[i]?.map(data => {
                          if (data.cover.indexOf(context.picURL) === -1) {
                            data.cover = `${context.picURL}?pic=${data.cover}`;
                          }
                          return (
                            <Link className={style.roomWrapper} key={data.roomId} to={`/live/${data.roomId}`}>
                              <LiveInfo data={data} />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
                }
              </section>
            )}
          </Context.Consumer>
        </>
      }
    </>
  );
}

export default Index;