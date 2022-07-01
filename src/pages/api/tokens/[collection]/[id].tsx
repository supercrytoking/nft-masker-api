import axios from 'axios'
import request from 'request'
import Web3 from 'web3'
import collections from '../../../../data/collections.json'
import { erc721 } from '../../../../data/abis'

export const ipfsGateway = 'https://ftmdead.mypinata.cloud/ipfs/'
export const imageUrl = (string = "") => {
    string = string.replace('ipfs://', ipfsGateway)
    string = string.replace('https://ipfs.io/ipfs/', ipfsGateway)
    string = string.replace('https://ipfs.io/ipfs/', ipfsGateway)
    string = string.replace('https://gateway.pinata.cloud/ipfs/', ipfsGateway)
    return string
}


const isMinted = async (contractAddress, id) => {
    const web3 = new Web3('https://rpc.ankr.com/fantom')
    const contract = new web3.eth.Contract(erc721, contractAddress)
    try {
        const _isMinted = await contract.methods.ownerOf(id).call()
        return true
    } catch (error) {
        return false
    }
}


const endpoint = async (req, res) => {
    try {
        const fullUrl = `https://${req.headers.host}`
        const { collection, id: idFromQuery, get } = req.query
        let id = idFromQuery

        const thisCollection = collections.find((c) => c.name === collection)

        const isRequestingImage = ['.png', '.gif', '.jpeg', '.jpg'].some((ext) => id.toLowerCase().endsWith(ext))
        if (isRequestingImage) id = id.split('.')[0]

        const minted = await isMinted(thisCollection.contract, id)
        if (!minted) {
            const hiddenImage = `${fullUrl}/img/question-mark.gif`
            if (isRequestingImage) return request(hiddenImage).pipe(res)
            return res.json({ name: 'Unknown', image: hiddenImage })
        }

        const url = `${thisCollection.metadata}/${id}`
        const { data } = await axios.get(url)

        // Get image extensions from image URI and/or config.
        const extTest = /(?:\.([^.]+))?$/
        const ext = thisCollection.ext || extTest.exec(data.image)[1]

        if (isRequestingImage) return request(imageUrl(data.image)).pipe(res)

        data.image = `${fullUrl}/api/tokens/${collection}/${id}.${ext}`
        res.json(data)
    } catch (error) {
        console.log(error)
        res.status(500).send(error.message)
    }
}

const allowCors = (fn) => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }
    fn(req, res)
}

export default allowCors(endpoint)
