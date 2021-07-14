import * as React from "react";

import style from "./batch-action-bottom.styl?css-modules";

const { useRef, useEffect } = React;

interface BatchActionBottomProps {
  setShowBatchActionBottom: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditInfo?: Function;
  handleMulManage?: Function;
  handleCleanInvalid?: Function;
  handleDelete?: Function;
}

function BatchActionBottom(props: BatchActionBottomProps) {
  const { setShowBatchActionBottom, handleEditInfo, handleMulManage, handleCleanInvalid,
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
        {handleMulManage &&
          <div className={style.manipulation} onClick={() => handleMulManage()}>
            <span className={style.icon}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-mutipleManage"></use>
              </svg>
            </span>
            <span className={style.word}>批量管理</span>
          </div>
        }
        {handleCleanInvalid &&
          <div className={style.manipulation}
            onClick={() => {
              handleCleanInvalid();
              setShowBatchActionBottom(false);
            }}
          >
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
        <div className={style.cancel} onClick={() => setShowBatchActionBottom(false)}>取消</div>
      </div>
    </>
  )
}

export default BatchActionBottom;
