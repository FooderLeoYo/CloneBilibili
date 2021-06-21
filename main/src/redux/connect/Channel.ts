import { connect } from "react-redux";
import Channel from "../../views/channel/Channel";

const mapStateToProps = state => ({
  lvOneTabs: state.lvOneTabs,
  shouldLoad: state.shouldLoad
});

export default connect(mapStateToProps)(Channel);
