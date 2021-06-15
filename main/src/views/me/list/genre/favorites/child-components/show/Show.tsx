import * as React from "react";
import { match } from "react-router-dom";

import { getSeriesFollowed } from "../../../../../../../api/space";

import style from "./show.styl?css-modules";

interface ShowProps {
  match: match<{ uid }>;
  fatherInx: number;
}

const { useState, useEffect } = React;

function Show(props: ShowProps) {
  const { match, fatherInx } = props;

  const [bangumiPage, setBangumiPage] = useState(1);
  const [showPage, setShowPage] = useState(1);

  function getDataByTabInx(index: number) {
    const { uid } = match.params;

    if (index === 0) {
      return;
    } else if (index === 1) {
      // console.log(bangumiPage)
      getSeriesFollowed(uid, 1, bangumiPage).then(result => {
        const { code, data } = result.data;
        // if (code === 0) {

        // }
      });
    } else if (index === 2) {
      // console.log(showPage)
      getSeriesFollowed(uid, 2, showPage).then(result => {
        // console.log(result)
      });
    }
  }

  function handleLoadMore() {
    if (fatherInx === 1) { setBangumiPage(bangumiPage + 1) }
    else { setShowPage(showPage + 1) }
  }

  useEffect(() => { fatherInx === 1 && getDataByTabInx(fatherInx) }, [bangumiPage, fatherInx]); // 为了保证bangumiPage + 1后才执行getDataByTabInx
  useEffect(() => { fatherInx === 2 && getDataByTabInx(fatherInx) }, [showPage, fatherInx]);

  return (
    <>
      <div onClick={() => handleLoadMore()}>加载更多</div>
    </>
  )
}

export default Show;
