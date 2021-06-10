import * as React from "react";
import { Helmet } from "react-helmet";
import { match, Link } from "react-router-dom";
import { History } from "history";

import { fetchFavListCreated } from "../../../../../api/space";

import Header from "../../child-components/header/Header"
import TabBar from "../../child-components/tab-bar/TabBar";
import ScrollToTop from "../../../../../components/scroll-to-top/ScrollToTop";

import style from "./favorites.styl?css-modules";
import tips from "../../../../../assets/images/nocontent.png";

interface FavoritesProps {
  match: match<{ uid }>;
  history: History;
}

const { useEffect } = React;

function Favorites(props: FavoritesProps) {
  const { match } = props;

  useEffect(() => {
    fetchFavListCreated(match.params.uid).then(result => {
      console.log(result)
    })
  }, []);

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
