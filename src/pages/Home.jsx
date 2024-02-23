import {useEffect, useState} from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {Button, Confirm, Loader} from "semantic-ui-react";
import Navbar from "../components/Navbar.jsx";
import Logo from "../components/Logo.jsx";
import {Socket} from "socket.io-client";
import {scryRenderedComponentsWithType} from "react-dom/test-utils";


const Home = ({socket=Socket}) => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [loading,setLoading] = useState(false);
  const [inRoom,setInRoom] = useState({content:"",open:false});
  const [roomName,setRoomName] = useState("");
    useEffect(() => {
        localStorage.setItem("allowed",false);
        // localStorage.removeItem("admin");
        // localStorage.removeItem("roomId");
        setLoading(true);
        handleSocket();
    }, [socket]);

    function handleSocket(){
        socket.removeAllListeners();
        socket.emit("checkUser",{"uuid":uuidv4(),userName:localStorage.getItem("userName")});


        socket.on("roomNameRes",(data)=>{
            // eslint-disable-next-line no-prototype-builtins
            if(data.hasOwnProperty("roomName")){
                setRoomName(data.roomName);
            }
        });
        socket.on("err",(data)=>{
            setLoading(false);
            toast.error(data.msg);
        })
        socket.on("checkRes",(data)=>{
            setLoading(false);
            if(data["roomData"] !== null){
                setInRoom({content:`You are already in a Room ${data["roomData"].roomId} do you want to leave`,open:true});
            }
        });
        socket.on("joinRes",(data)=>{
            setLoading(false);
            // eslint-disable-next-line no-prototype-builtins
            if(data.hasOwnProperty("newR")){
                localStorage.setItem("allowed",true);
                // localStorage.setItem("admin",true);
                navigate(`/editor/${data.roomId}`,{
                    state:{admin:true}
                });
            }else{
                if(data["roomId"] === localStorage.getItem("roomId") && data["userName"] === localStorage.getItem("userName")) {
                    if (data["allowed"]) {
                        if (data.userName === localStorage.getItem("userName")) {
                            localStorage.setItem("allowed",true);
                            // localStorage.setItem("admin",false);
                            navigate(`/editor/${data.roomId}`, {
                                state: {admin:false}
                            });
                        }
                    } else {
                        toast.message("Access Denied");
                    }
                }
            }
        });
    }
    const createNewRoom = (e) => {
        e.preventDefault();
        // eslint-disable-next-line no-prototype-builtins
        if(!localStorage.hasOwnProperty("userName")){
            navigate("/login");
            return;
        }
        if(roomName.length === 0){
            toast.error("Please Provide a room Name");
            return;
        }
        const newId = uuidv4();
        setRoomId(newId);
        localStorage.setItem("roomId",newId);
        setLoading(true);
        socket.emit("connectRoom",{roomId:newId,type:"new",roomName:roomName,userName:localStorage.getItem("userName")})
    };
  const joinRoom = () => {
      // eslint-disable-next-line no-prototype-builtins
      if(!localStorage.hasOwnProperty("userName")){
          navigate("/login");
          return;
      }
      if (!roomId) {
        toast.error("Room Id is required");
        return;
      }
      setLoading(true);
      socket.emit("connectRoom",{roomId:roomId,type:"req",userName:localStorage.getItem("userName")})
  };
  const handleEnterKey = (e) => {
    if (e.code === "Enter") joinRoom();
  };
  function handleConfirm(){
      console.log("CONFIRM CALLED");
      setInRoom({content:"",open:false});
      socket.emit("leaveRoom",{roomId:localStorage.getItem("roomId"),userName:localStorage.getItem("userName")});
  }
  function handleCancel(){
      setInRoom({content:"",open: false});
      navigate(`/editor/${localStorage.getItem("roomId")}`,{state:{admin:false}});
  }
  return (
      <>
          <Navbar/>
          <Loader active={loading} size={"large"}/>
          <Confirm content={inRoom.content} open={inRoom.open} onConfirm={handleConfirm} onCancel={handleCancel}/>
          <div className="homePageWrapper">
              <Logo />
              <div className="formWrapper">
                  <h4 className="mainLabel">Paste Invitation ROOM ID</h4>
                  <div className="inputGroup">
                      <input
                          type="text"
                          className="inputBox username"
                          placeholder="ROOM NAME"
                          value={roomName}
                          onChange={(e)=>{
                                setRoomName(e.target.value)
                          }}
                      />
                      <input
                          type="text"
                          disabled={loading}
                          className="inputBox roomId"
                          placeholder="ROOM ID"
                          onChange={(e) => {
                              localStorage.setItem("roomId",e.target.value);
                              socket.emit("getRoomName",{roomId:e.target.value})
                              setRoomId(e.target.value);
                          }}
                          value={roomId}
                          onKeyUp={handleEnterKey}
                      />

                      <Button disabled={loading} inverted type="submit" className="btn joinBtn" onClick={joinRoom}>
                          JOIN
                      </Button>
                      <span className="createInfo" hidden={loading}>
                  Don&apos;t have an invite? &nbsp;
                              <a  href="" className="createNewBtn" onClick={createNewRoom}>
                    Create room
                            </a>
                        </span>
                  </div>
              </div>
          </div>
      </>
  )
};

export default Home;
