import * as React from "react";

import Header from "./child-components/header/Header"
import BatchActionBottom from "./child-components/batch-action-bottom/BatchActionBottom";
import BatchDelItem from "./child-components/batch-del/batch-del-item/BatchDelItem";
import BatchDelBottom from "./child-components/batch-del/batch-del-bottom/BatchDelBottom";
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
  handleMulManage?: Function;
  handleCleanInvalid?: Function;
  handleDelete?: Function;
  // 批量删除模式相关
  batchDelList?: Array<any>;
  setBatchDelList?: (list) => void;
  switchMulDel?: Function;
  mulDeleting?: boolean;
  selectedStatus?: number;
  setAllSelectedStatus?: (status) => void;
  handleMulDel?: Function;
  // 加号相关
  handleAdd?: Function;
  // 自定义相关
  customBtn?: any;
  handleCustomClick?: Function;
  customHandleBack?: Function;
}

const { useState, useRef, useEffect, forwardRef, useImperativeHandle } = React;

function HeaderWithTools(props: HeaderWithToolsProps, ref) {
  const { mode, title, setKeyword, switchMulDel, mulDeleting, handleEditInfo,
    handleMulManage, handleCleanInvalid, handleDelete, searching, customHandleBack,
    setSerching, handleAdd, customBtn, handleCustomClick, setBatchDelList,
    handleMulDel, batchDelList } = props;

  const [showBatchActionBottom, setShowBatchActionBottom] = useState(false);
  const bottomRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const [selectedStatus, setSelectedStatus] = useState(0); // 0为全不选，1为全选，2为选部分


  const delListRef = useRef(null);
  useEffect(() => { delListRef.current = batchDelList }, [batchDelList]);
  function setAllSelectedStatus(status: number) { // status同state.selectedStatus
    delListRef.current.forEach(record => { record.selected = status === 0 ? false : true });
    console.log(delListRef.current)
    setBatchDelList(delListRef.current);
    setSelectedStatus(status);
  }

  function checkAllSelectedStatus() {  // type：0为video，1为live
    let allSelected = true;
    let allCancled = true;
    delListRef.current.forEach(record => {
      if (record.selected) { allCancled = false }
      else { allSelected = false }
    })

    if (allCancled) { setAllSelectedStatus(0) }
    else if (allSelected) { setAllSelectedStatus(1) }
    else { setSelectedStatus(2); }
  }

  useImperativeHandle(ref, () => ({
    checkAllSelectedStatus: checkAllSelectedStatus
  }), []);

  const bottomDOM = bottomRef.current;
  useEffect(() => {
    if (bottomDOM) {
      const bottomClass = bottomDOM.classList;
      if (showBatchActionBottom) { bottomClass.add(style.show) }
      else { bottomClass.remove(style.show) }
    }
  }, [showBatchActionBottom]);

  return (
    <div className={style.headerWithTools}>
      <Header mode={mode} title={title} searching={searching} switchMulDel={switchMulDel}
        setSerching={setSerching} mulDeleting={mulDeleting} setShowBatchActionBottom={setShowBatchActionBottom}
        setKeyword={setKeyword} handleAdd={handleAdd} customBtn={customBtn}
        handleCustomClick={handleCustomClick} customHandleBack={customHandleBack}
      />
      {mode === 1 &&
        <div className={style.batchActionBottom} ref={bottomRef}>
          <BatchActionBottom setShowBatchActionBottom={setShowBatchActionBottom}
            handleEditInfo={handleEditInfo} handleMulManage={handleMulManage}
            handleCleanInvalid={handleCleanInvalid} handleDelete={handleDelete}
          />
        </div>
      }
      {mulDeleting && <div className={style.bottomWrapper}>
        <BatchDelBottom selectedStatus={selectedStatus} handleMulDel={handleMulDel}
          setAllSelectedStatus={setAllSelectedStatus}
        />
      </div>
      }
    </div>
  )
}

export default forwardRef(HeaderWithTools);
export { BatchDelItem };