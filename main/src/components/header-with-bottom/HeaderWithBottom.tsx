import * as React from "react";

import Header from "./header/Header"
import Bottom from "./bottom/Bottom";
import style from "./header-with-bottom.styl?css-modules";

interface HeaderWithBottomProps {
  mode: number; // heder最右边显示：0：无；1：省略号；2：编辑；3：加号；4：自定义
  title?: string;
  handleEdit?: Function;
  editting?: boolean;
  handleEditInfo?: Function;
  handleMultiple?: Function;
  handleCleanInvalid?: Function;
  handleDelete?: Function;
}

const { useState, useRef, useEffect } = React;

function HeaderWithBottom(props: HeaderWithBottomProps) {
  const { mode, title, handleEdit, editting, handleEditInfo,
    handleMultiple, handleCleanInvalid, handleDelete } = props;
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
    <div className={style.headerWithBottom}>
      <div className={style.header}>
        <Header mode={mode} title={title} handleEdit={handleEdit}
          editting={editting} setShowBottom={setShowBottom} />
      </div>
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

export default HeaderWithBottom;
