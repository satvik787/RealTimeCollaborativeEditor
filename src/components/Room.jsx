import EditorWindow from "./EditorWindow.jsx";
import {loader} from "@monaco-editor/react";
import {useEffect, useRef, useState} from "react";
import { toast } from "sonner";
import axios from 'axios';
import nightOwl from "monaco-themes/themes/Night Owl.json";
import monokai from "monaco-themes/themes/Monokai.json";
import twilight from "monaco-themes/themes/Twilight.json";
import github from "monaco-themes/themes/GitHub.json";
import {RemoteCursorManager} from "@convergencelabs/monaco-collab-ext"
import {
    Button, Dropdown,
    Grid,
    GridColumn, GridRow,
    Header, HeaderContent, Icon,
    Segment,
    TransitionGroup
} from "semantic-ui-react";
import UsersList from "./UsersList.jsx";
import NavbarEditor from "./NavbarEditor.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import RequestCard from "./RequestCard.jsx";
import {Socket} from "socket.io-client";
import {httpRequest} from "../api.js";
import Streams from "./Streams.jsx";
import VideoStream from "../videoStream.js";
const SUBMISSION_TOKEN = "submission_token";
const USER_LANG_PREF = "user_lang";
const USER_THEME_PREF = "user_theme";
const themeData = [null,nightOwl,monokai,twilight,github];

const monacoThemes = [
    {
        label: "Light",
        name: "light"
    },
    {
        label: "Night Owl",
        name: "night-owl"
    },
    {
        label: "Monokai",
        name: "monokai",
    },
    {
        label: "Twilight",
        name: "twilight"
    },
    {
        label: "GitHub",
        name: "github"
    }
]
const programmingLanguages = [
    {
        id:93,
        label:"Javascript",
        name:"javascript",

    },
    {
        label: "Python 3",
        id: 71, name: "python"
    },
    {
        label: "Java",
        id: 91, name: "java"
    },
    {
        label: "C++",
        id: 54,
        name: "cpp"
    }
]
const monacoOptions = [

    {
        text:"Light",
        key:1,
        value:0
    },
    {
        text:"Night Owl",
        key:2,
        value:1
    },
    {
        text:"Monokai",
        key:3,
        value: 2
    },
    {
        text:"Twilight",
        key:4,
        value:3
    },
    {
        text:"GitHub",
        key:5,
        value:4
    }
]
const programmingOptions = [
    {
        key:1,
        text:"Javascript",
        value:0
    },
    {
        key:2,
        text:"Python 3",
        value:1
    },
    {
        key:3,
        text:"Java",
        value:2
    },
    {
        key:4,
        text:"C++",
        value:3
    },
]



const defineTheme = (name,ind) => {
    return new Promise((res)=>{
        loader.init().then((monaco) => {
            monaco.editor.defineTheme(name,themeData[ind]);
            res();
        });
    })

};


export default function Room({socket=Socket}){
    const [stdInput,setStdInput] = useState("");
    const [lang,setLang] = useState(programmingLanguages[initInd(USER_LANG_PREF)]);
    const [theme,setTheme] = useState(monacoThemes[initInd(USER_THEME_PREF)]);
    const [code,setCode] = useState("");
    const [loading,setLoading] = useState(false);
    const [output,setOutput] = useState({err:false,output:""});
    const [inputVisable,setInputVisable] = useState(false);
    const [joinReq,setJoinReq] = useState(new Set());
    const [outputVisable,setOutputVisable] = useState(false);
    const [users,setUsers] = useState([]);
    const [video,setVideo] = useState(false);
    const roomName = useRef("");
    const videoStream = useRef(null);
    const [initDone,setInitDone] = useState(false);
    const {state} = useLocation();
    const navigate = useNavigate();





    useEffect(() => {
        if(state === null)navigate("/");
        socketHandler();
    }, [socket]);
    
    useEffect(() => {
        // eslint-disable-next-line no-prototype-builtins
        if(localStorage.hasOwnProperty(USER_THEME_PREF)){
            const ind = Number(localStorage.getItem(USER_THEME_PREF));
            if(ind > 0){
                defineTheme(monacoThemes[ind].name,ind).then(()=>{
                    setTheme(monacoThemes[ind]);
                })
            }
        }
    }, []);

    function socketHandler(){
        socket.removeAllListeners();
        socket.emit("getRoomName",{"roomId":localStorage.getItem("roomId")});
        socket.emit("getSourceCode",localStorage.getItem("roomId"));
        socket.emit("getUsers",localStorage.getItem("roomId"));
        socket.on("joinReq",(data)=>{
            setJoinReq(prevState => new Set([...prevState,data.userName]));
        });
        socket.on("roomNameRes",(data)=>{
            roomName.current = data.roomName;
        })
        socket.on("sourceCodeRes",({sourceCode})=>{
            setCode(sourceCode);
        });
        socket.on("usersRes",(users)=>{
            if(videoStream.current === null){
                const arr = users.users.filter((val)=>val.userName !== localStorage.getItem("userName")).map((val)=>val.userName);
                videoStream.current = new VideoStream(socket,arr);
                videoStream.current.init().then(()=>{
                    setInitDone(true);
                });
            }
            setUsers([...users.users]);
        });
        socket.on("userJoined",(data)=>{
            if(data.roomId === localStorage.getItem("roomId") && localStorage.getItem("allowed")){
                socket.emit("getUsers",localStorage.getItem("roomId"));
                toast.message(`${data.userName} Joined`);
            }
        });
        socket.on("codeRunning",(data)=>{
            if(data.roomId === localStorage.getItem("roomId") && localStorage.getItem("allowed")) {
                setLoading(true);
            }
        });
        socket.on("userLeft",(data)=>{
            if(data.roomId === localStorage.getItem("roomId") && localStorage.getItem("allowed")) {
                socket.emit("getUsers", localStorage.getItem("roomId"));
                videoStream.current.removeConnection(data.userName);
                toast.message(`${data.userName} Left`);
            }
        });
        socket.on("forcedLeave",(data)=>{
            if(data.roomId === localStorage.getItem("roomId") && localStorage.getItem("allowed")){
                socket.emit("leaveRoom",{userName:localStorage.getItem("userName"),roomId:localStorage.getItem("roomId")});
                toast.message("Admin Left The room");
                navigate("/");
            }
        });
        socket.on("outputSync",(data)=>{
            if(data.roomId === localStorage.getItem("roomId") && localStorage.getItem("allowed")){
                setOutput(data.output);
                setLoading(false);
                setOutputVisable(true);
            }
        });
        socket.on("inputSync",(data)=>{
            if(data.roomId === localStorage.getItem("roomId") && localStorage.getItem("allowed")) {
                setInputVisable(true);
                setStdInput(data.input);
            }
        });
        socket.on("languageSync",(data)=>{
            if(data.roomId === localStorage.getItem("roomId") && localStorage.getItem("allowed")) {
                localStorage.setItem(USER_LANG_PREF,data.val);
                setLang(programmingLanguages[Number(data.val)]);
            }
        });

    }

    function requestHandler(val,userName){
        setJoinReq(prevState => {
            prevState.delete(userName);
            return new Set([...prevState])
        });
        socket.emit("AdminReqRes",{allowed:val,userName:userName,roomId:localStorage.getItem("roomId")});
    }


    function initInd(C){
        // eslint-disable-next-line no-prototype-builtins
        if(localStorage.hasOwnProperty(C))return Number(localStorage.getItem(C));
        return 0;
    }

    function onLanguageChange(val){
        socket.emit("languageChange",{roomId:localStorage.getItem("roomId"),data:val});
        localStorage.setItem(USER_LANG_PREF,val);
        setLang(programmingLanguages[Number(val)]);
    }

    function onThemeChange(val){
        const ind = Number(val);
        if(ind !== 0){
            defineTheme(monacoThemes[ind].name,ind).then(()=>{
                setTheme(monacoThemes[ind]);
            })
        }else{
            setTheme(monacoThemes[ind]);
        }
        localStorage.setItem(USER_THEME_PREF,val);

    }

    function onTextChange(val){
        setCode(val);
        // const pos = editor.getPosition();
        // socket.emit("codeChange",{cursorPos:pos,text:val});

    }

    const handleInputVisibility = ()=> setInputVisable((prev)=>!prev);
    const handleOutputVisbility = () => setOutputVisable((prev)=>!prev);
    function editorOnMount(editor,monaco){
        const remoteCursorManager = new RemoteCursorManager({
            editor: editor,
            tooltips: true,
            tooltipDuration:0.5,
            tooltipClassName:"my_cursor"
        });
        socket.on("update",({roomId,userName,data})=>{
            if(roomId !== localStorage.getItem("roomId") || userName === localStorage.getItem("userName"))return
            // eslint-disable-next-line no-prototype-builtins
            if(!data.hasOwnProperty("cursorPos") || !data.hasOwnProperty("text"))return;
            // eslint-disable-next-line no-prototype-builtins
            if(data.hasOwnProperty("spec")){
                setCode(data.text);
                // eslint-disable-next-line no-prototype-builtins
            }else if(!data.hasOwnProperty("cursorChange")){
                editor.executeEdits("my-source", [
                    {
                        range: new monaco.Range(
                            data.cursorPos.lineNumber,
                            data.cursorPos.column,
                            data.cursorPos.lineNumber,
                            data.cursorPos.column + 1
                        ),
                        text: data.text,
                        forceMoveMarkers: true,
                    }
                ])
                const cursor = remoteCursorManager.addCursor(userName, "black",userName);
                cursor.setPosition(new monaco.Position(data.cursorPos.lineNumber,data.cursorPos.column));
                setTimeout(()=>cursor.dispose(),500);
            }
        })
        editor.onKeyUp((e)=>{
            const pos = editor.getPosition();
            let str = e.browserEvent.key;
            const obj = {cursorPos:pos,text:str,source:editor.getValue()};
            if(str.length > 1 || e.keyCode === monaco.KeyCode.Space){
                if(e.keyCode === monaco.KeyCode.Space  || e.keyCode === monaco.KeyCode.Enter || e.keyCode === monaco.KeyCode.Tab || e.keyCode === monaco.KeyCode.Backspace) {
                    obj.spec = true;
                    obj.text = editor.getValue();
                }else if(e.keyCode === monaco.KeyCode.UpArrow || e.keyCode === monaco.KeyCode.LeftArrow || e.keyCode === monaco.KeyCode.DownArrow || e.keyCode === monaco.KeyCode.RightArrow){
                    obj.cursorChange = true;
                }else return;
            }
            socket.emit("codeChange",{data:obj,roomId:localStorage.getItem("roomId"),userName:localStorage.getItem("userName")});
        })
    }

    async function executeCode(){
        // eslint-disable-next-line no-prototype-builtins
        if(localStorage.hasOwnProperty(SUBMISSION_TOKEN) || code.trim().length === 0)return;
        setLoading(true);
        socket.emit("codeRun",{roomId:localStorage.getItem("roomId")});
        const options = {
            method: 'POST',
            url: import.meta.env.VITE_APP_SUBMISSION_URL,
            params: {
                base64_encoded: 'true',
                fields: '*'
            },
            headers: {
                'content-type': 'application/json',
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': import.meta.env.VITE_APP_RAPID_API_KEY,
                'X-RapidAPI-Host': import.meta.env.VITE_APP_RAPID_API_HOST
            },
            data: {
                language_id: lang.id,
                source_code:btoa(code),
                stdin:btoa(stdInput)
            }
        };
        axios.request(options)
            .then((res)=>{
                if(res.status === 201){
                    localStorage.setItem(SUBMISSION_TOKEN,res.data.token);
                    getOutput();
                    toast.success(" Code submitted successfully.");
                }else{
                    setLoading(false);
                    toast.error("Code execution failed. Run  again." );
                }
            }).catch(()=>{
                setLoading(false);
                toast.error("Something went wrong")
            })
    }

    function getOutput(){
        // eslint-disable-next-line no-prototype-builtins
        if(!localStorage.hasOwnProperty(SUBMISSION_TOKEN)){
            setLoading(false);
        }
        const options = {
            method:"GET",
            url:import.meta.env.VITE_APP_SUBMISSION_URL + localStorage.getItem(SUBMISSION_TOKEN),
            params: {
                base64_encoded:"true",
            },
            headers: {
                'X-RapidAPI-Key': import.meta.env.VITE_APP_RAPID_API_KEY,
                'X-RapidAPI-Host': import.meta.env.VITE_APP_RAPID_API_HOST
            }
        };
        axios.request(options)
            .then((res)=>{
                if(res.data.status.id !== undefined){
                    if(res.data.status.id === 1 || res.data.status.id === 2){
                        setTimeout(()=>{
                            getOutput();
                        },2000);
                        setLoading(true);
                    }else{
                        let obj = null;
                        if(res.data.status.id <= 4){
                            obj = {err:false,output:res.data.stdout !== null ? atob(res.data.stdout) : ""}
                        }else if(res.data.status.id === 5){
                            obj = {err:true,output:"Time Limited Exceeded"}
                        }else if(res.data.status.id === 6){
                            obj = {err:true,output:res.data.compile_output !== null ? atob(res.data.compile_output) : ""}
                        }else{
                            obj = {err:true,output:res.data.stderr !== null ? atob(res.data.stderr) : ""}

                        }
                        setOutputVisable(true);
                        setOutput(obj);
                        socket.emit("stdOutput",{output:obj,roomId:localStorage.getItem("roomId")});
                        setLoading(false);
                        localStorage.removeItem(SUBMISSION_TOKEN);
                    }
                }else{
                    setLoading(false);
                    localStorage.removeItem(SUBMISSION_TOKEN);
                }
            }).catch(()=>{
                setLoading(false);
                localStorage.removeItem(SUBMISSION_TOKEN);
                toast.message(`Code execution failed. Run  again.`);
            });
    }
    function handleLeave(){
        setLoading(true);
        const data = {"userName":localStorage.getItem("userName"),"roomId":localStorage.getItem("roomId"),"name":roomName.current,"source":code};
        if(state.admin){
            httpRequest(import.meta.env.VITE_APP_API_ROOM,"POST",data)
                .then((data)=>{
                    // eslint-disable-next-line no-prototype-builtins
                    if(data.hasOwnProperty("err")){
                        toast.error(data.err);
                    }
                })
                .catch((err)=>{
                    toast.error(`room insert failed ${err}`);
                }).finally(()=>{
                    setLoading(false);
                    socket.emit("leaveRoom",{roomId:localStorage.getItem("roomId"),userName:localStorage.getItem("userName")})
                    navigate("/");
                }
            )
        }else{
            socket.emit("leaveRoom",{roomId:localStorage.getItem("roomId"),userName:localStorage.getItem("userName")})
            navigate("/");
        }

    }
    function handleInputChange(data){
        setStdInput(data.target.value);

        socket.emit("stdInput",{roomId:localStorage.getItem("roomId"),input:data.target.value});
    }
    function changeToVideo(){
        if(!initDone){
            setVideo(false);
        }else{
            setVideo((prevState)=>!prevState);
        }
    }
    return (
        <>
            <NavbarEditor onLeave={handleLeave} />
            <Grid relaxed stackable style={{margin:"0 0 0 0"}}>
                {
                    video &&
                    <GridColumn width={4} style={{paddingRight:"0px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                        <GridRow>
                            <Segment style={{overflow:"auto",minHeight:"86vh",maxHeight:"300px",marginBottom:"16px"}}>
                                <Streams  streams={videoStream.current.streams} handler={changeToVideo}/>
                            </Segment>
                        </GridRow>
                    </GridColumn>
                }
                {
                    !video &&
                    <GridColumn width={4} style={{paddingRight:"0px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                        <GridRow>
                            <Segment style={{overflow:"auto",minHeight:"300px",maxHeight:"300px",marginBottom:"16px"}}>
                                <TransitionGroup animation={"fade"} duration={500}>
                                    {   joinReq.size > 0 &&
                                        <RequestCard req={joinReq} handler={requestHandler}/>
                                    }
                                </TransitionGroup>
                                <UsersList user={users} admin={false} handler={changeToVideo}/>
                            </Segment>
                        </GridRow>
                        <GridRow>
                            <Header as={"h4"}>
                            <span onClick={handleInputVisibility}>
                                <HeaderContent style={{color:"white"}}>
                                    Input:<Icon name={"dropdown"}  />
                                </HeaderContent>
                            </span>
                            </Header>
                            <TransitionGroup animation={"fade down"} duration={500}>
                                {
                                    inputVisable &&
                                    <textarea style={{padding:"8px",marginBottom:"2px",width:"100%",resize:"none",minHeight:"100px"}} onChange={handleInputChange} value={stdInput}/>
                                }
                            </TransitionGroup>
                            <Header as={"h4"}>
                    <span onClick={handleOutputVisbility}>
                        <HeaderContent style={{color:"white"}}>
                        Output:
                        <Icon name={"dropdown"} />
                    </HeaderContent>
                    </span>
                            </Header>
                            <TransitionGroup animation={"fade down"} duration={500}>
                                {
                                    (outputVisable) &&
                                    <textarea readOnly={true} style={{padding:"8px",marginBottom:"8px",resize:"none",minHeight:"90px",width:"100%",color:output.err ? "red":"black"}} value={output.output}/>
                                }
                            </TransitionGroup>
                            <Button  style={{display:"position"}} color={"teal"} fluid loading={loading} onClick={executeCode} disabled={loading} >Run</Button>
                        </GridRow>
                    </GridColumn>
                }

                <GridColumn width={12}>
                    <div style={{marginBottom:"16px",display:"flex",justifyContent:"space-evenly"}}>
                        <Dropdown onChange={(e,data)=> onLanguageChange(data.value)} value={initInd(USER_LANG_PREF)} style={{marginRight:"8px"}} fluid selection options={programmingOptions} />
                        <Dropdown onChange={(e,data)=> onThemeChange(data.value)} fluid selection options={monacoOptions} defaultValue={initInd(USER_THEME_PREF)} />
                    </div>
                    <EditorWindow lang={lang.name} theme={theme.name}  handler={onTextChange} val={code} onMount={editorOnMount}/>
                </GridColumn>
            </Grid>
        </>
    )
}
