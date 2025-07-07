
// import axios from 'axios';
// import config from '../config/env';

// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// export async function generatePostWithGemini(prompt: string): Promise<Record<string, string>> {
//   try {
//     const response = await axios.post(
//       `${GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             parts: [{ text: prompt }]
//           }
//         ]
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );

//     let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

//     // Remove markdown formatting if exists
//     text = text.replace(/```json|```/g, '').trim();
    
//     const parsed = JSON.parse(text);

//     // Validate structure
//     if (
//       typeof parsed.variant1 === 'string' &&
//       typeof parsed.variant2 === 'string' &&
//       typeof parsed.variant3 === 'string'
//     ) {
//       return parsed;
//     } else {
//       throw new Error('Gemini response missing required variants');
//     }

//   } catch (error: any) {
//     console.error('[Gemini API Error]:', error.response?.data || error.message);
//     throw new Error('Failed to generate content from Gemini API.');
//   }
// }

// import axios from 'axios';
// import config from '../config/env';

// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// export async function chatWithGemini(prompt: string): Promise<string> {
//   try {
//     const response = await axios.post(
//       `${GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             parts: [{ text: prompt }]
//           }
//         ]
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );

//     const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
//     return text?.trim() || 'Sorry, I didn’t get that.';

//   } catch (error: any) {
//     console.error('[Gemini API Error]:', error.response?.data || error.message);
//     throw new Error('Failed to chat with Gemini API.');
//   }
// }


import axios from 'axios';
import config from '../config/env';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Initial instruction for conversational mode
const SYSTEM_PROMPT = `
You are a helpful and friendly AI assistant. 
You only respond conversationally to user questions. 
Avoid taking any actions like applying rules, generating code, or modifying data.
Just have a simple, friendly conversation with the user and answer their questions clearly.
`;

export async function chatWithGemini(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || 'Sorry, I didn’t get that.';
  } catch (error: any) {
    console.error('[Gemini API Error]:', error.response?.data || error.message);
    throw new Error('Failed to chat with Gemini API.');
  }
}
