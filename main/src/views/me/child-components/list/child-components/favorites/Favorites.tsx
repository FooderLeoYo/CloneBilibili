import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { History } from "history";

import { getPicSuffix } from "../../../../../../customed-methods/image";
import Context from "../../../../../../context";

import { Switcher } from "../../../../../../components/switcher/Switcher";
import ScrollToTop from "../../../../../../components/scroll-to-top/ScrollToTop";

import style from "./favorites.styl?css-modules";
import tips from "../../../../../../assets/images/nocontent.png";

interface FavoritesProps {
  history: History;
}

function Favorites(props: FavoritesProps) {

  return (
    <div className={style.favorites}>
      <Helmet><title>我的收藏</title></Helmet>
      <div className={style.listWrapper}>

      </div>
      <ScrollToTop />
    </div>
  )
}

export default Favorites;
