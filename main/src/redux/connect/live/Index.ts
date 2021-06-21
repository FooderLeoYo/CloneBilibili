import { connect } from "react-redux";
import Index from "@views/live/index/Index";

const mapStateToProps = state => ({
  shouldLoad: state.shouldLoad,
  lvOneTabs: state.lvOneTabs,
  liveLvTwoTabs: state.liveLvTwoTabs,
  liveLvTwoQueries: state.liveLvTwoQueries,
  liveBanners: state.liveBanners,
  partitionRecList: state.partitionRecList
});

export default connect(mapStateToProps)(Index);
