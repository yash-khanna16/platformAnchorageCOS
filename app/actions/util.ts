"use server"
import { jwtVerify } from 'jose';

export async function parseJwt(token: string | undefined) {
    if (!token || token === undefined || token.split('.').length<2 ) { return; }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const decodedData = Buffer.from(base64, 'base64').toString('utf-8');
    console.log(JSON.parse(decodedData));
    return JSON.parse(decodedData);
}

export async function validate(token: string | undefined) {
    console.log("1",process.env.Secret_Key)
    if (!token || token === undefined) { return; }
    try {
        const secret = new TextEncoder().encode(process.env.Secret_Key);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (err) {
        console.error('Token verification failed: ', err);
        return;
    }
}



