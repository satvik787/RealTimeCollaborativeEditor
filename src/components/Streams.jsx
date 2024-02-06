import Video from "./Video.jsx";
import {Button, Divider, List, ListHeader} from "semantic-ui-react";

export default function Streams({streams=Map,handler}){
    const items = [];
    for(let i of streams.keys()){
        console.log("STREAM ",i," ",streams.get(i));
        if(streams.get(i).active) {
            items.push(
                <Video userName={i} stream={streams.get(i)}></Video>
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