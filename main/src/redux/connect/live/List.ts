import { connect } from "react-redux";
import List from "@views/live/list/List";

const mapStateToProps = state => ({
  shouldLoad: state.shouldLoad,
  liveListData: state.liveListData,
  lvOneTabs: state.lvOneTabs,
  liveLvTwoTabs: state.liveLvTwoTabs,
  liveLvTwoQueries: state.liveLvTwoQueries,
});

export default connect(mapStateToProps)(List);
