import {redisClient} from "../app.mjs"
import {conf} from "../config.mjs";
import express from "express";

import {mergeSignups} from "../quad-voting-maci/cli/build/mergeSignupsApi.js";
import {mergeMessages} from "../quad-voting-maci/cli/build/mergeMessagesAPI.js";
import {genProofs} from "../quad-voting-maci/cli/build/genProofsApi.js";
import {proveOnChain} from "../quad-voting-maci/cli/build/proveOnChainApi.js";
import {deployPollApi} from "../quad-voting-maci/cli/build/deployPollApi.js";


export let cooRouter = express.Router();

const NUM_OF_QUEUE_OPS = 4

cooRouter.post('/createpoll', async function (req, res, next) {
    try {
        if (req.body.vote_options.length > req.body.max_vote_options) {
            throw new Error("the number of given vote options is greater than the allowed max length")
        }
        let [pollID, pollAddr, pptAddr, verifierAddr] = await deployPollApi(conf.MACI_ADDRESS, req.body);
        let resJson = {
            poll_name: req.body.poll_name,
            pollID: pollID,
            pollAddr: pollAddr,
            pptAddr: pptAddr,
            verifierAddr: verifierAddr,
            description: req.body.description,
            vote_options: req.body.vote_options
        }
        await redisClient.lPush('polls', JSON.stringify(resJson), (err, reply) => {
            if (err) {
                console.error("Failed to add poll to db", err)
                throw new Error(err);
            }
        })
        await redisClient.set(`poll${pollID}`, JSON.stringify(resJson), (err, reply) => {
            if (err) {
                console.error("Failed to add poll to db", err)
                throw new Error(err);
            }
        })

        res.json(resJson);
    } catch (e) {
        next(e);
    }
});

cooRouter.get('/prove', async function (req, res, next) {
    try {
        if (!req.query) {
            throw new Error('No Poll Id is given')
        }
        const pollID = Number(req.query.poll_id)
        const mergeOps = {maci_address: conf.MACI_ADDRESS, poll_id: pollID, num_queue_ops: NUM_OF_QUEUE_OPS};
        console.log("merging messages")
        let reciept = await mergeMessages(mergeOps)
        if (!reciept) {
            throw new Error("merge state tree failed")
        }
        console.log("merging signups")
        reciept = await mergeSignups(mergeOps)
        if (!reciept) {
            throw new Error("merge message tree failed")
        }

        const genProofsOps = {
            coo_sk: conf.COO_PRIVATE_KEY,
            maci_address: conf.MACI_ADDRESS,
            poll_id: pollID,
            rapidsnark: conf.RAPIDSNARK,
            use_subsidy: false, // TODO maybe change

            //witness gens
            process_witnessgen: `../quad-voting-maci/.zkeys/process_witnessgen_poll_${pollID}`,
            tally_witnessgen: `../quad-voting-maci/.zkeys/tally_witnessgen_poll_${pollID}`,
            subsidy_witnessgen: `../quad-voting-maci/.zkeys/subsidy_witnessgen_poll_${pollID}`,

            //zkeys
            process_zkey: conf.PROCESS_ZKEY,
            tally_zkey: conf.TALLY_ZKEY,
            subsidy_zkey: conf.SUBSIDY_ZKEY,

            //Optional
            maci_tx_hash: ""

        }
        console.log("generating proofs")
        const proofs = await genProofs(genProofsOps);
        await redisClient.set('tally_poll${pollID}', JSON.stringify(proofs.tallyData))
        const pollJson = await redisClient.get('poll${pollID}');
        const pptAddr = JSON.parse(pollJson).pptAddr


        console.log("proove on chain")
        const proveOpts = {
            maci_address: conf.maciAddress,
            poll_id: pollID,
            ppt: pptAddr,
            process_proofs: proofs.processProofs,
            tallyProofs: proofs.processProofs,
            subsidy_proofs: proofs.subsidy_proofs,
            tally_proofs: proofs.tallyProofs
        };
        res.boolean = await proveOnChain(proveOpts)
    }
    catch(e) {
        console.error("something bad happened while proving a message", e)
        next(e)
    }
})
