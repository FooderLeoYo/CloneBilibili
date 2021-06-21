import { connect } from "react-redux";
import Index from "../../views/index/Index";

const mapStateToProps = state => ({
  lvOneTabs: state.lvOneTabs,
  indexBanners: state.banners,
  additionalVideos: state.additionalVideos,
  rankingVideos: state.rankingVideos,
  shouldLoad: state.shouldLoad
});

export default connect(mapStateToProps)(Index);
