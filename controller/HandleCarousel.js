const carouselImages = require('../Mongo/CarouselTemp.json')
const getCarouselImage = async (req, res) => {
    try {
        res.status(200).send({ dataList: carouselImages })
    } catch {
        e => {

        }
    }
}


module.exports = {
    getCarouselImage
}