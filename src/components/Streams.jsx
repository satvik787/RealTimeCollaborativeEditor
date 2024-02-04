import Video from "./Video.jsx";
import {Button, Divider, List, ListHeader} from "semantic-ui-react";

export default function Streams({streams=[],handler}){
    const items = [];
    for(let i = 0;i < streams.length;i++){
        console.log("STREAM ",streams[i]);
        if(streams[i][0].active) {
            items.push(
                <Video stream={streams[i]}></Video>
            )
        }
    }
    return (
        <List selection>
            <ListHeader>
                Users In the Room
                <Button color={"teal"} floated={"right"} compact icon={"users"} onClick={handler}/>
            </ListHeader>
            <Divider/>
            {items}
        </List>
    );
}