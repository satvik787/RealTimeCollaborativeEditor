import EditorWindow from "./EditorWindow.jsx";
import {loader} from "@monaco-editor/react";
import {useEffect, useState} from "react";
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


export default function Room({socket}){
    const [stdInput,setStdInput] = useState("");
    const [lang,setLang] = useState(programmingLanguages[initInd(USER_LANG_PREF)]);
    const [theme,setTheme] = useState(monacoThemes[initInd(USER_THEME_PREF)]);
    const [code,setCode] = useState("");
    const [loading,setLoading] = useState(false);
    const [output,setOutput] = useState({err:false,output:""});
    const [inputVisable,setInputVisable] = useState(false);
    const [joinReq,setJoinReq] = useState({open:false});
    const [outputVisable,setOutputVisable] = useState(false);
    const [users,setUsers] = useState([]);
    const {state} = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        if(state === null)navigate("/");
        socketHandler();
        // eslint-disable-next-line no-prototype-builtins
        if(localStorage.hasOwnProperty(lang.name)){
            setCode(localStorage.getItem(lang.name));
        }else {
            setCode("");
        }
    }, [lang]);
    

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
        socket.emit("getSourceCode",localStorage.getItem("roomId"));
        socket.emit("getUsers",localStorage.getItem("roomId"));
        socket.on("joinReq",(data)=>{
            setJoinReq({userName:data.userName,email:data.email,open:true});
        });
        socket.on("sourceCodeRes",({sourceCode})=>{
            setCode(sourceCode);
        })
        socket.on("usersRes",(users)=>{
            setUsers([...users.users]);
        })
        socket.on("userJoined",(data)=>{
            if(data.roomId !== localStorage.getItem("roomId"))return;
            socket.emit("getUsers",localStorage.getItem("roomId"));
            toast.message(`${data.userName} Joined`);
        });

        socket.on("userLeft",(data)=>{
            if(data.roomId !== localStorage.getItem("roomId"))return;
            socket.emit("getUsers",localStorage.getItem("roomId"));
            toast.message(`${data.userName} Left`);
        })
        socket.on("forcedLeave",(data)=>{
            if(data.roomId !== localStorage.getItem("roomId"))return;
            socket.emit("leaveRoom",{userName:localStorage.getItem("userName"),roomId:localStorage.getItem("roomId")});
            toast.message("Admin Left The room");
            navigate("/");
        })
    }

    function requestHandler(val){
        socket.emit("AdminReqRes",{allowed:val,userName:joinReq.userName,roomId:localStorage.getItem("roomId")});
        setJoinReq({open:false})
    }


    function initInd(C){
        // eslint-disable-next-line no-prototype-builtins
        if(localStorage.hasOwnProperty(C))return Number(localStorage.getItem(C));
        return 0;
    }

    function onLanguageChange(val){
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

        const cursor = remoteCursorManager.addCursor("_ADS", "black", "satvik");
        socket.on("update",({roomId,userName,data})=>{
            console.log(data,roomId,userName);
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
            }
            cursor.setPosition(new monaco.Position(data.cursorPos.lineNumber,data.cursorPos.column));
        })
        editor.onKeyUp((e)=>{
            const pos = editor.getPosition();
            let str = e.browserEvent.key;
            const obj = {cursorPos:pos,text:str};
            if(str.length > 1 || e.keyCode === monaco.KeyCode.Space){
                if(e.keyCode === monaco.KeyCode.Space || e.keyCode === monaco.KeyCode.Enter || e.keyCode === monaco.KeyCode.Tab || e.keyCode === monaco.KeyCode.Backspace) {
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
        socket.emit("leaveRoom",{roomId:localStorage.getItem("roomId"),userName:localStorage.getItem("userName")})
        navigate("/");
    }
    return (
        <>
            <NavbarEditor onLeave={handleLeave} />
            <Grid relaxed stackable style={{margin:"0 0 0 0"}}>
                <GridColumn width={4} style={{paddingRight:"0px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                    <GridRow>
                        <Segment style={{overflow:"auto",minHeight:"350px",maxHeight:"350px",marginBottom:"16px"}}>
                            <TransitionGroup animation={"fade"} duration={500}>
                                {   joinReq.open &&
                                    <RequestCard userName={joinReq.userName} handler={requestHandler}/>
                                }
                            </TransitionGroup>
                            <UsersList user={users} admin={false}/>
                        </Segment>
                    </GridRow>
                    <GridRow>
                        <Header as={"h4"}>
                    <span onClick={handleInputVisibility}>
                        <HeaderContent style={{color:"white"}}>
                        Input:
                        <Icon name={"dropdown"}  />
                    </HeaderContent>
                    </span>
                        </Header>
                        <TransitionGroup animation={"fade down"} duration={500}>
                            {
                                inputVisable &&
                                <textarea style={{padding:"16px",marginBottom:"8px",width:"100%",resize:"none",minHeight:"100px"}} onChange={(data)=>setStdInput(data.target.value)} />
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
                                <textarea readOnly={true} style={{padding:"12px",marginBottom:"8px",resize:"none",minHeight:"100px",width:"100%",color:output.err ? "red":"black"}} value={output.output}/>
                            }
                        </TransitionGroup>
                        <Button  style={{display:"position"}} color={"teal"} fluid loading={loading} onClick={executeCode} disabled={loading} >Run</Button>
                    </GridRow>
                </GridColumn>
                <GridColumn width={12}>
                    <div style={{marginBottom:"16px",display:"flex",justifyContent:"space-evenly"}}>
                        <Dropdown onChange={(e,data)=> onLanguageChange(data.value)} defaultValue={initInd(USER_LANG_PREF)} style={{marginRight:"8px"}} fluid selection options={programmingOptions} />
                        <Dropdown onChange={(e,data)=> onThemeChange(data.value)} fluid selection options={monacoOptions} defaultValue={initInd(USER_THEME_PREF)} />
                    </div>
                    <EditorWindow lang={lang.name} theme={theme.name}  handler={onTextChange} val={code} onMount={editorOnMount}/>
                </GridColumn>
            </Grid>
        </>
    )
}
