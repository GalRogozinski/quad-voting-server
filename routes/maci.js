// import {deployPollTs} from "../quad-voting-maci/contracts/build/contracts/ts/deployPollTs";
import {deployPoll} from "../quad-voting-maci/cli/build/deployPoll.js";

const { ethers } = require('hardhat')

var express = require('express');
export let maciRouter = express.Router();

maciRouter.put('/createpoll', function(req, res, next) {
    JSON.parse(req.body).then(function(json) {
        deployPoll(json)
         // let verifierAddress, pptAddress, pollAddress = deployPollTs(ethers., maciAddr, json)
        })
})

module.exports = maciRouter;
