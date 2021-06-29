import * as React from "react";

import { editFav, createFav } from "@api/me";

import HeaderWithTools from "@components/header-with-tools/HeaderWithTools"
import SlideBtn from "@components/slide-btn/SlideBtn";
import style from "./edit.styl?css-modules";

interface EditProps {
  editType: number;
  handleBack: Function;
  privacy: number;
  media_id?: number;
  title?: string;
  intro?: string;
}

const { useState, useRef } = React;

function Edit(props: EditProps) {
  const { editType, handleBack, media_id, title, intro, privacy } = props;

  const [isOpen, setIsOpen] = useState(privacy === 0 ? true : false);
  const titleRef: React.MutableRefObject<HTMLInputElement> = useRef(null)
  const introRef: React.MutableRefObject<HTMLTextAreaElement> = useRef(null)
  const type = editType === 0 ? "编辑信息" : "创建";

  const handleFinish = () => {
    const titleChanged = titleRef.current.value;
    const introChanged = introRef.current.value;
    const privacyStatus = isOpen ? 0 : 1;
    if (editType === 0) {
      editFav(media_id, titleChanged, introChanged, privacyStatus).then(() => handleBack());
    } else {
      createFav(titleChanged, introChanged, privacyStatus).then(() => handleBack());
    }

  };

  return (
    <div className={style.edit}>
      <HeaderWithTools title={type} mode={4} customBtn={"完成"}
        handleCustomClick={handleFinish} customHandleBack={handleBack} />
      <div className={style.content}>
        <div className={style.title}>
          <label className={style.word}>名称</label>
          <input className={style.input} type="text" maxLength={20} placeholder="名称"
            required defaultValue={title} ref={titleRef}
          />
        </div>
        <div className={style.intro} >
          <label className={style.word}>简介</label>
          <textarea className={style.input} maxLength={200} placeholder="可填写简介"
            defaultValue={intro} ref={introRef}
          />
        </div>
        <div className={style.open}>
          <label className={style.word}>公开</label>
          <span className={style.btn}>
            <SlideBtn model={"model-1"} isChecked={privacy === 0} setIsChecked={setIsOpen} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default Edit;
