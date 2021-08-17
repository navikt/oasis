import session from "../auth/handlers/session.handler";
import {AuthedNextApiRequest} from "../auth/middlewares";
import {NextApiRequest, NextApiResponse} from "next";

describe('session handler', () => {
    it('skal returnere et session objekt', () => {
        const bruker = {
            fnr: 12345,
            locale: 'no',
            tokenset: {
                expires_in: 100
            }
        }
        const testReq = {
            user: bruker
        }

        let result;
        const testRes = {
            json: (params) => {
                result = params
            }
        }
        //@ts-ignore
        session(testReq, testRes)
        expect(result.user.fnr).toBe(12345)
        expect(result.user.locale).toBe('no')
        expect(result.expires_in).toBe(100)
    })

    it('skal returnere et tomt objekt', () => {
        let result;
        const testRes = {
            json: (params) => {
                result = params
            }
        }

        session({} as AuthedNextApiRequest, testRes as NextApiResponse)
        expect(result).toEqual({})
    })
})