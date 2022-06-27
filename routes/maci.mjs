import {deployPollTs} from "../quad-voting-maci/contracts/build/contracts/ts/deployPollTs.js";
// import {deployPoll} from "../quad-voting-maci/cli/build/deployPoll.js";

import express from "express";
export let maciRouter = express.Router();

maciRouter.put('/createpoll', function(req, res, next) {
    JSON.parse(req.body).then(function(json) {
        deployPollTs(null, null, json)
         // let verifierAddress, pptAddress, pollAddress = deployPollTs(ethers., maciAddr, json)
        })
})