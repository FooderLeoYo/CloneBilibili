import { connect } from "react-redux";
import List from "../../../views/live/list/List";

const mapStateToProps = state => ({
  shouldLoad: state.shouldLoad,
  liveListData: state.liveListData,
  lvOnePartitions: state.oneLevelPartitions,
  liveData: state.liveData
});

export default connect(mapStateToProps)(List);
