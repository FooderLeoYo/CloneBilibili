import { connect } from "react-redux";
import Index from "../../../views/live/index/Index";

const mapStateToProps = state => ({
  oneLevelPartitions: state.oneLevelPartitions,
  liveData: state.liveData,
  shouldLoad: state.shouldLoad
});

export default connect(mapStateToProps)(Index);
