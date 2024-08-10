const { PROMPTS } = require('./prompts');
require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});

function stringParser(data, fallBackData = null) {
    try {
        // Remove newline characters and escaped double quotes
        let cleanedData = data.replace(/\\n/g, '').replace(/\\"/g, '"');
        
        // Ensure all single quotes are converted to double quotes
        cleanedData = cleanedData.replace(/'/g, '"');
        
        // Add quotes around unquoted keys
        cleanedData = cleanedData.replace(/(\w+):/g, '"$1":');
        
        // Parse the cleaned data into JSON
        return JSON.parse(cleanedData);
    } catch (error) {
        console.error('Error processing the data:', error);
        return fallBackData;  // or you can throw the error if you prefer
    }
}

// get user prompt shit

const getFeatures = async (prompt) => {
    try {
        if(typeof prompt !== 'string') {
            return {listOfFeatures: [], error:'Invalid params'};
        }
    
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: PROMPTS.getFeaturesList
                },
                {
                    role: "user",
                    content: `The prompt is : ${prompt}`
                }
            ]
            ,
            model: "gpt-3.5-turbo",
          });

          const responseString = completion.choices[0].message.content;
          const parsedData = stringParser(responseString, []);
          
          return {listOfFeatures: parsedData, error: null}
    } catch (error) {
        return {listOfFeatures: [], error:error.toString()}
    }
}

module.exports = {getFeatures, stringParser}