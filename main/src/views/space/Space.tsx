import * as React from "react";
import { Helmet } from "react-helmet";

import { setShouldLoad } from "@redux/action-creators";
import getUser from "@redux/async-action-creators/space";

import LogoHeaderWithBack from "@root/src/components/logo-header-with-back/LogoHeaderWithBack";

import banner from "@assets/images/banner-top.png";
import style from "./space.styl?css-modules";

const { useEffect } = React;

function Space(props) {
  //  若自我介绍太长则显示展开个人简介箭头
  // function initToggle() {
  //   const arrowDOM = arrowRef.current;
  //   const introduceDOM = introduceRef.current;
  //   const contentDOM = contentRef.current;

  //   if (contentDOM.offsetHeight <= introduceDOM.offsetHeight) {
  //     arrowDOM.style.visibility = "hidden";
  //   } else { arrowDOM.style.visibility = "visible"; }
  // }

  useEffect(() => {
    // initToggle();

    if (props.shouldLoad) {
      // 这里也可以将getUser添加到本组件中，就像getUserVideos
      // 然后调用组件自己的方法获取数据，而不是先存到redux，再从redux中取

      // 不这么做的原因是up信息只需要获取一次，而getUserVideos由于有加载更多需要多次调用
      // 而且需要通过state.videos.length，设置加载中，以避免数据未加载报错
      // 所以getUserVideos是肯定要添加到组件自身的
      // 这同时也是upUser从props中取，而videos从state中取的原因

      // getUser出于代码冗余的考虑则没有添加到组件
      // 虽然从性能上说应该比多倒一次redux要好，但是代码多则bundle大
      // 评估后认为bundle下载时间造成的影响 > 多一步redux造成的性能影响
      props.dispatch(getUser(props.match.params.mId))
        .then(result => {
          console.log(props)
        });
    } else {
      props.dispatch(setShouldLoad(true))
    }
  }, []);

  // useEffect(() => {
  //   initToggle()
  // })

  return (
    <div className="space">
      {/* {upUser && <Helmet><title>{upUser.name + "的个人空间"}</title></Helmet>} */}
      <div className={style.header}><LogoHeaderWithBack /></div>
      <div className={style.banner}><img src={banner} /></div>
    </div>
  )

}

export default Space;
