import * as React from "react";

import style from "./bottom.styl?css-modules";

const { useRef, useEffect } = React;

interface BottomProps {
  setShowBottom: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditInfo?: Function;
  handleMultiple?: Function;
  handleCleanInvalid?: Function;
  handleDelete?: Function;
}

function Bottom(props: BottomProps) {
  const { setShowBottom, handleEditInfo, handleMultiple, handleCleanInvalid,
    handleDelete } = props;
  const overlayRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    const overlayDOM = overlayRef.current;
    overlayDOM.addEventListener("touchmove", e => e.preventDefault());
  }, []);

  return (
    <>
      <div className={style.overlay} ref={overlayRef} />
      <div className={style.manipulations}>
        {handleEditInfo &&
          <div className={style.manipulation} onClick={() => handleEditInfo()}>
            <span className={style.icon}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-editInfo"></use>
              </svg>
            </span>
            <span className={style.word}>编辑信息</span>
          </div>
        }
        {handleMultiple &&
          <div className={style.manipulation} onClick={() => handleMultiple()}>
            <span className={style.icon}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-mutipleOperation"></use>
              </svg>
            </span>
            <span className={style.word}>批量管理</span>
          </div>
        }
        {handleCleanInvalid &&
          <div className={style.manipulation} onClick={() => handleCleanInvalid()}>
            <span className={style.icon}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-cleanInvalid"></use>
              </svg>
            </span>
            <span className={style.word}>一键清除失效内容</span>
          </div>
        }
        {handleDelete &&
          <div className={style.manipulation} onClick={() => handleDelete()}>
            <span className={style.icon}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-delete"></use>
              </svg>
            </span>
            <span className={style.word}>删除</span>
          </div>
        }
        <div className={style.cancel} onClick={() => setShowBottom(false)}>取消</div>
      </div>
    </>
  )
}

export default Bottom;
