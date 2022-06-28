import {deployPollTs} from "../quad-voting-maci/contracts/build/contracts/ts/deployPollTs.js";
// import {deployPoll} from "../quad-voting-maci/cli/build/deployPoll.js";

import express from "express";
import {MACI_ADDRESS} from "../consts.mjs";

export let maciRouter = express.Router();

maciRouter.put('/createpoll', async function (req, res, next) {
    let pollID, pollAddr, pptAddr, verifierAddr = await deployPollTs(MACI_ADDRESS, req.body)
    res.json({
            pollID: pollID,
            pollAddr: pollAddr,
            pptAddr: pptAddr,
            verifierAddr: verifierAddr
        });
});

