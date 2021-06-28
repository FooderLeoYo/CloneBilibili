import * as React from "react";

import HeaderWithTools from "@components/header-with-tools/HeaderWithTools"
import SlideBtn from "@components/slide-btn/SlideBtn";
import style from "./edit.styl?css-modules";

interface EditProps {
  editType: number;
  handleBack: Function;
  title?: string;
  intro?: string;
  isChecked?: boolean;
}

function Edit(props: EditProps) {
  const { editType, handleBack, title, intro, isChecked } = props;
  const type = editType === 0 ? "编辑信息" : "创建";

  const handleFinish = () => {
    handleBack();
  };

  return (
    <div className={style.edit}>
      <HeaderWithTools title={type} mode={4} customBtn={"完成"}
        handleCustomClick={handleFinish} customHandleBack={handleBack} />
      <div className={style.content}>
        <div className={style.title}>
          <label className={style.word}>名称</label>
          <input className={style.input} type="text" maxLength={20} placeholder="名称"
            required defaultValue={title}
          />
        </div>
        <div className={style.intro} >
          <label className={style.word}>简介</label>
          <textarea className={style.input} maxLength={200} placeholder="可填写简介"
            defaultValue={intro}
          />
        </div>
        <div className={style.open}>
          <label className={style.word}>公开</label>
          <span className={style.btn}><SlideBtn model={"model-1"} checked={isChecked} /></span>
        </div>
      </div>
    </div>
  )
}

export default Edit;
