import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

// Feature 1: SuperCam Science Lab Spectrometry Analysis
export async function generateScienceReport(targetName, targetType, coords) {
  if (!API_KEY) return null;
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  You are an expert NASA Astrobiologist and Geologist analyzing SuperCam laser ablation data from the surface of Mars.
  
  Context:
  - Target Name: ${targetName}
  - Target Type: ${targetType}
  - Coordinates: ${coords.lat.toFixed(4)}°N, ${coords.lon.toFixed(4)}°E
  
  Write a highly scientific, realistic, and concise JSON report (strictly valid JSON) describing the telemetry results. 
  It must include:
  {
    "mineralogy": "A realistic comma-separated list of minerals found (e.g. 'Olivine, Pyroxene, Smectite clays')",
    "phLevel": 7.4, // estimated ancient pH
    "biosignatureProbability": 12, // integer 0-100%
    "analysisNotes": "A 2-3 sentence engaging scientific summary of what this means for ancient habitability."
  }
  
  Respond ONLY with the JSON string, no markdown blocks.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Science Report Error:", error);
    return null;
  }
}

// Feature 2: Route Hazard Analysis
export async function generateFlightBrief(waypoints, distance, weatherInfo) {
  if (!API_KEY) return null;
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const startPoint = waypoints[0]?.name || "Base";
  const endPoint = waypoints[waypoints.length - 1]?.name || "Destination";
  const points = waypoints.map(w => w.name).join(' -> ');

  const prompt = `
  You are the AI Mission Commander for the NASA MarsWalk Explorer program. 
  Generate a concise, official, and highly realistic flight briefing (in Markdown) for a planned EVA route.
  
  Mission Details:
  - Route: ${startPoint} to ${endPoint}
  - Path: ${points}
  - Total Traverse Distance: ${distance.toFixed(1)} km
  - Current Weather: ${weatherInfo}
  
  The briefing should have:
  1. Executive Summary
  2. Terrain & Hazard Assessment (make up realistic geological challenges like 'dust pockets' or 'steep crater rims' based on the distance)
  3. Radiation & Life Support constraints
  4. Final Go/No-Go Recommendation
  
  Keep it engaging, urgent, and professional (around 200-250 words).`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Flight Brief Error:", error);
    return null;
  }
}

// Feature 3: Mission Control Chat Terminal
export async function chatWithMissionControl(message, history, appState) {
  if (!API_KEY) return null;
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `
  You are 'A.R.E.S.', the autonomous AI Mission Control for the NASA MarsWalk Explorer program.
  You communicate concisely, like a professional flight controller. 
  You have access to the following live telemetry from the user's dashboard:
  - Current View Mode: ${appState.viewMode}
  - Current Mars Sol: ${appState.currentSol}
  - Rover Location: ${appState.cursorPosition?.lat?.toFixed(2)}°N, ${appState.cursorPosition?.lon?.toFixed(2)}°E
  
  Answer the astronaut's query using this context. Keep responses under 3-4 sentences. Be helpful but immersive.
  `;

  try {
    let apiHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Gemini API strict requirement: History must start with a 'user' role.
    // Our UI starts with a fake 'model' greeting, so we must remove it from the API context.
    if (apiHistory.length > 0 && apiHistory[0].role === 'model') {
      apiHistory.shift();
    }

    const chat = model.startChat({
      history: apiHistory,
      systemInstruction: { parts: [{ text: systemInstruction }] }
    });

    const result = await chat.sendMessage([{ text: message }]);
    return result.response.text();
  } catch (error) {
    console.error("AI Chat Error:", error);
    return `CONNECTION LOST: ${error.message || 'Unknown API Error'}`;
  }
}
