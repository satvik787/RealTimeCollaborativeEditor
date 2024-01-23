import {Button, Card, List, ListContent, ListDescription, ListHeader, ListItem} from "semantic-ui-react";
import Navbar from "./Navbar.jsx";
import {useEffect, useState} from "react";
import {httpRequest} from "../api.js";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";

export default function MyRooms(){
    const navigate = useNavigate();
    const [rooms,setRooms] = useState([]);
    useEffect(() => {
        // eslint-disable-next-line no-prototype-builtins
        if(localStorage.hasOwnProperty("userName")){
            httpRequest(import.meta.env.VITE_APP_API_ROOM,"GET",{"userName":localStorage.getItem("userName")})
                .then((data)=>{
                    // eslint-disable-next-line no-prototype-builtins
                    if(data.hasOwnProperty("err")){
                        toast.error(data.err);
                    }else{
                        setRooms(data);
                    }
                })
                .catch()
        }else{
            navigate("/");
        }
    }, [navigate]);
    function handleDelete(e,elem){
        httpRequest(import.meta.env.VITE_APP_API_ROOM,"DELETE",{roomId:rooms[elem.value]["_id"]})
            .then((data)=>{
                if(data["deletedCount"] > 0){
                    setRooms((prevState)=>{
                        const temp = [];
                        for(let i = 0;i < rooms.length;i++){
                            if(i !== elem.value)temp.push(prevState[i]);
                        }


                          return temp;
                    })
                }else{
                    toast.message("Failed To Delete")
                }
            }).catch((err)=>{
                toast.error(err);
            }
        )
    }
    let list = [];
    for(let i = 0;i < rooms.length;i++){
        const date =  new Date(rooms[i]["date"]);
        const lastUpdated =  date.toLocaleDateString() + "  " + date.toLocaleTimeString();
        list.push(
            <ListItem style={{padding:"24px"}} key={rooms[i]["_id"]}>
                <ListContent floated={"right"}>
                    <Button circular icon={"trash alternate"} color={"red"} value={i} onClick={handleDelete}/>
                </ListContent>
                <ListContent style={{marginTop:"16px"}}>
                    <ListHeader>{rooms[i]["name"]}</ListHeader>
                    <ListDescription>Last Updated: {lastUpdated}</ListDescription>
                </ListContent>
            </ListItem>
        )
    }
    return (
        <>
            <Navbar/>
            <div style={{height:"90vh",width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}>
                <Card color={"yellow"} style={{overflow:"auto",height:"80%",maxHeight:"80%",width:"70%",padding:"10px",}}>
                    <List selection divided >
                        {list}
                    </List>
                </Card>
            </div>
        </>
    );
}