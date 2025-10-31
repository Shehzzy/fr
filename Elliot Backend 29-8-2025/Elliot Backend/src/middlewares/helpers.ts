import bcrypt from 'bcrypt';
import * as DAO from '../DAO';
import * as Models from '../models/index';
import random_string from "randomstring";
import { app_constant } from '../config/index';
const salt_rounds = app_constant.salt_rounds


const generate_otp = async () => {
    try {

        let options = {
            length: 6,
            charset: '123456789'
        }
        let code = random_string.generate(options)
        return code

    }
    catch (err) {
        throw err;
    }
}

const gen_unique_code = async (collection: any) => {
    try {

        let options = {
            length: 7,
            charset: 'alphanumeric'
        }
        let random_value = random_string.generate(options)

        // fetch users count
        let total_users = await DAO.countData(collection, {})
        let inc_value = Number(total_users) + 1

        // unique code
        let unique_code = `${random_value}${inc_value}`
        return unique_code

    }
    catch (err) {
        throw err;
    }
}

const bcrypt_password = async (password: string) => {
    try {

        const hash = await bcrypt.hash(password, salt_rounds);

        return hash

    }
    catch (err) {
        throw err;
    }
}

const decrypt_password = async (password: string, hash: string) => {
    try {

        const decryt = await bcrypt.compareSync(password, hash);
        return decryt

    }
    catch (err) {
        throw err;
    }
}


export {
    generate_otp,
    gen_unique_code,
    bcrypt_password,
    decrypt_password
}