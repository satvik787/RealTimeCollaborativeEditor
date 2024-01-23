import {Container, Menu, Image, Button, Dropdown} from "semantic-ui-react";
import {useNavigate} from "react-router-dom";

export default function NavbarEditor({onLeave,roomId}){
    const navigate = useNavigate();
    return (
        <Menu style={{margin:"0 0 0 0"}}>
            <Container>
                <Menu.Item as='a' header onClick={()=>navigate("/")}>
                    <Image size='mini' src='http://192.168.29.44:3155/logo.png' style={{ marginRight: '1.5em' }} />
                    Code Along
                </Menu.Item>
                <Menu.Item as='a' onClick={()=>navigate("/")}>Join Room</Menu.Item>
                <Menu.Item position={"right"}>
                    <Button color={"red"} onClick={onLeave} size={"mini"}>leave</Button>
                </Menu.Item>
            </Container>
        </Menu>

    );
}