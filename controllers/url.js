const shortid = require("shortid");
const URL =require('../MODELS/url');

async function handleUrl(req, res){

    const body = req.body;
    if(!body.url) return res.status(400).json({error : "url is required"})
    const shortingId = shortid.generate();
    try{
    
    await URL.create({
        shortId: shortingId,
        redirectURL: body.url,
        visithistory:[],
    });
    // console.log(redirectURL);
    return res.json({ id: shortingId});
}
catch(err){
    console.error("Error creating URL entry:", err);
    return res.status(500).json({error : "Internal error"});
}
}

module.exports = {handleUrl};