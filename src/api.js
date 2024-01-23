import axios from 'axios';

export async function httpRequest(url,method,data){
    const options = {
        method:method,
        url:url,
        headers: {
            'content-type': 'application/json',
            'Content-Type': 'application/json'
        },
        data:data,
        params:data
    };
    try {
        const res = await axios.request(options);
        if(res.status === 200){
            return res.data;
        }else{
            return {"err":"Internal Server Error"}
        }
    }catch (err){
        return {"err":err};
    }
}



