import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { History } from "history";

import { getHistory, deleteHistory } from "../../../../../../api/me";

import Header from "../../child-components/header/Header"
import TabBar from "../../child-components/tab-bar/TabBar";
import ScrollToTop from "../../../../../../components/scroll-to-top/ScrollToTop";

import style from "./favorites.styl?css-modules";
import tips from "../../../../../assets/images/nocontent.png";

interface FavoritesProps {
  history: History;
}

function Favorites(props: FavoritesProps) {

  return (
    <div className={style.favorites}>
      <Helmet><title>我的收藏</title></Helmet>
      <div className={style.topWrapper}><Header title={"我的收藏"} needEdit={true} /></div>
      <div className={style.listWrapper}>
        收藏列表
      </div>
      <ScrollToTop />
    </div>
  )
}

export default Favorites;
