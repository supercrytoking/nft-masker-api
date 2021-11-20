import collections from '../../../../data/collections.json'
import axios from 'axios'
import request from 'request'
import Web3 from 'web3'
import { erc721 } from '../../../../data/abis'

const isMinted = async (contractAddress, id) => {
    const web3 = await new Web3('https://rpc.ftm.tools')
    const contract = await new web3.eth.Contract(erc721, contractAddress)
    try {
        const _isMinted = await contract.methods.ownerOf(id).call()
        return true
    } catch (error) {
        return false
    }
}

export default async function endpoint(req, res) {
    try {
        const { collection, id, get } = req.query

        const thisCollection = collections.find((c) => c.name === collection)
        const fullUrl = `http://${req.headers.host}`

        const contractAddress = thisCollection.contract

        const minted = await isMinted(contractAddress, id)

        if (!minted) {
            const hiddenImage = 'https://i.imgur.com/V2RKCJW.png'
            if (get === 'image') return request(hiddenImage).pipe(res)
            return res.json({ name: 'Hidden!', image: hiddenImage })
        }

        const url = `${thisCollection.metadata}/${id}`

        const { data } = await axios.get(url)
        if (get === 'image.png') return request(data.image).pipe(res)
        data.image = `${fullUrl}/api/tokens/${collection}/${id}?get=image.png`
        res.json(data)
    } catch (error) {
        // console.log(error)
        res.status(500).send(error.message)
    }
}
