const codeFormat = JSON.stringify({
    id: 0,
    name: "schemaName",
    code: {
        subFeature: `code for subfeature in string with line breaks (initializing code for express only in first subfeature, and the routes code in the remaining subfeatures)`,
    },
    schema: 'Code for mongodb schema and mongoose initialization'
})

const PROMPTS = {
    getFeaturesList: `Generate a list of small basic features only (dont include linebreaks) (only 6) for any provided prompt in an array of objects format with the keys (id, label) only. If the prompt is unrelated, unintelligible, or not relevant, return an empty array`,
    getSelectedFeaturesSystem: `You are a no code backend code generator for Node.js, Express.js, and MongoDB you will be given a feature for a backend code base, generate all necessary code for it exactly in the format ${codeFormat}, each key in the code object will be named after the subfeature, also don't include code comments`,
    getSelectedFeaturesUser: (feature) => `The feature is (${feature}), make sure to include at least CRUD operations for the feature, and all the keys in code objects should be named after each subfeature`
}

module.exports = {PROMPTS};