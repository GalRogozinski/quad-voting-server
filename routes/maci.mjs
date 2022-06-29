import {deployPollApi} from "../quad-voting-maci/contracts/build/cli/ts/deployPollApi.js";
// import {deployPoll} from "../quad-voting-maci/cli/build/deployPoll.js";

import express from "express";
import {MACI_ADDRESS} from "../consts.mjs";

export let maciRouter = express.Router();

maciRouter.put('/createpoll', async function (req, res, next) {
    let pollID, pollAddr, pptAddr, verifierAddr = await deployPollApi(MACI_ADDRESS, req.body)
    res.json({
            pollID: pollID,
            pollAddr: pollAddr,
            pptAddr: pptAddr,
            verifierAddr: verifierAddr
        });
});

