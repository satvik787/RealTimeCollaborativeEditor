import React, {useEffect} from "react";
import {Card, CardDescription,} from "semantic-ui-react";

export default function Video({userName,stream}){
    const localVideo = React.createRef();


    useEffect(() => {
        if (localVideo.current) localVideo.current.srcObject = stream;
    }, [localVideo, stream]);

    return (
        <Card>
            <video ref={localVideo} autoPlay />
            <CardDescription style={{paddingLeft:"8px"}}>
                {userName}
            </CardDescription>
        </Card>
    );
}