import * as React from "react";

import Header from "./child-components/header/Header"
import BatchActionBottom from "./child-components/batch-action-bottom/BatchActionBottom";
import BatchDelItem from "./child-components/batch-del/batch-del-item/BatchDelItem";
import BatchDelBottom from "./child-components/batch-del/batch-del-bottom/BatchDelBottom";
import style from "./header-with-tools.styl?css-modules";

interface HeaderWithToolsProps {
  mode: number; // heder最右边显示：0：无；1：省略号；2：批量删除；3：加号；4：自定义
  title?: string;
  // 搜索相关
  searching?: boolean;
  setSearching?: React.Dispatch<React.SetStateAction<boolean>>;
  setSearched?: React.Dispatch<React.SetStateAction<boolean>>;
  dataForSearch?: Array<any>;
  setSearchResult?: React.Dispatch<React.SetStateAction<Array<any>>>;
  searchKey?: string;
  setSearchKey?: React.Dispatch<React.SetStateAction<string>>;
  accessTarKey?: (list: Array<any>, keyAsString: string) => any;
  // 省略号模式相关
  handleEditInfo?: Function;
  handleMulManage?: Function;
  handleCleanInvalid?: Function;
  handleDelete?: Function;
  // 批量删除模式相关
  batchDelList?: Array<any>;
  tempBatDelList?: Array<any>;
  setBatchDelList?: (list) => void;
  mulDeleting?: boolean;
  setMulDeleting?: Function;
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
  const { mode, title, mulDeleting, setMulDeleting, handleEditInfo,
    handleMulManage, handleCleanInvalid, handleDelete, searching, customHandleBack,
    setSearching, setSearched, handleAdd, customBtn, handleCustomClick, setBatchDelList,
    handleMulDel, batchDelList, tempBatDelList, dataForSearch, setSearchResult
    , searchKey, setSearchKey, accessTarKey } = props;

  const [showBatchActionBottom, setShowBatchActionBottom] = useState(false);
  const bottomRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const [bottomSelected, setBottomSelected] = useState(0); // 0为全不选，1为全选，2为选部分
  const batDelListRef = useRef([]);
  useEffect(() => { batDelListRef.current = batchDelList }, [batchDelList]);

  const setAllSelectedStatus = (status: number, initial: boolean = false) => { // 0为全不选，1为全选，2为选部分
    const list = initial ? tempBatDelList : batDelListRef.current;
    list.forEach(record => { record.selected = status === 0 ? false : true });
    setBatchDelList(list);
    setBottomSelected(status);
  }

  const checkAllSelectedStatus = () => {
    let allSelected = true;
    let allCancled = true;

    batDelListRef.current.forEach(record => {
      if (record.selected) { allCancled = false }
      else { allSelected = false }
    })

    if (allCancled) { setAllSelectedStatus(0) }
    else if (allSelected) { setAllSelectedStatus(1) }
    else { setBottomSelected(2); }
  }

  const turnOnBatchDel = () => {
    setMulDeleting(!mulDeleting);
    setBottomSelected(0);
    setAllSelectedStatus(0, true);
  };

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

  useEffect(() => { !mulDeleting && setBottomSelected(0) }, [mulDeleting]);

  return (
    <div className={style.headerWithTools}>
      <Header mode={mode} title={title} searching={searching} turnOnBatchDel={turnOnBatchDel}
        setSearching={setSearching} mulDeleting={mulDeleting} setShowBatchActionBottom={setShowBatchActionBottom}
        handleAdd={handleAdd} customBtn={customBtn} searchKey={searchKey}
        handleCustomClick={handleCustomClick} customHandleBack={customHandleBack}
        setSearched={setSearched} dataForSearch={dataForSearch} setSearchResult={setSearchResult}
        setSearchKey={setSearchKey} accessTarKey={accessTarKey}
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
        <BatchDelBottom bottomSelected={bottomSelected} handleMulDel={handleMulDel}
          setAllSelectedStatus={setAllSelectedStatus}
        />
      </div>
      }
    </div>
  )
}

export default forwardRef(HeaderWithTools);
export { BatchDelItem };