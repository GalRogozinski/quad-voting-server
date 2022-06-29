import {deployPollApi} from "../quad-voting-maci/cli/build/deployPollApi.js";
import {signUpApi} from "../quad-voting-maci/cli/build/signUpApi.js";

import express from "express";
import {MACI_ADDRESS} from "../consts.mjs";

export let maciRouter = express.Router();

maciRouter.post('/createpoll', async function (req, res, next) {
    try {
        let [pollID, pollAddr, pptAddr, verifierAddr] = await deployPollApi(MACI_ADDRESS, req.body);
        res.json({
            pollID: pollID,
            pollAddr: pollAddr,
            pptAddr: pptAddr,
            verifierAddr: verifierAddr
        });
    } catch (e) {
        next(e);
    }
});

maciRouter.post('/signup', async (req, res,next) => {
    try {
        let stateID = await signUpApi(MACI_ADDRESS, req.body);
        res.json({stateID: stateID});
    } catch (e) {
        next(e);
    }
})

