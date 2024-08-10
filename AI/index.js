// combine all shit here
const { getSelectedFeaturesCode } = require('./selected-features');
const { getFeatures } = require('./user-prompt');

const responseParser = (data = null, error = null, status = false) => ({
    data,
    error,
    status
})

const handleGetFeaturesList = async (request) => {
    try {
        const {prompt} = request.body;

        const {listOfFeatures, error} = await getFeatures(prompt);

        return responseParser(listOfFeatures, error, !!listOfFeatures.length);
    } catch (error) {
        return responseParser(null, error.toString(), false);
    }
}

const handleGetSelectedFeaturesCode = async (request) => {
    try {
        const {selectedFeatureList} = request.body;

        if(selectedFeatureList.length > 2) return responseParser(null, 'Limit exceeded (only 2 allowed)', false);

        const res = [];

        for(let i = 0; i < selectedFeatureList.length; i++){
            const {selectedFeaturesCode, error} = await getSelectedFeaturesCode(selectedFeatureList[i].label);
            if(error) continue;
            res.push(selectedFeaturesCode);
        }

        return responseParser(res, null, true);
    } catch (error) {
        return responseParser(null, error.toString(), false);
    }
}

module.exports = {handleGetFeaturesList, handleGetSelectedFeaturesCode};