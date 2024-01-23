import {
    Form,
    Button,
    Header, Grid, Segment, Message,Image
} from "semantic-ui-react";
import {useEffect, useState} from "react";
import {httpRequest} from "../api.js";
import Navbar from "../components/Navbar.jsx";
import {Link, useNavigate} from "react-router-dom";
export default function LoginPage(){
    const [userName,setUserName] = useState("");
    const [password,setPassword] = useState("");
    const [userNameErr,setUserNameErr] = useState(null);
    const [passwordErr,setPasswordErr] = useState(null);
    const [loading,setLoading] = useState(false);
    const [invalid,setInvalid] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("userName") !== null){
            navigate('/');
        }
    }, []);
    function handleUserNameChange(data){
        setUserName(data.target.value);
        setUserNameErr(null);
    }
    function handlePasswordChange(data){
        setPassword(data.target.value);
        setPasswordErr(null);
    }
    function handleLogin(){
        if(userName.length >= 5 && password.length >= 5){
            setLoading(true);
            httpRequest(import.meta.env.VITE_APP_API_LOGIN,"POST",{userName:userName,password:password})
                .then((data)=>{
                    // eslint-disable-next-line no-prototype-builtins
                    if(!data.hasOwnProperty("err")){
                        setInvalid(null);
                        localStorage.setItem("userName",data.userName);
                        localStorage.setItem("email",data.email);
                        navigate("/");
                    }else{
                        setInvalid(data.err);
                    }
                    setLoading(false);
                })
                .catch((err)=>{
                    console.log(err);
                })
        }else{
            if(userName.length <= 5)setUserNameErr({content:"username has to at least 5 characters",pointing:"below"});
            if(password.length <= 5)setPasswordErr({content:"password has to at least 5 characters",pointing:"below"});

        }
    }
    return (
        <>
            <Navbar/>
            <Grid textAlign='center' style={{ height: '80vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as='h2' color='teal' textAlign='center'>
                        <Image src='http://192.168.29.44:3155/logo.png' /> Log-in to your account
                    </Header>
                    <Form size='large' loading={loading}>
                        <Segment stacked>
                            <Form.Input error={userNameErr} onChange={handleUserNameChange} fluid icon='user' iconPosition='left' placeholder='UserName' />
                            <Form.Input
                                fluid
                                icon='lock'
                                error={passwordErr}
                                iconPosition='left'
                                placeholder='Password'
                                type='password'
                                onChange={handlePasswordChange}
                            />
                            <Button color='teal' fluid size='large' onClick={handleLogin}>
                                Login
                            </Button>
                            <Message error visible={invalid !== null} content={invalid}/>
                        </Segment>
                    </Form>
                    <Message>
                        Dont have a account? <Link to={"/signup"}> Sign Up</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        </>
    );
  }