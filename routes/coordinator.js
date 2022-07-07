import {redisClient} from "../app.mjs"
import config from "config";
import express from "express";

import {mergeSignups} from "../quad-voting-maci/cli/build/mergeSignupsApi";
import {mergeMessages} from "../quad-voting-maci/cli/build/mergeMessagesAPI";
import {genProofs} from "../quad-voting-maci/cli/build/genProofsApi";
import {proveOnChain} from "../quad-voting-maci/cli/build/proveOnChainApi";

export let cooRouter = express.Router();

const NUM_OF_QUEUE_OPS = 4

cooRouter.post('/createpoll', async function (req, res, next) {
    try {
        if (req.body.vote_options.length > req.body.max_vote_options) {
            throw new Error("the number of given vote options is freater than the allowed max length")
        }
        let [pollID, pollAddr, pptAddr, verifierAddr] = await deployPollApi(MACI_ADDRESS, req.body);
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
        const pollID = number(req.query)
        const mergeOps = {maci_address: config.MACI_ADDRESS, poll_id: pollID, num_queue_ops: NUM_OF_QUEUE_OPS};
        let reciept = await mergeSignups(mergeOps)
        if (!reciept) {
            throw new Error("merge state tree failed")
        }
        reciept = await mergeMessages(mergeOps)
        if (!reciept) {
            throw new Error("merge message tree failed")
        }

        const genProofsOps = {
            coo_sk: config.COO_PRIVATE_KEY,
            maci_address: config.MACI_ADDRESS,
            poll_id: pollID,
            rapidsnark: config.RAPIDSNARK,
            use_subsidy: false, // TODO maybe change

            //witness gens
            process_witnessgen: `../quad-voting-maci/.zkeys/process_witnessgen_poll_${pollID}`,
            tally_witnessgen: `../quad-voting-maci/.zkeys/tally_witnessgen_poll_${pollID}`,
            subsidy_witnessgen: `../quad-voting-maci/.zkeys/subsidy_witnessgen_poll_${pollID}`,

            //zkeys
            process_zkey: config.PROCESS_ZKEY,
            tally_zkey: config.TALLY_ZKEY,
            subsidy_zkey: config.SUBSIDY_ZKEY,

            //Optional
            maci_tx_hash: ""

        }
        const proofs = await genProofs(genProofsOps);
        await redisClient.set('tally_poll${pollID}', JSON.stringify(proofs.tallyData))
        const pollJson = await redisClient.get('poll${pollID}');
        const pptAddr = JSON.parse(pollJson).pptAddr


        const proveOpts = {
            maci_address: config.maciAddress,
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
        console.error("something bad happened while proving a message")
        next(e)
    }
})
