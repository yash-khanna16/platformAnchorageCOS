"use server"
import { cookies } from 'next/headers'
import { validate } from './util'


export async function getAuthCustomer() {
    const cookieStore = cookies()
    const auth = cookieStore.get('customer')
    const data=validate(auth?.value)
    return data
}

export async function setAuthCustomer(token: string) {
    cookies().set('customer', token , { secure: true })
}

export async function deleteAuthCustomer() {
    cookies().set('customer', 'false' , { secure: true })
}




