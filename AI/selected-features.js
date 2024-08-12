const { PROMPTS } = require('./prompts');
require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});

function addLineBreaksAfterSemicolons(inputString) {
    return inputString.replace(/;/g, ';\n');
}

function cleanCode(code) {
    try {
    let data = code;

    data = data
    .replace(/\/\/n/g, '') // Remove all instances of //n
    .replace(/\/n/g, '')   // Remove all instances of /n
    .replace(/\\n/g, '')  // Replace escaped new lines with spaces
    .replace(/\\t/g, '')  // Replace escaped tabs with spaces
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
      
    return [JSON.parse(data), null];
    } catch (error) {
        console.log(error);
        return [null, 'Invalid parsed shit'];
    }
  }

const mapLinebreaks = (obj) => {
    try {
        const newObj = {};
        Object.entries(obj).forEach(([key, value]) => {
            newObj[key] = addLineBreaksAfterSemicolons(value);
        });
        return newObj;
    } catch (error) {
        console.log(error);
        return obj;
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

          const [code, error] = cleanCode(responseString);

          if(!error){
            const obj = code['code'];
            const newObj = mapLinebreaks(obj);
            code['code'] = newObj;
          }

          return {selectedFeaturesCode: code, error: error}
    } catch (error) {
        return {selectedFeaturesCode: null, error:error.toString()}
    }
}

module.exports = {getSelectedFeaturesCode}