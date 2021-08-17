import {AuthedNextApiRequest} from "../auth/middlewares";
import passport from "../auth/middlewares/passport.mw";
import callback from "../auth/handlers/callback.handler";


describe('callbak handler', () => {
    it('Kaller passport funksjon med rikitg redirect verdier', () => {
        const expSuccessRedirect = "https://loginservice.no?redirect=http://localhost:3000"
        const testreq = {
            options: {
                loginServiceUrl: "https://loginservice.no",
                selfUrl: "http://localhost:3000"
            }
        };
        passport.authenticate = jest.fn(() => () => {
            return "Tadda!"
        });
        callback(testreq as AuthedNextApiRequest, {});
        expect(passport.authenticate).toHaveBeenCalledWith("idporten", {
            successRedirect: expSuccessRedirect,
            failureRedirect: "/?failure"
        });
    });
    it('Kaller passport funksjon med default redirect verdi', () => {
        const expSuccessRedirect = "/"
        const testreq = {
            options: {
                selfUrl: "http://localhost:3000"
            }
        };
        passport.authenticate = jest.fn(() => () => {
            return "Tadda!"
        });
        callback(testreq as AuthedNextApiRequest, {});
        expect(passport.authenticate).toHaveBeenCalledWith("idporten", {
            successRedirect: expSuccessRedirect,
            failureRedirect: "/?failure"
        });
    });
})