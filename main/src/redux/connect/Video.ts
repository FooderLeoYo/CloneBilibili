import { connect } from "react-redux";
import Video from "../../views/video/VideoPage";

const mapStateToProps = state => ({
  video: state.video,
  shouldLoad: state.shouldLoad
});

export default connect(mapStateToProps)(Video);
