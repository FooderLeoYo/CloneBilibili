import { connect } from "react-redux";
import Room from "../../../views/live/room/Room";

const mapStateToProps = state => ({
  roomData: state.roomData,
  shouldLoad: state.shouldLoad
});

export default connect(mapStateToProps)(Room);
