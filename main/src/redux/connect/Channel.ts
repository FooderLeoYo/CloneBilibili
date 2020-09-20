import { connect } from "react-redux";
import Channel from "../../views/channel/Channel";

const mapStateToProps = state => ({
  partitions: state.partitions,
  shouldLoad: state.shouldLoad
});

export default connect(mapStateToProps)(Channel);
