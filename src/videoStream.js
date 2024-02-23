import {Socket} from "socket.io-client";

export default class VideoStream {

    static server = {
        iceServers: [

            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                    "stun:stun.services.mozilla.com",
                ],
            },
            {
                urls: "turn:in.relay.metered.ca:80",
                username: "0d4dabb868b66c7a0008f452",
                credential: "pCpQC3G1L5xouPbF",
            },
        ],
        iceCandidatePoolSize: 10,
    }
    constructor(socket= new Socket(),userList=[]) {
        this.userList = userList;
        this.connections = new Map();
        this.socket = socket;
        this.streams = new Map();
        this.localStream = new MediaStream();
    }

    async init(){

        this.socket.off("io:candidate");
        this.socket.off("io:answer");
        this.socket.off("io:offer");
        this.socket.on("io:candidate",({to,peerUserName,candidate})=>{
            if(to === localStorage.getItem("userName")) {
                this.setCandidate(peerUserName, candidate);
            }
        });
        this.socket.on("io:answer",({to,peerUserName,answer})=>{
            if(to === localStorage.getItem("userName")){
                this.setAnswer(peerUserName,answer);
            }
        });
        this.socket.on("io:offer",({to,peerUserName,offer})=>{
            if(to === localStorage.getItem("userName")){
                this.createAnswer(peerUserName,offer);
            }
        });
        for(let i = 0;i < this.userList.length;i++){
            await this.createOffer(this.userList[i]);
        }
    }

    async newConnection(peerUserName){

        const connection = new RTCPeerConnection(VideoStream.server);
        const remoteStream = new MediaStream();
        connection.ontrack = (event)=>{
            console.log("GOT TRACK");
            event.streams[0].getTracks().forEach((track)=>{
                remoteStream.addTrack(track);
            });
        }
        this.streams.set(peerUserName,remoteStream);
        connection.onicecandidate = async (event) => {
            if(event.candidate){
                setTimeout(()=>{
                    console.log("ICE GEN");
                    this.socket.emit("stream:candidate",{candidate:event.candidate,peerUserName:peerUserName,userName:localStorage.getItem("userName")});
                },800);
            }
        }
        return connection;
    }

    async createOffer(peerUserName){
        const configuration = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        }
        const connection = await this.newConnection(peerUserName);
        this.connections.set(peerUserName,connection);
        this.localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        this.localStream.getTracks().forEach((track)=>{
            connection.addTrack(track,this.localStream);
        });
        console.log("in OFFER",this.connections," peerUSERNAME ",peerUserName);
        const offer = await connection.createOffer(configuration);
        await connection.setLocalDescription(offer);
        this.socket.emit("stream:offer",{offer:offer,peerUserName:peerUserName,userName:localStorage.getItem("userName")});
    }

    async createAnswer(peerUserName,offer){
        console.log("in Answer before",this.connections," peerUSERNAME ",peerUserName);
        const connection = await this.newConnection(peerUserName);
        await connection.setRemoteDescription(offer);
        this.localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        this.localStream.getTracks().forEach((track)=>{
            connection.addTrack(track,this.localStream);
        });
        this.connections.set(peerUserName,connection);
        console.log("in Answer after",this.connections," peerUSERNAME ",peerUserName);
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        this.socket.emit("stream:answer",{answer:answer,peerUserName:peerUserName,userName:localStorage.getItem("userName")});
    }

    async setCandidate(peerUserName, candidate) {
        if (this.connections.has(peerUserName)){
            console.log("IN CANDIDATE AFTER",this.connections)
            try {
                await this.connections.get(peerUserName).addIceCandidate(candidate);
            } catch (e) {
                console.log('Error adding received ice candidate', e);
            }
        }
    }

    async setAnswer(peerUserName,answer){
        console.log("in setAnswer ",this.connections," peerUSERNAME ",peerUserName);
        await this.connections.get(peerUserName).setRemoteDescription(answer);
    }

    async removeConnection(peerUserName){
        await this.connections.get(peerUserName).close();
        this.connections.delete(peerUserName);
    }


    toggleAudio(val){
        const audio = this.localStream.getTracks().find((track)=> track.kind === 'audio');
        audio.enabled = val;
    }

    toggleCamera(val){
        const videoTrack = this.localStream.getTracks().find((track)=> track.kind === 'video');
        videoTrack.enabled = val;
    }

}


