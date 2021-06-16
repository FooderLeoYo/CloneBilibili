import { connect } from "react-redux";
import UpUser from "../../views/space/Space";

const mapStateToProps = state => ({
  shouldLoad: state.shouldLoad,
  upUser: state.upUser,
  videos: state.video
});

export default connect(mapStateToProps)(UpUser);
