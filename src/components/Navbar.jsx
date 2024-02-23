import {Container, Menu, Image, Button, Icon} from "semantic-ui-react";
import {useNavigate} from "react-router-dom";

export default function Navbar(){
    const navigate = useNavigate();
    function handleSignOut(){
        navigate("/");
        localStorage.clear();
    }
    return (
        <Menu style={{margin:"0 0 0 0"}}>
            <Container>
                <Menu.Item as='a' header onClick={()=>navigate("/")}>
                    <Image size='mini' src='http://13.234.35.201/logo.png' style={{ marginRight: '1.5em' }} />
                    Code Along
                </Menu.Item>
                {
                    localStorage.getItem("userName") !== null &&
                    <Menu.Item as='a' onClick={()=>navigate("/myRooms")}>MyRooms</Menu.Item>
                }
                <Menu.Item as='a' position={"right"}>
                    {
                        // eslint-disable-next-line no-prototype-builtins
                        !localStorage.hasOwnProperty("userName") &&
                        <>
                            <Button primary as='a' style={{marginRight:"10px"}} onClick={()=>navigate("/login")}>Log in</Button>
                            <Button color={"teal"} onClick={()=>navigate("/signup")}>Sign up</Button>
                        </>
                    }
                    {
                        localStorage.hasOwnProperty("userName") &&
                        <>
                            <Button color={"teal"} onClick={handleSignOut}><Icon name="sign-out"/>Sign Out</Button>
                        </>
                    }
                </Menu.Item>
            </Container>
        </Menu>

    );
}