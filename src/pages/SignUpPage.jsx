import {Form,Button, Grid, Header, Image, Segment, Message} from "semantic-ui-react";
import {useEffect, useState} from "react";
import {httpRequest} from "../api.js";
import {Link, useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {toast} from "sonner";

export default function SignUpPage(){
    const [userName,setUserName] = useState("");
    const [password,setPassword] = useState("");
    const [email,setEmail] = useState("");
    const [userNameErr,setUserNameErr] = useState(null);
    const [passwordErr,setPasswordErr] = useState(null);
    const [emailErr,setEmailErr] = useState(null);
    const [loading,setLoading] = useState(false);
    const [invalid,setInvalid] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("userName") !== null){
            navigate('/');
        }
    }, []);
    function handleSignup(){
        if(userName.length >= 5 && password.length >= 5 && email.length >= 5){
            setLoading(true);
            httpRequest(import.meta.env.VITE_APP_API_SIGNUP,"POST",{userName:userName,password:password,email:email})
                .then((data)=>{
                    // eslint-disable-next-line no-prototype-builtins
                    if(data.hasOwnProperty("err")){
                        setInvalid(data.err);
                    }else{
                        if(data["acknowledged"]){
                            navigate("/login");
                            toast.success("Account Created");
                            navigate("/login");
                        }
                    }
                    setLoading(false);
                })
                .catch((err)=>{
                    setLoading(false);
                    console.log(err);
                })
        }else{
            if(userName.length <= 5)setUserNameErr({content:"username has to be at least 5 characters",pointing:"below"});
            if(password.length <= 5)setPasswordErr({content:"password has to be at least 5 characters",pointing:"below"});
            if(email.length <= 5)setEmailErr({content:"email has to be at least 5 characters",pointing:"below"});

        }
    }
    function handleUserNameChange(data){
        setUserName(data.target.value);
        setUserNameErr(null);
    }
    function handlePasswordChange(data){
        setPassword(data.target.value);
        setPasswordErr(null);
    }
    function handleEmailChange(data){
        setEmail(data.target.value);
        setEmailErr(null);
    }
    return (
        <>

            <Navbar/>
            <Grid textAlign='center' style={{ height: '80vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as='h2' color='teal' textAlign='center'>
                        <Image src='http://3.111.150.230/logo.png' /> Sign-Up
                    </Header>
                    <Form size='large' loading={loading}>
                        <Segment stacked>
                            <Form.Input error={userNameErr} onChange={handleUserNameChange} fluid icon='user' iconPosition='left' placeholder='UserName' />
                            <Form.Input error={emailErr} onChange={handleEmailChange} fluid icon='mail' iconPosition='left' placeholder='Email Address' />
                            <Form.Input
                                fluid
                                icon='lock'
                                error={passwordErr}
                                iconPosition='left'
                                placeholder='Password'
                                type='password'
                                onChange={handlePasswordChange}
                            />

                            <Button color='teal' fluid size='large' onClick={handleSignup}>
                                Signup
                            </Button>
                            <Message error visible={invalid !== null} content={invalid}/>
                        </Segment>
                    </Form>
                    <Message>
                        Already Have an Account ? <Link to={"/login"}>Login</Link>
                    </Message>
                </Grid.Column>
            </Grid>

        </>
    );
}