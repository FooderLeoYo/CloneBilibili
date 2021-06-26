import * as React from "react";

import Header from "./child-components/header/Header"
import Bottom from "./child-components/bottom/Bottom";
import style from "./header-with-tools.styl?css-modules";

interface HeaderWithToolsProps {
  mode: number; // heder最右边显示：0：无；1：省略号；2：编辑；3：加号；4：自定义
  title?: string;
  // 搜索相关
  setKeyword?: (keyword: string) => any;
  searching?: boolean;
  setSerching?: React.Dispatch<React.SetStateAction<boolean>>;
  // 省略号模式相关
  handleEditInfo?: Function;
  handleMultiple?: Function;
  handleCleanInvalid?: Function;
  handleDelete?: Function;
  // 编辑模式相关
  handleEdit?: Function;
  editting?: boolean;
  // 加号相关
  handleAdd?: Function;
  // 自定义相关
  customBtn?: any;
  handleCustomClick?: Function;
}

const { useState, useRef, useEffect } = React;

function HeaderWithTools(props: HeaderWithToolsProps) {
  const { mode, title, setKeyword, handleEdit, editting, handleEditInfo,
    handleMultiple, handleCleanInvalid, handleDelete, searching,
    setSerching, handleAdd, customBtn, handleCustomClick } = props;

  const [showBottom, setShowBottom] = useState(false);
  const bottomRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const bottomDOM = bottomRef.current;
  useEffect(() => {
    if (bottomDOM) {
      const bottomClass = bottomDOM.classList;
      if (showBottom) { bottomClass.add(style.show) }
      else { bottomClass.remove(style.show) }
    }
  }, [showBottom]);

  return (
    <div className={style.headerWithTools}>
      <Header mode={mode} title={title} handleEdit={handleEdit} searching={searching}
        setSerching={setSerching} editting={editting} setShowBottom={setShowBottom}
        setKeyword={setKeyword} handleAdd={handleAdd} customBtn={customBtn}
        handleCustomClick={handleCustomClick}
      />
      {mode === 1 &&
        <div className={style.bottom} ref={bottomRef}>
          <Bottom setShowBottom={setShowBottom}
            handleEditInfo={handleEditInfo} handleMultiple={handleMultiple}
            handleCleanInvalid={handleCleanInvalid} handleDelete={handleDelete}
          />
        </div>
      }
    </div>
  )
}

export default HeaderWithTools;
