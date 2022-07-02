import {deployPollApi} from "../quad-voting-maci/cli/build/deployPollApi.js";
import {signUpApi} from "../quad-voting-maci/cli/build/signUpApi.js";
import {redisClient} from "../app.mjs"

import express from "express";
import {MACI_ADDRESS, COO_PRIVATE_KEY} from "../consts.mjs";

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

maciRouter.post('/createpoll', async function (req, res, next) {
    try {
        if (req.body.vote_options.length > req.body.max_vote_options) {
            throw new Error("the number of given vote options is freater than the allowed max length")
        }
        let [pollID, pollAddr, pptAddr, verifierAddr] = await deployPollApi(MACI_ADDRESS, req.body);
        let resJson = {
            pollID: pollID,
            pollAddr: pollAddr,
            pptAddr: pptAddr,
            verifierAddr: verifierAddr,
            description: req.body.description,
            vote_options: req.body.vote_options
        }
        await redisClient.lPush('polls', JSON.stringify(resJson), (err, reply) => {
            if (err) {
                console.error("Failed to create poll", err)
                throw new Error(err);
            }
        })
        res.json(resJson);
    } catch (e) {
        next(e);
    }
});

maciRouter.post('/signup', async (req, res, next) => {
    try {
        let stateID = await signUpApi(MACI_ADDRESS, req.body);
        res.json({stateID: stateID});
    } catch (e) {
        next(e);
    }
})

maciRouter.post('/publishMessage', async (req, res, next) => {
    try {
        let txHash = await publishMessageApi(COO_PRIVATE_KEY, req.body);
        res.json({receipt: txHash});
    } catch (e) {
        next(e);
    }
})

