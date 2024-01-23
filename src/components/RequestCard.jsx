import {Button, Card, CardContent, CardDescription, CardHeader, Divider, Image} from "semantic-ui-react";
import {useState} from "react";

export default function RequestCard({requests,handler}){
    requests = [...requests];
    const [ind,setInd] = useState(0);
    return (
        <Card style={{position:"absolute",zIndex:3,top:0,left:0,margin:"8px"}}>
            <CardContent>
                <Image
                    circular
                    floated='right'
                    size='mini'
                    src='https://react.semantic-ui.com/images/avatar/large/daniel.jpg'
                />
                <CardHeader>{requests[ind]}</CardHeader>
                <CardDescription>wants to join the Room</CardDescription>
                <div className='ui two buttons' style={{marginTop:"14px"}}>
                    <Button basic color='green' onClick={()=>handler(true,requests[ind])}>Approve</Button>
                    <Button basic color='red' onClick={()=>handler(false,requests[ind])}>Decline</Button>
                </div>
            </CardContent>
            {
                requests.length > 1 &&
                <>
                    <Divider style={{margin:"0px",marginBottom:"8px"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"8px"}}>
                        <Button icon={"caret left"} size={"mini"} onClick={()=> setInd(ind > 0 ? ind - 1:requests.length - 1)}/>
                        <text>change</text>
                        <Button icon={"caret right"} size={"mini"} onClick={()=>setInd(ind + 1 < requests.length ? ind + 1:0)}/>
                    </div>
                </>
            }
        </Card>
    );
}