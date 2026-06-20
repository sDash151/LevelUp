import dotenv from 'dotenv';
dotenv.config();
const { projectsAI } = await import('./src/modules/projects/projects.ai.js');

const mockProjects = [
  { id: '1', title: 'Algorithm Visualizer', stack: ['C++', 'React'], description: 'Visualizes algorithms' },
  { id: '2', title: 'Machine Learning API', stack: ['Python', 'FastAPI'], description: 'ML model hosting' },
  { id: '3', title: 'Streaming Data Pipeline', stack: ['Kafka', 'Java'], description: 'Data processing' },
];

async function run() {
  console.log('API KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
  console.log('Testing matchProjectsToJob with "PYTHON DEVELOPER"...');
  try {
    const result = await projectsAI.matchProjectsToJob(mockProjects, 'PYTHON DEVELOPER');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
