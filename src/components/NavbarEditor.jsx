import {Container, Menu, Image, Button, Popup} from "semantic-ui-react";

export default function NavbarEditor({onLeave,roomId}){
    function save(){
        navigator.clipboard.writeText(localStorage.getItem("roomId"));
    }
    return (
        <Menu  style={{margin:"0 0 0 0"}}>
            <Container >
                <Menu.Item as='a' header onClick={onLeave}>
                    <Image size='mini' src='http://192.168.29.44:3155/logo.png' style={{ marginRight: '1.5em' }} />
                    Code Along
                </Menu.Item>
                <Menu.Item position={"right"} >
                    <Button color={"red"} onClick={onLeave} size={"mini"}>leave</Button>
                </Menu.Item>
                <Menu.Item>
                    <Popup style={{marginLeft:"8px"}} content='Copy RoomId' trigger={<Button color={'teal'} icon='copy outline' onClick={save}/>} />
                </Menu.Item>
            </Container>
        </Menu>

    );
}