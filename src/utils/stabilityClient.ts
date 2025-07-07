// // utils/stabilityClient.ts
// import axios from 'axios';

// const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
// //const STABILITY_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0/text-to-image';
// const API_KEY = process.env.STABILITY_API_KEY;

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export async function generateImageFromStability(prompt: string, p0: { width: number; height: number; steps: number; guidance_scale: number; negative_prompt: string; }): Promise<Buffer> {
//   if (!API_KEY) {
//     throw new Error('STABILITY_API_KEY not set in environment');
//   }

//   const response = await axios.post(
//     STABILITY_API_URL,
//     {
//       text_prompts: [
//         { text: prompt, weight: 1 },
//         { text: "blurry, bad quality, distorted", weight: -1 },
//       ],
//       cfg_scale: 7,
//       height: 1024,
//       width: 1024,
//       steps: 30,
//       samples: 1,
//     },
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//         Authorization: `Bearer ${API_KEY}`,
//       },
//     }
//   );

//   const base64Image = response.data.artifacts?.[0]?.base64;
//   if (!base64Image) {
//     throw new Error('Image not returned from Stability AI');
//   }

//   return Buffer.from(base64Image, 'base64');
// }


// import axios from 'axios';

// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// export async function generateImageFromGemini(prompt: string): Promise<Buffer> {
//   if (!GEMINI_API_KEY) {
//     throw new Error('GEMINI_API_KEY is not set in environment');
//   }

//   const response = await axios.post(
//     `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
//     {
//       contents: [
//         {
//           parts: [{ text: prompt }]
//         }
//       ],
//       generationConfig: {
//         responseModalities: ["TEXT", "IMAGE"]
//       }
//     },
//     {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     }
//   );

//   // Check response structure
//   const imageBase64 = response.data?.candidates?.[0]?.image?.base64;

//   if (!imageBase64) {
//     throw new Error('Image not returned from Gemini');
//   }

//   return Buffer.from(imageBase64, 'base64');
// }

// import axios from 'axios';

// const GEMINI_IMAGE_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';
// const API_KEY = process.env.GEMINI_API_KEY!;

// export async function generateImageFromGemini(prompt: string): Promise<Buffer> {
//   const response = await axios.post(
//     `${GEMINI_IMAGE_API}?key=${API_KEY}`,
//     {
//       contents: [{
//         parts: [
//           { text: prompt }
//         ]
//       }],
//       generationConfig: {
//         responseModalities: ["TEXT", "IMAGE"]
//       }
//     },
//     {
//       headers: { 'Content-Type': 'application/json' }
//     }
//   );

//   const data = response.data;

//   const parts = data?.candidates?.[0]?.content?.parts;

//   if (!parts || parts.length < 2 || !parts[1].inlineData?.data) {
//     console.error("⚠️ Unexpected Gemini image response structure:", JSON.stringify(data, null, 2));
//     throw new Error("Image not returned from Gemini.");
//   }

//   const base64Image = parts[1].inlineData.data;
//   return Buffer.from(base64Image, 'base64');
// }


import axios from 'axios';

// Update the API endpoint to use the Imagen 4 equivalent model (imagen-3.0-generate-002)
// and the 'predict' endpoint which is specifically for image generation.
const IMAGEN_API_URL = process.env.IMAGEN_API_URL;

// const IMAGEN_API_URL  = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict';

// It's good practice to get the API key from environment variables.
// Ensure process.env.GEMINI_API_KEY is correctly set in your environment.
const API_KEY = process.env.GEMINI_API_KEY!;

/**
 * Generates an image using the Imagen 4 model from a given text prompt.
 * This function is updated to use the dedicated Imagen API structure.
 *
 * @param prompt The text description for the image to be generated.
 * @returns A Promise that resolves to a Node.js Buffer containing the image data,
 * or throws an error if generation fails or the response is unexpected.
 */
export async function generateImageFromGemini(prompt: string): Promise<Buffer> {
  console.log(`[Imagen 4 API] Requesting image for prompt: "${prompt}"`);

  try {
    const response = await axios.post(
      `${IMAGEN_API_URL}?key=${API_KEY}`,
      {
        // Imagen API expects 'instances' with a 'prompt' property
        instances: {
          prompt: prompt
        },
        // You can add parameters like sampleCount if you want more than one image
        parameters: {
          sampleCount: 1 // Requesting one image
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        // If you want to handle the response as an ArrayBuffer for direct Buffer creation,
        // you might add responseType: 'arraybuffer', but axios handles base64 string
        // conversion to Buffer automatically if type is 'text' and encoding is 'base64'
      }
    );

    const data = response.data;

    // The image data for Imagen models is found in predictions[0].bytesBase64Encoded
    const base64Image = data?.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      console.error("⚠️ Unexpected Imagen 4 image response structure:", JSON.stringify(data, null, 2));
      throw new Error("Image not returned from Imagen 4 API.");
    }

    console.log("[Imagen 4 API] Image generated successfully, converting to Buffer.");
    // Convert the base64 string directly to a Node.js Buffer
    return Buffer.from(base64Image, 'base64');

  } catch (error: any) {
    // Log the full error response from Axios if available
    console.error('[Imagen 4 API Error]:', error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw new Error('Failed to generate image from Imagen 4 API. Please check the prompt and API key permissions.');
  }
}