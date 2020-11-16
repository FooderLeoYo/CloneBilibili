import * as React from "react";
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet";
import { match } from "react-router-dom";

import getRoomData from "../../../redux/async-action-creators/live/room";
import { setShouldLoad } from "../../../redux/action-creators";
import { getUserInfo } from "../../../api/up-user";
import { getDanMuConfig } from "../../../api/live";

import Context from "../../../context";
import { Live, UpUser } from "../../../class-object-creators";
import { formatTenThousand } from "../../../customed-methods/string";

import LoadingCutscene from "../../../components/loading-cutscene/LoadingCutscene";
import HeaderWithBack from "../../../components/header-with-back/HederWithBack";
import VideoPlayer from "../../../components/player/Player";
import BottomArea, { sendMsg } from "./BottomArea";
import ChatWebSocket, { Events } from "./ChatWS";

import style from "./stylus/room.styl?css-modules";

interface RoomProps {
  shouldLoad: boolean,
  dispatch: (action: any) => Promise<void>;
  match: match<{ roomId }>,
  roomData: {
    parentAreaId: number,
    parentAreaName: string,
    areaId: number,
    areaName: string,
    uId: number,
    description: string,
    liveTime: string,
    live: Live;
  }
}

const {
  useState,
  useEffect,
  useRef
} = React;

function Room(props: RoomProps) {
  const { shouldLoad, dispatch, roomData } = props;
  const { live } = roomData;

  const [preRoomData, setPreRoomData] = useState(roomData);
  const [isDataOk, setIsDataOk] = useState(false);
  const [anchor, setAnchor] = useState(new UpUser(0, "", ""));
  // 这里将setDanmu中new的chatWebSocket又赋给一个state变量wsForClose，
  // 而不是let声明一个变量，再在new chatWebSocket的时候将其赋给这个变量是因为:
  // let声明一个变量的话，无法在useEffect中检测到这个变量变化，
  // 就无法在new后拿到ChatWebSocket实例，在组件卸载时执行.close()就会报错未定义
  const [wsForClose, setWsForClose] = useState<ChatWebSocket>();

  const onlineNumRef: React.Ref<HTMLSpanElement> = useRef(null);
  const videoPlayerRef: React.Ref<VideoPlayer> = useRef(null);

  // 获取up主数据，然后保存到state中
  const setUpInfo = () => {
    getUserInfo(roomData.uId).then(result => {
      if (result.code === "1") {
        const data = result.data;
        const upUser = new UpUser(
          data.mid,
          data.name,
          data.face,
          data.level,
          data.sex,
          data.sign,
          data.status.following,
          data.status.follower
        );
        setAnchor(upUser);
      }
    });
  }

  // 获取直播间host url；
  // 指定收到的响应为HEARTBEAT_REPLY和MESSAGE_RECEIVE时的callback
  // callback被调用后更新人气值或聊天内容
  const setDanmu = () => {
    getDanMuConfig(roomData.live.roomId).then(result => {
      if (result.code === "1") {
        const url = `wss://${result.data.host}/sub`;
        // 这里不直接setWsForClose(new ChatWebSocket())是因为：
        // setWsForClose不是同步的，那么下面的两个.on就会报错未定义
        const chatWebSocket = new ChatWebSocket(url, roomData.live.roomId);
        setWsForClose(chatWebSocket);

        // HEARTBEAT_REPLY的res.body就是res发送时的人气数据
        chatWebSocket.on(Events.HEARTBEAT_REPLY, ({ onlineNum }) => {
          onlineNumRef.current.innerHTML = `人气：${formatTenThousand(onlineNum)}`;
        });

        // 将聊天数据展示到底部和player弹幕中
        chatWebSocket.on(Events.MESSAGE_RECEIVE, data => {
          data.forEach(item => {
            // 底部互动发送弹幕
            sendMsg(item);

            // 播放器中发送弹幕
            if (item.cmd === "DANMU_MSG") {
              const barragData = {
                color: "#" + Number(item.info[0][3]).toString(16),
                content: item.info[1]
              };
              videoPlayerRef.current.sendBarrage(barragData);
            }
          });
        });
      }
    });
  }

  const setInitData = () => {
    setDanmu();
    setUpInfo();
    setIsDataOk(true);
  }

  useEffect(() => {
    if (shouldLoad) {
      // 这个数据非常慢，dispatch后props中仍然没有roomData
      // 到了下面的仿getDerivedStateFromProps时才有数据
      // 因此setInitData放到那里执行
      dispatch(getRoomData(props.match.params.roomId));
    } else {
      setInitData();
      dispatch(setShouldLoad(true));
    }
  }, []);

  // 这里相当于只关注wsForClose的componentWillUnmount
  useEffect(() => {
    if (wsForClose) {
      // 不能把return放到模拟componentDidMount的useEffect中，因为：
      // 不给useEffect第二个参数传[wsForClose]的话，拿到的wsForClose永远是初始的“undefined”
      return () => {
        wsForClose.webSocket.close();
      }
    }
  }, [wsForClose]);

  // 相当于getDerivedStateFromProps
  if (roomData !== preRoomData) {
    setInitData();
    setPreRoomData(roomData);
  }

  return (
    <div className="live-room">
      <Helmet>
        <title>{isDataOk ? roomData.live.title : ""}</title>
      </Helmet>
      {
        !isDataOk ? <LoadingCutscene /> :
          <div className={style.roomWrapper}>
            <header className={style.header}>
              <HeaderWithBack />
            </header>
            <Context.Consumer>
              {
                context => (
                  <section className={style.main}>
                    <div className={style.liveContainer}>
                      <VideoPlayer
                        isLive={true}
                        isStreaming={live.isLive === 1}
                        // getTime()返回liveTime距 1970 年 1 月 1 日之间的毫秒数
                        liveTime={new Date(roomData.liveTime.replace(/-/g, "/")).getTime()}
                        video={{
                          aId: 0,
                          cId: 0,
                          title: live.title,
                          cover: context.picURL + "?pic=" + live.cover,
                          duration: 0,
                          url: live.playUrl
                        }}
                        ref={videoPlayerRef}
                      />
                    </div>
                    {/* up主信息 */}
                    <div className={style.upContainer}>
                      {/* up主头像 */}
                      <div className={style.face}>
                        <Link to={"/space/" + roomData.uId}>
                          {
                            anchor.face ? (
                              <img src={context.picURL + "?pic=" + anchor.face} alt={anchor.name} />
                            ) : null
                          }
                        </Link>
                      </div>
                      {/* up主名字、人气、粉丝数 */}
                      <div className={style.infoWrapper}>
                        <p className={style.anchor}>主播：<span>{anchor.name}</span></p>
                        <p className={style.count}>
                          <span className={style.online} ref={onlineNumRef}>
                            人气：{formatTenThousand(live.onlineNum)}
                          </span>
                          <span className={style.fans}>粉丝：{formatTenThousand(anchor.follower)}</span>
                        </p>
                      </div>
                    </div>
                    {/* 直播间简介 */}
                    <div className={style.tabContainer}>
                      <BottomArea description={roomData.description} />
                    </div>
                  </section>
                )}
            </Context.Consumer>
          </div>
      }
    </div>
  );
}

export default Room;