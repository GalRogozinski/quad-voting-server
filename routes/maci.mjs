import {deployPollApi} from "../quad-voting-maci/cli/build/deployPollApi.js";
import {signUpApi} from "../quad-voting-maci/cli/build/signUpApi.js";
import {redisClient} from "../app.mjs"

import express from "express";
import {conf} from "../config.mjs";
import {publishMessageApi} from "../quad-voting-maci/cli/build/publishMessageApi.js";

export let maciRouter = express.Router();

maciRouter.get('/polls', async (req, res, next) => {
    try {
        const polls = await redisClient.lRange('polls', 0, -1);
        res.json(polls);
    } catch (e) {
        next(e)
    }
})

maciRouter.post('/signup', async (req, res, next) => {
    try {
        let stateID = await signUpApi(conf.MACI_ADDRESS, req.body);
        res.json({stateID: stateID});
    } catch (e) {
        next(e);
    }
})

maciRouter.post('/publishMessage', async (req, res, next) => {
    try {
        let txHash = await publishMessageApi(conf.COO_PRIVATE_KEY, req.body);
        res.json({receipt: txHash});
    } catch (e) {
        next(e);
    }
})

