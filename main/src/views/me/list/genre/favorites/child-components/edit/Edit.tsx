import * as React from "react";
import { Helmet } from "react-helmet";
import { match } from "react-router-dom";

import HeaderWithTools from "@components/header-with-tools/HeaderWithTools"
import SlideBtn from "@components/slide-btn/SlideBtn";
import style from "./edit.styl?css-modules";

interface EditProps {
  match: match<{ action }>;
}

function Edit(props: EditProps) {
  const { match } = props;
  const editType = match.params.action === "edit" ? "编辑信息" : "创建";

  return (
    <div className={style.edit}>
      <Helmet><title>{editType}</title></Helmet>
      <HeaderWithTools title={editType} mode={4} customBtn={"完成"} />
      <div className={style.content}>
        <div className={style.title}>
          <label className={style.word}>名称</label>
          <input className={style.input} type="text" maxLength={20} placeholder="名称" required />
        </div>
        <div className={style.intro} >
          <label className={style.word}>简介</label>
          <textarea className={style.input} maxLength={200} placeholder="可填写简介" />
        </div>
        <div className={style.open}>
          <label className={style.word}>公开</label>
          <span className={style.btn}><SlideBtn model={"model-1"} checked={true} /></span>
        </div>
      </div>
    </div>
  )
}

export default Edit;
