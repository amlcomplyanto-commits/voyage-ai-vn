import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";

let _ai: GoogleGenAI | null = null;
export function getGemini() {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}

export async function askTravelAssistant(prompt: string, options?: { imageBase64?: string, imageMime?: string, activeTrip?: any }) {
  const ai = getGemini();
  const prefs = storage.getPrefs();
  const trips = storage.getTrips();
  
  let systemInstruction = `You are a helpful travel assistant called VoyageAI. 
Your primary job is to help users plan trips, recommend places, and organize itineraries. 
The user has the following preferences:
Interests: ${prefs.interests.join(', ')}.
Food preferences: ${prefs.food.join(', ')}.
Currently planned trips: ${JSON.stringify(trips.map(t => ({ dest: t.destination, dates: t.startDate + ' to ' + t.endDate })))}
`;

  if (options?.activeTrip) {
    systemInstruction += `
The user is currently focusing on their trip to ${options.activeTrip.destination}. 
Trip details: ${options.activeTrip.notes || 'N/A'}
Dates: ${new Date(options.activeTrip.startDate).toLocaleDateString()} to ${new Date(options.activeTrip.endDate).toLocaleDateString()}
Itinerary: ${JSON.stringify(options.activeTrip.itinerary)}

When answering, prioritize recommendations and context relevant to this specific trip, including locations, activities currently on their itinerary, and travel logistics in ${options.activeTrip.destination}.`;
  }

  systemInstruction += `\n\nBe concise and helpful. Recommend places that make sense. Format output using markdown for readability.`;

  try {
    const contents: any[] = [];
    if (options?.imageBase64 && options?.imageMime) {
      contents.push({
        inlineData: {
          data: options.imageBase64,
          mimeType: options.imageMime
        }
      });
    }
    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contents },
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I couldn't reach the AI at the moment. Please check your connection or wait a bit.";
  }
}

export async function generateExploreSuggestions(location: string, category: string, limit = 20): Promise<any[]> {
  const ai = getGemini();

  const isCoordinates = location.startsWith("My Location:");
  const locationInstruction = isCoordinates 
    ? `The user is at coordinates: ${location.replace("My Location:", "").trim()}. Suggest places that are physically near these coordinates.`
    : `The user is looking for places in "${location}".`;

  const systemInstruction = `You are a localized tour guide and expert. The user wants the top ${limit} recommendations for "${category}".
${locationInstruction}
Generate exactly ${limit} items. Make sure they are real, popular places.
Output valid JSON matching this schema:
[
  {
    "id": "unique-id",
    "name": "Place Name",
    "type": "Short description (e.g. 'Cafe', 'Museum', 'Park')",
    "rating": 4.5,
    "distance": "random realistic distance from the location e.g. '1.2 km'",
    "image": "a relevant high quality unsplash image URL for this place"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { role: "user", parts: [{ text: `Get top ${limit} ${category} considering this location: ${location}` }] },
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response");
    
    text = text.replace(/```[a-z]*\n?/, '').replace(/```\n?$/, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error generating explore suggestions:", error);
    return [];
  }
}

export async function generateTripPlan(prompt: string): Promise<any> {
  const ai = getGemini();
  const prefs = storage.getPrefs();

  const systemInstruction = `You are an expert travel planner. Generate a detailed, day-by-day travel itinerary based on the user's prompt.
Factor in these preferences if applicable: Interests (${prefs.interests.join(',')}), Food (${prefs.food.join(',')}).
You MUST output valid JSON matching the following schema perfectly. Make sure dates are valid ISO strings (from today onwards if specific dates are not provided).
Assume today is ${new Date().toISOString()}.
Image URLs should be high quality unsplash image URLs relevant to the destination.

Schema:
{
  "destination": "City, Country",
  "startDate": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "endDate": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "coverImage": "https://images.unsplash.com/photo-...",
  "notes": "A brief overview of the trip",
  "itinerary": [
    {
      "date": "YYYY-MM-DDTHH:mm:ss.sssZ",
      "activities": [
        {
          "id": "unique-id",
          "title": "Activity Name",
          "time": "HH:MM",
          "type": "activity",
          "location": "Location name",
          "notes": "Details"
        }
      ]
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { role: "user", parts: [{ text: prompt }] },
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response");
    
    // Strip markdown code blocks if present
    text = text.replace(/```[a-z]*\n?/, '').replace(/```\n?$/, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error generating trip:", error);
    throw error;
  }
}

