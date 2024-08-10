const { PROMPTS } = require('./prompts');
require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});

function cleanCode(code) {
    try {
    let data = code;

    data = data
    .replace(/\/\/n/g, '') // Remove all instances of //n
    .replace(/\/n/g, '')   // Remove all instances of /n
    .replace(/\\n/g, '')  // Replace escaped new lines with spaces
    .replace(/\\t/g, '')  // Replace escaped tabs with spaces
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
      
    return JSON.parse(data)
    } catch (error) {
        console.log(error);
        return code;
    }
  }

const getSelectedFeaturesCode = async (selectedFeature) => {
    try {
        if(typeof selectedFeature !== 'string') {
            return {selectedFeaturesCode: null, error:'Invalid params'};
        }
    
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: PROMPTS.getSelectedFeaturesSystem
                },
                {
                    role: "user",
                    content: PROMPTS.getSelectedFeaturesUser(selectedFeature)
                }
            ]
            ,
            model: "gpt-3.5-turbo",
          });

          const responseString = completion.choices[0].message.content;

          return {selectedFeaturesCode: cleanCode(responseString), error: null}
    } catch (error) {
        return {selectedFeaturesCode: null, error:error.toString()}
    }
}

module.exports = {getSelectedFeaturesCode}