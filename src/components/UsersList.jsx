import {Button, Divider, Image, List, ListContent, ListHeader, ListItem} from "semantic-ui-react";
export default function UsersList({user=[],handler}){
    const items = []
    const names = ["daniel.jpg","steve.jpg","molly.png","jenny.jpg","matthew.png"]
    for(let i = 0;i < user.length;i++){
        items.push(
            <ListItem value={String(i)} key={String(i)} >
                <Image avatar src={`https://react.semantic-ui.com/images/avatar/large/${names[i % 5]}`}></Image>
                <ListContent>
                    <ListHeader as={"h4"}>{user[i]["userName"]}</ListHeader>
                </ListContent>
            </ListItem>
        )
    }
    return (
        <List selection>
            <ListHeader>
                Users In the Room
                <Button color={"teal"} floated={"right"} compact icon={"video"} onClick={handler}/>
            </ListHeader>
            <Divider/>
            {items}
        </List>
    );
}